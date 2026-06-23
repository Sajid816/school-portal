import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { db } from '../firebase';
import { doc, writeBatch, collection, getDocs, deleteDoc, setDoc, getDoc, addDoc } from 'firebase/firestore';

function Admin() {
  const [students, setStudents] = useState([]);
  const [galleryImages, setGalleryImages] = useState([]);
  const [file, setFile] = useState(null);
  const [currentTicker, setCurrentTicker] = useState('');
  const [isUpdatingTicker, setIsUpdatingTicker] = useState(false);
  
  // Content Uploader State
  const [imageUrl, setImageUrl] = useState('');
  const [contentTitle, setContentTitle] = useState('');
  const [destination, setDestination] = useState('gallery');
  const [targetClass, setTargetClass] = useState('Playgroup');
  const [targetSection, setTargetSection] = useState('A');
  const [isUploadingContent, setIsUploadingContent] = useState(false);

  const classes = ["Playgroup", "Nursery", "KG", "KG 1", "KG 2", "KG 3", "KG 4", "KG 5"];

  useEffect(() => { 
    fetchStudents(); 
    fetchCurrentTicker();
    fetchGallery();
  }, []);

  const fetchStudents = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const list = querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(user => user.role === 'student')
        .sort((a, b) => (a.class || "").localeCompare(b.class) || (a.section || "").localeCompare(b.section));
      setStudents(list);
    } catch (err) { console.error(err); }
  };

  const fetchCurrentTicker = async () => {
    try {
      const docSnap = await getDoc(doc(db, "settings", "ticker"));
      if (docSnap.exists()) { setCurrentTicker(docSnap.data().message || ''); }
    } catch (err) { console.error(err); }
  };

  const fetchGallery = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "gallery"));
      setGalleryImages(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) { console.error(err); }
  };

  const handleTickerUpdate = async (e) => {
    e.preventDefault();
    setIsUpdatingTicker(true);
    try {
      await setDoc(doc(db, "settings", "ticker"), {
        message: e.target.tickerText.value,
        lastUpdated: new Date().toISOString()
      });
      alert("News ticker updated successfully!");
    } catch (error) { alert("Failed to update ticker."); }
    finally { setIsUpdatingTicker(false); }
  };

  const handleContentUpload = async (e) => {
    e.preventDefault();
    if (!imageUrl) return alert("Please provide an image URL.");
    setIsUploadingContent(true);

    try {
      if (destination === 'gallery') {
        await addDoc(collection(db, "gallery"), {
          url: imageUrl,
          caption: contentTitle || "Gallery Image",
          uploadedAt: new Date().toISOString()
        });
        alert("Added to Gallery successfully!");
        fetchGallery();
      } else if (destination === 'teachers') {
        // Teacher info linked to a specific class and section slot
        const teacherDocId = `${targetClass}_${targetSection}`;
        await setDoc(doc(db, "teachers", teacherDocId), {
          teacherName: contentTitle,
          photoUrl: imageUrl,
          class: targetClass,
          section: targetSection,
          lastUpdated: new Date().toISOString()
        });
        alert(`Teacher updated for ${targetClass} - Section ${targetSection}!`);
      } else {
        // Fallback placeholder destination route (Admissions, etc.)
        await addDoc(collection(db, destination), {
          url: imageUrl,
          title: contentTitle,
          uploadedAt: new Date().toISOString()
        });
        alert(`Content successfully linked to ${destination}!`);
      }
      setImageUrl('');
      setContentTitle('');
    } catch (error) {
      console.error(error);
      alert("Failed to link image destination.");
    } finally {
      setIsUploadingContent(false);
    }
  };

  const handleDeleteImage = async (id) => {
    if (window.confirm("Remove this image from the gallery?")) {
      await deleteDoc(doc(db, "gallery", id));
      fetchGallery();
    }
  };

  const deleteStudent = async (email) => {
    if (window.confirm("Delete this student permanently?")) {
      await deleteDoc(doc(db, "users", email));
      fetchStudents();
    }
  };

  const processCSV = () => {
    if (!file) return alert("Please select a file first.");
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const batch = writeBatch(db);
        results.data.forEach(row => {
          if (row.email) {
            batch.set(doc(db, "users", row.email), {
              fullName: row.fullName,
              role: row.role,
              roll: row.roll,
              class: row.class,
              section: row.section,
              email: row.email
            });
          }
        });
        await batch.commit();
        alert("Sync complete!");
        fetchStudents();
      }
    });
  };

  return (
    <div style={{ padding: '40px', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h1>Admin Panel</h1>
      
      {/* 1. Universal Website Content Linker Form with Instructions */}
      <div className="glass-notice-box" style={{ color: '#333', marginBottom: '20px', width: '100%', maxWidth: '900px', padding: '30px' }}>
        <h3>Universal Website Content & Image Manager</h3>
        
        <blockquote style={{ background: 'rgba(0,0,0,0.05)', padding: '15px', borderRadius: '6px', borderLeft: '4px solid #0056b3', margin: '0 0 20px 0', fontSize: '0.95rem', lineHeight: '1.5' }}>
          <strong>Instructions for uploading files:</strong><br/>
          1. Open <a href="https://postimages.org" target="_blank" rel="noreferrer" style={{ color: '#0056b3', fontWeight: 'bold', decoration: 'underline' }}>Postimages (https://postimages.org)</a> in a new tab.<br/>
          2. Upload your school image or teacher profile picture.<br/>
          3. Once uploaded, copy the <strong>Direct Link</strong> (the URL must end directly in <code>.jpg</code> or <code>.png</code>).<br/>
          4. Paste that link into the field below, choose where it belongs, and click Save.
        </blockquote>

        <form onSubmit={handleContentUpload} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input 
              type="text" 
              className="glass-input" 
              style={{ flex: 2, margin: 0 }} 
              placeholder="Paste Direct Image URL (e.g., https://i.postimg.cc/xyz/pic.jpg)" 
              value={imageUrl} 
              onChange={(e) => setImageUrl(e.target.value)} 
              required 
            />
            <input 
              type="text" 
              className="glass-input" 
              style={{ flex: 1, margin: 0 }} 
              placeholder="Name / Title / Caption" 
              value={contentTitle} 
              onChange={(e) => setContentTitle(e.target.value)} 
              required 
            />
          </div>

          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <label style={{ fontWeight: 'bold' }}>Route Destination:</label>
            <select className="glass-input" style={{ margin: 0, width: '200px' }} value={destination} onChange={e => setDestination(e.target.value)}>
              <option value="gallery">Photo Gallery</option>
              <option value="teachers">Teachers Directory</option>
              <option value="admissions">Admissions Info Page</option>
            </select>

            {/* Show class filters conditionally if the Admin selects Teachers destination */}
            {destination === 'teachers' && (
              <>
                <select className="glass-input" style={{ margin: 0 }} value={targetClass} onChange={e => setTargetClass(e.target.value)}>
                  {classes.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select className="glass-input" style={{ margin: 0, width: '120px' }} value={targetSection} onChange={e => setTargetSection(e.target.value)}>
                  <option value="A">Section A</option>
                  <option value="B">Section B</option>
                </select>
              </>
            )}
          </div>

          <button type="submit" className="login-btn" style={{ margin: 0, width: '200px' }} disabled={isUploadingContent}>
            {isUploadingContent ? "Linking..." : "Save to Website"}
          </button>
        </form>

        {/* Live Gallery Panel Preview */}
        {destination === 'gallery' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '15px', marginTop: '20px', borderTop: '1px solid #ccc', paddingTop: '20px' }}>
            {galleryImages.map(img => (
              <div key={img.id} style={{ position: 'relative', border: '1px solid #ccc', borderRadius: '8px', padding: '5px', background: '#fff' }}>
                <img src={img.url} alt={img.caption} style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '4px' }} />
                <p style={{ fontSize: '0.8rem', margin: '5px 0 0 0', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{img.caption}</p>
                <button 
                  onClick={() => handleDeleteImage(img.id)} 
                  style={{ position: 'absolute', top: '5px', right: '5px', background: 'rgba(219, 83, 79, 0.9)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '2px 6px', fontSize: '0.75rem' }}
                >
                  X
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. Ticker Management Box */}
      <div className="glass-notice-box" style={{ color: '#333', marginBottom: '20px', width: '100%', maxWidth: '900px' }}>
        <h3>Update News Ticker Message</h3>
        <form onSubmit={handleTickerUpdate}>
          <input type="text" name="tickerText" className="glass-input" defaultValue={currentTicker} placeholder="Type live banner announcement here..." required />
          <button type="submit" className="login-btn" disabled={isUpdatingTicker} style={{ marginTop: '5px' }}>
            {isUpdatingTicker ? "Publish Live Message" : "Publish Live Message"}
          </button>
        </form>
      </div>

      {/* 3. Bulk Upload Section */}
      <div className="glass-notice-box" style={{ color: '#333', marginBottom: '40px', width: '100%', maxWidth: '900px' }}>
        <h3>Bulk Upload Students</h3>
        <p>Ensure your CSV has columns: <b>email, fullName, role, roll, class, section</b></p>
        <input type="file" accept=".csv" onChange={(e) => setFile(e.target.files[0])} style={{ color: '#000', marginBottom: '10px' }} />
        <button onClick={processCSV} className="login-btn">Upload & Sync</button>
      </div>

      {/* 4. Student List Table */}
      <div className="glass-notice-box" style={{ color: '#333', padding: '30px', width: '100%', maxWidth: '900px' }}>
        <h3>Active Students</h3>
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 10px' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '2px solid #ccc' }}>
              <th style={{ padding: '10px' }}>Name</th>
              <th style={{ padding: '10px' }}>Roll</th>
              <th style={{ padding: '10px' }}>Class</th>
              <th style={{ padding: '10px' }}>Section</th>
              <th style={{ padding: '10px' }}>Email</th>
              <th style={{ padding: '10px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {students.map(s => (
              <tr key={s.id} style={{ backgroundColor: 'rgba(255,255,255,0.3)' }}>
                <td style={{ padding: '15px' }}>{s.fullName}</td>
                <td style={{ padding: '15px' }}>{s.roll}</td>
                <td style={{ padding: '15px' }}>{s.class}</td>
                <td style={{ padding: '15px' }}>{s.section}</td>
                <td style={{ padding: '15px' }}>{s.email}</td>
                <td style={{ padding: '15px' }}>
                  <button onClick={() => deleteStudent(s.email)} className="delete-btn">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Admin;