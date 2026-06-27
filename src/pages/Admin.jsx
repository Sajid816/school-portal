import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, collection, getDocs, deleteDoc, setDoc, getDoc, addDoc } from 'firebase/firestore';

function Admin() {
  const [galleryImages, setGalleryImages] = useState([]);
  const [newsImages, setNewsImages] = useState([]);
  const [currentTicker, setCurrentTicker] = useState('');
  const [isUpdatingTicker, setIsUpdatingTicker] = useState(false);
  
  const [sectionsMap, setSectionsMap] = useState({});
  const [sectionsLoading, setSectionsLoading] = useState(true);
  const [configSelectedClass, setConfigSelectedClass] = useState('Playgroup');

  const [imageUrl, setImageUrl] = useState('');
  const [contentTitle, setContentTitle] = useState('');
  
  // Optional Teacher Fields
  const [teacherEmail, setTeacherEmail] = useState('');
  const [teacherPhone, setTeacherPhone] = useState('');

  const [destination, setDestination] = useState('news');
  const [targetBranch, setTargetBranch] = useState('kurpar');
  const [targetClass, setTargetClass] = useState('Playgroup');
  const [targetSection, setTargetSection] = useState('');
  const [isUploadingContent, setIsUploadingContent] = useState(false);

  const BRANCHES = [
    { id: 'kurpar', name: 'হলি চাইল্ড একাডেমি, কুরপাড়' },
    { id: 'moktarpara', name: 'হলি চাইল্ড একাডেমি, মোক্তারপাড়া' }
  ];

  const classes = ["Playgroup", "Nursery", "KG", "Class 1", "Class 2", "Class 3", "Class 4", "Class 5"];
  const AVAILABLE_SECTIONS = ["A", "B", "C", "D", "E"];

  useEffect(() => { 
    fetchCurrentTicker();
    fetchGallery();
    fetchNews();
    fetchSectionsConfig();
  }, []);

  useEffect(() => {
    const activeSections = sectionsMap[targetClass] || [];
    if (activeSections.length > 0) {
      setTargetSection(activeSections[0]);
    } else {
      setTargetSection('');
    }
  }, [targetClass, sectionsMap]);

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

  const fetchNews = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "news"));
      setNewsImages(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) { console.error(err); }
  };

  const fetchSectionsConfig = async () => {
    try {
      const docSnap = await getDoc(doc(db, "settings", "classSections"));
      if (docSnap.exists()) {
        setSectionsMap(docSnap.data().mapping || {});
      }
    } catch (err) { console.error(err); } 
    finally { setSectionsLoading(false); }
  };

  const handleTickerUpdate = async (e) => {
    e.preventDefault();
    setIsUpdatingTicker(true);
    try {
      await setDoc(doc(db, "settings", "ticker"), { message: e.target.tickerText.value, lastUpdated: new Date().toISOString() });
      alert("News ticker updated successfully!");
    } catch (error) { alert("Failed to update ticker."); }
    finally { setIsUpdatingTicker(false); }
  };

  const handleCheckboxChange = async (sectionLetter) => {
    const currentSections = sectionsMap[configSelectedClass] || [];
    let updatedSections = [];
    if (currentSections.includes(sectionLetter)) {
      updatedSections = currentSections.filter(s => s !== sectionLetter);
    } else {
      updatedSections = [...currentSections, sectionLetter].sort();
    }
    const updatedMap = { ...sectionsMap, [configSelectedClass]: updatedSections };
    setSectionsMap(updatedMap);
    try {
      await setDoc(doc(db, "settings", "classSections"), { mapping: updatedMap });
    } catch (err) { console.error(err); }
  };

  const handleContentUpload = async (e) => {
    e.preventDefault();
    if (!imageUrl) return alert("Please provide an image URL.");
    if (destination === 'teachers' && !targetSection) return alert("Cannot add teacher. Activate sections first.");

    setIsUploadingContent(true);
    try {
      if (destination === 'gallery') {
        await addDoc(collection(db, "gallery"), { url: imageUrl, caption: contentTitle, uploadedAt: new Date().toISOString() });
        fetchGallery();
      } else if (destination === 'news') {
        await addDoc(collection(db, "news"), { url: imageUrl, title: contentTitle, uploadedAt: new Date().toISOString() });
        fetchNews();
      } else if (destination === 'teachers') {
        const teacherDocId = `${targetBranch}_${targetClass}_${targetSection}`;
        await setDoc(doc(db, "teachers", teacherDocId), { 
          teacherName: contentTitle, 
          photoUrl: imageUrl, 
          branch: targetBranch,
          class: targetClass, 
          section: targetSection, 
          email: teacherEmail.trim(),
          phone: teacherPhone.trim(),
          lastUpdated: new Date().toISOString() 
        });
      }

      alert(`Successfully saved to ${destination}!`);
      setImageUrl('');
      setContentTitle('');
      setTeacherEmail('');
      setTeacherPhone('');
    } catch (error) { 
      console.error(error);
      alert("Failed to link data."); 
    } finally { 
      setIsUploadingContent(false); 
    }
  };

  const handleDeleteImage = async (id, collectionName) => {
    if (window.confirm("Remove this image permanently?")) {
      await deleteDoc(doc(db, collectionName, id));
      if (collectionName === 'gallery') fetchGallery();
      if (collectionName === 'news') fetchNews();
    }
  };

  const activeForConfigClass = sectionsMap[configSelectedClass] || [];
  const activeForUploaderClass = sectionsMap[targetClass] || [];

  return (
    <div style={{ padding: '40px', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h1>Admin Control Workspace</h1>
      
      {/* SECTION CONFIGURATION BOX */}
      <div className="glass-notice-box" style={{ color: '#333', marginBottom: '20px', width: '100%', maxWidth: '900px', padding: '30px' }}>
        <h3>Manage Class Sections (Annual Setup)</h3>
        <p style={{ fontSize: '0.85rem', color: '#555', marginBottom: '15px' }}>Check sections to activate them globally.</p>
        {sectionsLoading ? <p>Loading...</p> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <select className="glass-input" style={{ margin: 0, width: '100%' }} value={configSelectedClass} onChange={e => setConfigSelectedClass(e.target.value)}>
              {classes.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <div style={{ display: 'flex', gap: '20px', background: 'rgba(0,0,0,0.03)', padding: '15px', borderRadius: '8px', flexWrap: 'wrap' }}>
              {AVAILABLE_SECTIONS.map(sec => (
                <label key={sec} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                  <input type="checkbox" style={{ transform: 'scale(1.2)' }} checked={activeForConfigClass.includes(sec)} onChange={() => handleCheckboxChange(sec)} />
                  Section {sec}
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* UNIVERSAL CONTENT MANAGER */}
      <div className="glass-notice-box" style={{ color: '#333', marginBottom: '20px', width: '100%', maxWidth: '900px', padding: '30px' }}>
        <h3>Universal Website Content Manager</h3>
        <form onSubmit={handleContentUpload} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input type="text" className="glass-input" style={{ flex: 2, margin: 0, minWidth: '250px' }} placeholder="Paste Image URL" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} required />
            <input type="text" className="glass-input" style={{ flex: 1, margin: 0, minWidth: '150px' }} placeholder="Title / Caption / Name" value={contentTitle} onChange={(e) => setContentTitle(e.target.value)} required />
          </div>

          <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
            <label style={{ fontWeight: 'bold' }}>Route Destination:</label>
            <select className="glass-input" style={{ margin: 0, width: '200px' }} value={destination} onChange={e => setDestination(e.target.value)}>
              <option value="news">Home Page News Slider</option>
              <option value="gallery">Photo Gallery</option>
              <option value="teachers">Teachers Directory</option>
            </select>

            {destination === 'teachers' && (
              <>
                <select className="glass-input" style={{ margin: 0, width: '220px' }} value={targetBranch} onChange={e => setTargetBranch(e.target.value)}>
                  {BRANCHES.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
                <select className="glass-input" style={{ margin: 0, width: '120px' }} value={targetClass} onChange={e => setTargetClass(e.target.value)}>
                  {classes.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select className="glass-input" style={{ margin: 0, width: '140px' }} value={targetSection} onChange={e => setTargetSection(e.target.value)} disabled={activeForUploaderClass.length === 0}>
                  {activeForUploaderClass.length > 0 ? activeForUploaderClass.map(sec => <option key={sec} value={sec}>Section {sec}</option>) : <option value="">No Active Sec</option>}
                </select>
              </>
            )}
          </div>

          {/* Render Email and Phone ONLY if updating teachers */}
          {destination === 'teachers' && (
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', width: '100%', background: 'rgba(0,0,0,0.03)', padding: '15px', borderRadius: '8px' }}>
              <div style={{ flex: 1, minWidth: '200px' }}>
                 <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#555' }}>Email Address (Optional)</label>
                 <input type="email" className="glass-input" style={{ margin: 0 }} value={teacherEmail} onChange={e => setTeacherEmail(e.target.value)} />
              </div>
              <div style={{ flex: 1, minWidth: '200px' }}>
                 <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#555' }}>Phone Number (Optional)</label>
                 <input type="text" className="glass-input" style={{ margin: 0 }} value={teacherPhone} onChange={e => setTeacherPhone(e.target.value)} />
              </div>
            </div>
          )}

          <button type="submit" className="login-btn" style={{ margin: 0, width: '200px' }} disabled={isUploadingContent}>
            {isUploadingContent ? "Linking..." : "Save to Website"}
          </button>
        </form>

        {/* Dynamic Preview Grids */}
        {(destination === 'gallery' || destination === 'news') && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '15px', marginTop: '20px', borderTop: '1px solid #ccc', paddingTop: '20px' }}>
            {(destination === 'gallery' ? galleryImages : newsImages).map(img => (
              <div key={img.id} style={{ position: 'relative', border: '1px solid #ccc', borderRadius: '8px', padding: '5px', background: '#fff' }}>
                <img src={img.url} alt={img.title || img.caption} style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '4px' }} />
                <p style={{ fontSize: '0.8rem', margin: '5px 0 0 0', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{img.title || img.caption}</p>
                <button onClick={() => handleDeleteImage(img.id, destination)} style={{ position: 'absolute', top: '5px', right: '5px', background: '#d9534f', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '2px 6px' }}>X</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* TICKER MANAGER */}
      <div className="glass-notice-box" style={{ color: '#333', marginBottom: '20px', width: '100%', maxWidth: '900px', padding: '30px' }}>
        <h3>Update News Ticker Message</h3>
        <form onSubmit={handleTickerUpdate}>
          <input type="text" name="tickerText" className="glass-input" defaultValue={currentTicker} required />
          <button type="submit" className="login-btn" disabled={currentTicker === '' || isUpdatingTicker} style={{ marginTop: '5px' }}>Publish Live Message</button>
        </form>
      </div>
    </div>
  );
}

export default Admin;