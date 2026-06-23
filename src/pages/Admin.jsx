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
  const [imageUrl, setImageUrl] = useState('');
  const [imageCaption, setImageCaption] = useState('');

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
    } catch (err) { console.error("Error fetching students:", err); }
  };

  const fetchCurrentTicker = async () => {
    try {
      const docSnap = await getDoc(doc(db, "settings", "ticker"));
      if (docSnap.exists()) {
        setCurrentTicker(docSnap.data().message || '');
      }
    } catch (err) { console.error("Error fetching ticker:", err); }
  };

  const fetchGallery = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "gallery"));
      const list = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setGalleryImages(list);
    } catch (err) { console.error("Error fetching gallery:", err); }
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
    } catch (error) {
      console.error(error);
      alert("Failed to update ticker. Check your Firestore collection name and Security Rules.");
    } finally {
      setIsUpdatingTicker(false);
    }
  };

  const handleAddImage = async (e) => {
    e.preventDefault();
    if (!imageUrl) return alert("Please enter an image URL.");
    try {
      await addDoc(collection(db, "gallery"), {
        url: imageUrl,
        caption: imageCaption || "School Event",
        uploadedAt: new Date().toISOString()
      });
      alert("Image added to gallery!");
      setImageUrl('');
      setImageCaption('');
      fetchGallery();
    } catch (error) {
      alert("Failed to add image to gallery.");
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
      
      {/* 1. Ticker Management Box */}
      <div className="glass-notice-box" style={{ color: '#333', marginBottom: '20px', width: '100%', maxWidth: '900px' }}>
        <h3>Update News Ticker Message</h3>
        <form onSubmit={handleTickerUpdate}>
          <input 
            type="text" 
            name="tickerText" 
            className="glass-input" 
            defaultValue={currentTicker} 
            placeholder="Type live banner announcement here..." 
            required 
          />
          <button type="submit" className="login-btn" disabled={isUpdatingTicker} style={{ marginTop: '5px' }}>
            {isUpdatingTicker ? "Updating..." : "Publish Live Message"}
          </button>
        </form>
      </div>

      {/* 2. Gallery Management Box */}
      <div className="glass-notice-box" style={{ color: '#333', marginBottom: '20px', width: '100%', maxWidth: '900px', padding: '30px' }}>
        <h3>Gallery Management</h3>
        <form onSubmit={handleAddImage} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
          <input 
            type="text" 
            className="glass-input" 
            style={{ flex: 2, margin: 0 }} 
            placeholder="Image URL (e.g., https://example.com/photo.jpg)" 
            value={imageUrl} 
            onChange={(e) => setImageUrl(e.target.value)} 
          />
          <input 
            type="text" 
            className="glass-input" 
            style={{ flex: 1, margin: 0 }} 
            placeholder="Caption/Event Name" 
            value={imageCaption} 
            onChange={(e) => setImageCaption(e.target.value)} 
          />
          <button type="submit" className="login-btn" style={{ margin: 0, width: 'auto' }}>Add Image</button>
        </form>

        {/* Live Gallery Preview Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '15px', marginTop: '20px' }}>
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