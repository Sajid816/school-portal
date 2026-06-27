import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, deleteDoc, doc, addDoc, writeBatch, setDoc, getDoc } from 'firebase/firestore';

function Gallery() {
  const [images, setImages] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeIndices, setActiveIndices] = useState({});
  const [hoveredSection, setHoveredSection] = useState(null);
  const [fadeStates, setFadeStates] = useState({});
  const [sectionOrder, setSectionOrder] = useState([]);

  // Admin Upload State
  const [imageUrl, setImageUrl] = useState('');
  const [sectionName, setSectionName] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchImagesAndOrder();
    if (localStorage.getItem('role') === 'admin') {
      setIsAdmin(true);
    }
  }, []);

  // AUTO-SCROLL ENGINE
  useEffect(() => {
    if (isAdmin || images.length === 0) return;

    const uniquelyFoundSections = [...new Set(images.map(img => img.caption || "general"))];

    const interval = setInterval(() => {
      uniquelyFoundSections.forEach(sectionTitle => {
        if (hoveredSection === sectionTitle) return;

        const sectionImages = images.filter(img => (img.caption || "general") === sectionTitle);
        if (sectionImages.length <= 1) return;

        triggerSmoothTransition(sectionTitle, 'next', sectionImages.length);
      });
    }, 4000); 

    return () => clearInterval(interval);
  }, [images, hoveredSection, isAdmin, activeIndices]);

  const fetchImagesAndOrder = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "gallery"));
      const list = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const sortedList = list.sort((a, b) => new Date(a.uploadedAt || 0) - new Date(b.uploadedAt || 0));
      setImages(sortedList);

      // Fetch admin arrangement map
      const orderSnap = await getDoc(doc(db, "settings", "galleryOrder"));
      if (orderSnap.exists()) {
        setSectionOrder(orderSnap.data().order || []);
      }

      const initialIndices = {};
      const initialFades = {};
      querySnapshot.docs.forEach(doc => {
        const caption = doc.data().caption || "general";
        if (!(caption in initialIndices)) {
          initialIndices[caption] = 0;
          initialFades[caption] = 1;
        }
      });
      setActiveIndices(prev => ({ ...initialIndices, ...prev }));
      setFadeStates(prev => ({ ...initialFades, ...prev }));
    } catch (err) {
      console.error("Error loading gallery:", err);
    }
  };

  const triggerSmoothTransition = (sectionTitle, direction, totalItems) => {
    setFadeStates(prev => ({ ...prev, [sectionTitle]: 0 }));
    setTimeout(() => {
      setActiveIndices(prev => {
        const currentIndex = prev[sectionTitle] || 0;
        let newIndex = currentIndex;
        if (direction === 'next') {
          newIndex = (currentIndex + 1) % totalItems;
        } else if (typeof direction === 'number') {
          newIndex = direction;
        } else {
          newIndex = (currentIndex - 1 + totalItems) % totalItems;
        }
        return { ...prev, [sectionTitle]: newIndex };
      });
      setFadeStates(prev => ({ ...prev, [sectionTitle]: 1 }));
    }, 300);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!imageUrl || !sectionName) return alert("Please fill fields.");
    setIsUploading(true);

    const cleanSectionName = sectionName.trim().toLowerCase();

    try {
      await addDoc(collection(db, "gallery"), {
        url: imageUrl,
        caption: cleanSectionName, 
        uploadedAt: new Date().toISOString()
      });

      if (!sectionOrder.includes(cleanSectionName)) {
        const updatedOrder = [...sectionOrder, cleanSectionName];
        setSectionOrder(updatedOrder);
        await setDoc(doc(db, "settings", "galleryOrder"), { order: updatedOrder });
      }

      alert(`Image added successfully!`);
      setImageUrl('');
      setSectionName('');
      fetchImagesAndOrder();
    } catch (error) {
      alert("Failed to upload image.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleMoveSection = async (targetSection, direction) => {
    const uniquelyFoundSections = [...new Set(images.map(img => img.caption || "general"))];
    
    let updatedOrder = [...sectionOrder];
    uniquelyFoundSections.forEach(s => {
      if (!updatedOrder.includes(s)) {
        updatedOrder.push(s);
      }
    });

    const realIndex = updatedOrder.indexOf(targetSection);
    if (realIndex === -1) return;

    if (direction === 'up' && realIndex > 0) {
      [updatedOrder[realIndex], updatedOrder[realIndex - 1]] = [updatedOrder[realIndex - 1], updatedOrder[realIndex]];
    } else if (direction === 'down' && realIndex < updatedOrder.length - 1) {
      [updatedOrder[realIndex], updatedOrder[realIndex + 1]] = [updatedOrder[realIndex + 1], updatedOrder[realIndex]];
    } else {
      return; 
    }

    setSectionOrder(updatedOrder);
    try {
      await setDoc(doc(db, "settings", "galleryOrder"), { order: updatedOrder });
    } catch (err) {
      console.error("Firestore Write Error Details:", err);
      alert("Failed to save layout order. Verify security rules ruleset.");
    }
  };

  const handleDeleteImage = async (id, sectionTitle) => {
    if (window.confirm("Remove this image?")) {
      await deleteDoc(doc(db, "gallery", id));
      setActiveIndices(prev => ({ ...prev, [sectionTitle]: 0 }));
      fetchImagesAndOrder();
    }
  };

  const handleDeleteSection = async (targetSection) => {
    if (window.confirm(`Delete entire "${targetSection}" section?`)) {
      try {
        const batch = writeBatch(db);
        const imagesToDelete = images.filter(img => (img.caption || "general") === targetSection);
        imagesToDelete.forEach(img => batch.delete(doc(db, "gallery", img.id)));
        await batch.commit();

        const updatedOrder = sectionOrder.filter(s => s !== targetSection);
        setSectionOrder(updatedOrder);
        await setDoc(doc(db, "settings", "galleryOrder"), { order: updatedOrder });

        alert(`Section deleted.`);
        fetchImagesAndOrder();
      } catch (error) {
        alert("Failed to delete section.");
      }
    }
  };

  const uniquelyFoundSections = [...new Set(images.map(img => img.caption || "general"))];
  
  const sortedSections = uniquelyFoundSections.sort((a, b) => {
    const indexA = sectionOrder.indexOf(a);
    const indexB = sectionOrder.indexOf(b);
    if (indexA === -1 && indexB === -1) return a.localeCompare(b);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });

  return (
    <div style={{ padding: '40px', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h1>Campus Gallery</h1>
      <p style={{ marginBottom: '30px', color: '#ddd' }}>Photos of the campus and student life</p>

      {/* ADMIN UPLOAD PANEL */}
      {isAdmin && (
        <div className="glass-notice-box" style={{ color: '#333', padding: '30px', width: '100%', maxWidth: '900px', marginBottom: '40px' }}>
          <h3>Add to Gallery</h3>
          <form onSubmit={handleUpload} style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            <input type="text" className="glass-input" style={{ flex: 2, margin: 0 }} placeholder="Direct Image URL (ends in .jpg/.png)" value={imageUrl} onChange={e => setImageUrl(e.target.value)} required />
            <input type="text" className="glass-input" style={{ flex: 1, margin: 0 }} placeholder="Section Name (e.g., Campus)" value={sectionName} onChange={e => setSectionName(e.target.value)} required />
            <button type="submit" className="login-btn" style={{ margin: 0, width: 'auto' }} disabled={isUploading}>{isUploading ? "Adding..." : "Upload Image"}</button>
          </form>
        </div>
      )}

      {/* GALLERY DISPLAY */}
      {/* 1. Changed to flex-wrap and center alignment here */}
      <div style={{ width: '100%', maxWidth: '1000px', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '40px' }}>
        {sortedSections.map((sectionTitle, orderIdx) => {
          const sectionImages = images.filter(img => (img.caption || "general") === sectionTitle);
          if (sectionImages.length === 0) return null;

          const currentIndex = activeIndices[sectionTitle] || 0;
          const currentImage = sectionImages[currentIndex];
          const currentOpacity = fadeStates[sectionTitle] !== undefined ? fadeStates[sectionTitle] : 1;

          return (
            /* 2. Changed width to exactly 50% minus the gap to fit exactly 2 per row */
            <div key={sectionTitle} className="glass-notice-box" style={{ 
              width: 'calc(50% - 20px)', 
              minWidth: '320px', /* Keeps them from squishing too small on phones */
              boxSizing: 'border-box', 
              color: '#333', 
              padding: '30px', 
              position: 'relative' 
            }} onMouseEnter={() => setHoveredSection(sectionTitle)} onMouseLeave={() => setHoveredSection(null)}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ccc', paddingBottom: '10px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <h2 style={{ margin: 0, textTransform: 'capitalize' }}>{sectionTitle}</h2>
                  
                  {isAdmin && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => handleMoveSection(sectionTitle, 'up')} disabled={orderIdx === 0} className="liquid-btn">▲ Move Up</button>
                      <button onClick={() => handleMoveSection(sectionTitle, 'down')} disabled={orderIdx === sortedSections.length - 1} className="liquid-btn">▼ Move Down</button>
                    </div>
                  )}
                </div>
                {isAdmin && (
                  <button onClick={() => handleDeleteSection(sectionTitle)} className="delete-btn" style={{ padding: '5px 15px', fontSize: '0.9rem' }}>Delete Entire Section</button>
                )}
              </div>
              
              {isAdmin ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '20px' }}>
                  {sectionImages.map(img => (
                    <div key={img.id} style={{ position: 'relative', height: '150px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #ccc', background: '#f0f0f0' }}>
                      <img src={img.url} alt={sectionTitle} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      <button onClick={() => handleDeleteImage(img.id, sectionTitle)} style={{ position: 'absolute', top: '5px', right: '5px', background: 'rgba(219, 83, 79, 0.9)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '4px 8px', fontSize: '0.8rem', fontWeight: 'bold' }}>Delete</button>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                  <div style={{ display: 'flex', alignItems: 'center', width: '100%', position: 'relative', height: '350px', background: 'rgba(0,0,0,0.02)', borderRadius: '8px', overflow: 'hidden' }}>
                    {sectionImages.length > 1 && (
                      <button onClick={() => triggerSmoothTransition(sectionTitle, 'prev', sectionImages.length)} style={{ position: 'absolute', left: '10px', zIndex: 10, background: 'rgba(255,255,255,0.7)', border: '1px solid #ccc', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>&#8249;</button>
                    )}
                    {currentImage && (
                      <img src={currentImage.url} alt={sectionTitle} style={{ width: '100%', height: '100%', objectFit: 'contain', opacity: currentOpacity, transition: 'opacity 0.3s ease-in-out' }} />
                    )}
                    {sectionImages.length > 1 && (
                      <button onClick={() => triggerSmoothTransition(sectionTitle, 'next', sectionImages.length)} style={{ position: 'absolute', right: '10px', zIndex: 10, background: 'rgba(255,255,255,0.7)', border: '1px solid #ccc', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>&#8250;</button>
                    )}
                  </div>
                  {sectionImages.length > 1 && (
                    <div style={{ display: 'flex', gap: '8px', marginTop: '15px', justifyContent: 'center', alignItems: 'center' }}>
                      {sectionImages.map((_, idx) => (
                        <div key={idx} onClick={() => triggerSmoothTransition(sectionTitle, idx, sectionImages.length)} style={{ width: idx === currentIndex ? '12px' : '8px', height: idx === currentIndex ? '12px' : '8px', borderRadius: '50%', background: idx === currentIndex ? '#0056b3' : '#bbb', transition: 'all 0.2s ease', cursor: 'pointer' }} />
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Gallery;