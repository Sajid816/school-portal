import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, collection, getDocs, deleteDoc, setDoc, getDoc, addDoc } from 'firebase/firestore';

function Admin() {
  const [galleryImages, setGalleryImages] = useState([]);
  const [currentTicker, setCurrentTicker] = useState('');
  const [isUpdatingTicker, setIsUpdatingTicker] = useState(false);
  
  // Section Configuration Mapping States
  const [sectionsMap, setSectionsMap] = useState({});
  const [sectionsLoading, setSectionsLoading] = useState(true);
  const [configSelectedClass, setConfigSelectedClass] = useState('Playgroup');

  // Content Uploader State
  const [imageUrl, setImageUrl] = useState('');
  const [contentTitle, setContentTitle] = useState('');
  const [destination, setDestination] = useState('gallery');
  const [targetClass, setTargetClass] = useState('Playgroup');
  const [targetSection, setTargetSection] = useState('');
  const [isUploadingContent, setIsUploadingContent] = useState(false);

  // UNIFIED CLASS TAXONOMY SCHEMA
  const classes = ["Playgroup", "Nursery", "KG", "Class 1", "Class 2", "Class 3", "Class 4", "Class 5"];
  const AVAILABLE_SECTIONS = ["A", "B", "C", "D", "E"];

  useEffect(() => { 
    fetchCurrentTicker();
    fetchGallery();
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

  const fetchSectionsConfig = async () => {
    try {
      const docSnap = await getDoc(doc(db, "settings", "classSections"));
      if (docSnap.exists()) {
        setSectionsMap(docSnap.data().mapping || {});
      }
    } catch (err) {
      console.error("Error fetching sections configuration:", err);
    } finally {
      setSectionsLoading(false);
    }
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

  // Instant atomic updates write database state without racing states
  const handleCheckboxChange = async (sectionLetter) => {
    const currentSections = sectionsMap[configSelectedClass] || [];
    let updatedSections = [];

    if (currentSections.includes(sectionLetter)) {
      updatedSections = currentSections.filter(s => s !== sectionLetter);
    } else {
      updatedSections = [...currentSections, sectionLetter].sort();
    }

    const updatedMap = {
      ...sectionsMap,
      [configSelectedClass]: updatedSections
    };

    // Update local state layout map instantly
    setSectionsMap(updatedMap);

    // Commit cleanly directly to Firestore baseline mapping configuration fields
    try {
      await setDoc(doc(db, "settings", "classSections"), { mapping: updatedMap });
    } catch (err) {
      console.error("Failed to sync structural configuration map:", err);
    }
  };

  const handleContentUpload = async (e) => {
    e.preventDefault();
    if (!imageUrl) return alert("Please provide an image URL.");
    
    if (destination === 'teachers' && !targetSection) {
      return alert("Cannot add teacher. Please activate sections for this class first inside the Configuration Box.");
    }

    setIsUploadingContent(true);

    try {
      if (destination === 'gallery') {
        await addDoc(collection(db, "gallery"), {
          url: imageUrl,
          caption: contentTitle.trim().toLowerCase(),
          uploadedAt: new Date().toISOString()
        });
        alert("Added to Gallery successfully!");
        fetchGallery();
      } else if (destination === 'teachers') {
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

  const activeForConfigClass = sectionsMap[configSelectedClass] || [];
  const activeForUploaderClass = sectionsMap[targetClass] || [];

  return (
    <div style={{ padding: '40px', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h1>Admin Control Workspace</h1>
      
      {/* SECTION CONFIGURATION BOX */}
      <div className="glass-notice-box" style={{ color: '#333', marginBottom: '20px', width: '100%', maxWidth: '900px', padding: '30px' }}>
        <h3>Manage Class Sections (Annual Setup)</h3>
        <p style={{ fontSize: '0.85rem', color: '#555', marginBottom: '15px' }}>
          Check or uncheck sections below. Changes are saved automatically in real-time to sync database views instantly.
        </p>

        {sectionsLoading ? (
          <p style={{ fontStyle: 'italic' }}>Loading parameters...</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Select Target Class Mapping</label>
              <select className="glass-input" style={{ margin: 0, width: '100%' }} value={configSelectedClass} onChange={e => setConfigSelectedClass(e.target.value)}>
                {classes.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '10px' }}>Active Sections for {configSelectedClass}</label>
              <div style={{ display: 'flex', gap: '20px', background: 'rgba(0,0,0,0.03)', padding: '15px', borderRadius: '8px', flexWrap: 'wrap' }}>
                {AVAILABLE_SECTIONS.map(sec => (
                  <label key={sec} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                    <input 
                      type="checkbox" 
                      style={{ transform: 'scale(1.2)' }}
                      checked={activeForConfigClass.includes(sec)} 
                      onChange={() => handleCheckboxChange(sec)} 
                    />
                    Section {sec}
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* UNIVERSAL WEBSITE CONTENT LINKER */}
      <div className="glass-notice-box" style={{ color: '#333', marginBottom: '20px', width: '100%', maxWidth: '900px', padding: '30px' }}>
        <h3>Universal Website Content & Image Manager</h3>
        
        <blockquote style={{ background: 'rgba(0,0,0,0.05)', padding: '15px', borderRadius: '6px', borderLeft: '4px solid #0056b3', margin: '0 0 20px 0', fontSize: '0.95rem', lineHeight: '1.5' }}>
          <strong>Instructions for uploading files:</strong><br/>
          1. Open <a href="https://postimages.org" target="_blank" rel="noreferrer" style={{ color: '#0056b3', fontWeight: 'bold' }}>Postimages</a> in a new tab.<br/>
          2. Upload your image, and copy the <strong>Direct Link</strong> (must end in <code>.jpg</code> or <code>.png</code>).
        </blockquote>

        <form onSubmit={handleContentUpload} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input type="text" className="glass-input" style={{ flex: 2, margin: 0, minWidth: '250px' }} placeholder="Paste Direct Image URL (ends in .jpg/.png)" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} required />
            <input type="text" className="glass-input" style={{ flex: 1, margin: 0, minWidth: '150px' }} placeholder="Name / Title / Caption" value={contentTitle} onChange={(e) => setContentTitle(e.target.value)} required />
          </div>

          <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
            <label style={{ fontWeight: 'bold' }}>Route Destination:</label>
            <select className="glass-input" style={{ margin: 0, width: '200px' }} value={destination} onChange={e => setDestination(e.target.value)}>
              <option value="gallery">Photo Gallery</option>
              <option value="teachers">Teachers Directory</option>
              <option value="admissions">Admissions Info Page</option>
            </select>

            {destination === 'teachers' && (
              <>
                <select className="glass-input" style={{ margin: 0 }} value={targetClass} onChange={e => setTargetClass(e.target.value)}>
                  {classes.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                
                <select 
                  className="glass-input" 
                  style={{ margin: 0, width: '140px' }} 
                  value={targetSection} 
                  onChange={e => setTargetSection(e.target.value)}
                  disabled={activeForUploaderClass.length === 0}
                >
                  {activeForUploaderClass.length > 0 ? (
                    activeForUploaderClass.map(sec => <option key={sec} value={sec}>Section {sec}</option>)
                  ) : (
                    <option value="">No Active Sec</option>
                  )}
                </select>
              </>
            )}
          </div>
          
          {destination === 'teachers' && activeForUploaderClass.length === 0 && (
            <p style={{ color: '#d9534f', margin: 0, fontSize: '0.85rem', fontWeight: 'bold' }}>
              ⚠️ You must activate at least one section above for {targetClass} before uploading teacher info.
            </p>
          )}

          <button type="submit" className="login-btn" style={{ margin: 0, width: '200px' }} disabled={isUploadingContent || (destination === 'teachers' && activeForUploaderClass.length === 0)}>
            {isUploadingContent ? "Linking..." : "Save to Website"}
          </button>
        </form>

        {destination === 'gallery' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '15px', marginTop: '20px', borderTop: '1px solid #ccc', paddingTop: '20px' }}>
            {galleryImages.map(img => (
              <div key={img.id} style={{ position: 'relative', border: '1px solid #ccc', borderRadius: '8px', padding: '5px', background: '#fff' }}>
                <img src={img.url} alt={img.caption} style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '4px' }} />
                <p style={{ fontSize: '0.8rem', margin: '5px 0 0 0', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', textTransform: 'capitalize' }}>{img.caption}</p>
                <button onClick={() => handleDeleteImage(img.id)} style={{ position: 'absolute', top: '5px', right: '5px', background: 'rgba(219, 83, 79, 0.9)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '2px 6px', fontSize: '0.75rem' }}>X</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* TICKER MANAGEMENT BOX */}
      <div className="glass-notice-box" style={{ color: '#333', marginBottom: '20px', width: '100%', maxWidth: '900px' }}>
        <h3>Update News Ticker Message</h3>
        <form onSubmit={handleTickerUpdate}>
          <input type="text" name="tickerText" className="glass-input" defaultValue={currentTicker} placeholder="Type live banner announcement here..." required />
          <button type="submit" className="login-btn" disabled={currentTicker === '' || isUpdatingTicker} style={{ marginTop: '5px' }}>
            Publish Live Message
          </button>
        </form>
      </div>
    </div>
  );
}

export default Admin;