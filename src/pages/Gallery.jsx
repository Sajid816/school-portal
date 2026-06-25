import { useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import { collection, getDocs, deleteDoc, doc, addDoc, writeBatch } from 'firebase/firestore';

function Gallery() {
  const [images, setImages] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeIndices, setActiveIndices] = useState({});
  const [hoveredSection, setHoveredSection] = useState(null);

  // Admin Upload State
  const [imageUrl, setImageUrl] = useState('');
  const [sectionName, setSectionName] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Strict structural section order map
  const SECTION_ORDER = [
    "campus",
    "class rooms",
    "winter tour",
    "sports event",
    "general"
  ];

  useEffect(() => {
    fetchImages();
    if (localStorage.getItem('role') === 'admin') {
      setIsAdmin(true);
    }
  }, []);

  // AUTO-SCROLL ENGINE
  useEffect(() => {
    if (isAdmin || images.length === 0) return;

    const uniquelyFoundSections = [...new Set(images.map(img => img.caption || "general"))];

    const interval = setInterval(() => {
      setActiveIndices(prev => {
        const updatedIndices = { ...prev };

        uniquelyFoundSections.forEach(sectionTitle => {
          // Skip scrolling if the user is hovering over this specific section
          if (hoveredSection === sectionTitle) return;

          const sectionImages = images.filter(img => (img.caption || "general") === sectionTitle);
          if (sectionImages.length <= 1) return;

          const currentIndex = prev[sectionTitle] || 0;
          updatedIndices[sectionTitle] = (currentIndex + 1) % sectionImages.length;
        });

        return updatedIndices;
      });
    }, 4000); // Transitions automatically every 4 seconds

    return () => clearInterval(interval);
  }, [images, hoveredSection, isAdmin]);

  const fetchImages = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "gallery"));
      const list = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      const sortedList = list.sort((a, b) => new Date(a.uploadedAt || 0) - new Date(b.uploadedAt || 0));
      setImages(sortedList);

      const initialIndices = {};
      querySnapshot.docs.forEach(doc => {
        const caption = doc.data().caption || "general";
        if (!(caption in initialIndices)) {
          initialIndices[caption] = 0;
        }
      });
      setActiveIndices(prev => ({ ...initialIndices, ...prev }));
    } catch (err) {
      console.error("Error loading gallery:", err);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!imageUrl || !sectionName) return alert("Please provide both an image URL and a section name.");
    setIsUploading(true);

    const cleanSectionName = sectionName.trim().replace(/\s+/g, ' ').toLowerCase();

    try {
      await addDoc(collection(db, "gallery"), {
        url: imageUrl,
        caption: cleanSectionName, 
        uploadedAt: new Date().toISOString()
      });
      alert(`Image added successfully!`);
      setImageUrl('');
      setSectionName('');
      fetchImages();
    } catch (error) {
      alert("Failed to upload image.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteImage = async (id, sectionTitle) => {
    if (window.confirm("Remove this image?")) {
      await deleteDoc(doc(db, "gallery", id));
      setActiveIndices(prev => ({ ...prev, [sectionTitle]: 0 }));
      fetchImages();
    }
  };

  const handleDeleteSection = async (targetSection) => {
    if (window.confirm(`Are you sure you want to delete the ENTIRE "${targetSection}" section?`)) {
      try {
        const batch = writeBatch(db);
        const imagesToDelete = images.filter(img => (img.caption || "general") === targetSection);
        
        imagesToDelete.forEach(img => {
          batch.delete(doc(db, "gallery", img.id));
        });

        await batch.commit();
        alert(`Section deleted.`);
        fetchImages();
      } catch (error) {
        alert("Failed to delete section.");
      }
    }
  };

  const changeSlide = (sectionTitle, direction, totalItems) => {
    const currentIndex = activeIndices[sectionTitle] || 0;
    let newIndex = currentIndex;

    if (direction === 'next') {
      newIndex = (currentIndex + 1) % totalItems;
    } else {
      newIndex = (currentIndex - 1 + totalItems) % totalItems;
    }

    setActiveIndices(prev => ({ ...prev, [sectionTitle]: newIndex }));
  };

  const uniquelyFoundSections = [...new Set(images.map(img => img.caption || "general"))];
  const sortedSections = uniquelyFoundSections.sort((a, b) => {
    const indexA = SECTION_ORDER.indexOf(a);
    const indexB = SECTION_ORDER.indexOf(b);
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
          <p style={{ fontSize: '0.9rem', marginBottom: '15px' }}>
            Upload your image to <a href="https://postimages.org" target="_blank" rel="noreferrer" style={{ color: '#0056b3' }}>Postimages</a> and paste the Direct Link here. Available standard tracks: <b>{SECTION_ORDER.join(', ')}</b>
          </p>
          <form onSubmit={handleUpload} style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            <input 
              type="text" 
              className="glass-input" 
              style={{ flex: 2, margin: 0 }} 
              placeholder="Direct Image URL (ends in .jpg/.png)" 
              value={imageUrl} 
              onChange={e => setImageUrl(e.target.value)} 
              required 
            />
            <input 
              type="text" 
              className="glass-input" 
              style={{ flex: 1, margin: 0 }} 
              placeholder="Section Name (e.g., Campus)" 
              value={sectionName} 
              onChange={e => setSectionName(e.target.value)} 
              required 
            />
            <button type="submit" className="login-btn" style={{ margin: 0, width: 'auto' }} disabled={isUploading}>
              {isUploading ? "Adding..." : "Upload Image"}
            </button>
          </form>
        </div>
      )}

      {/* GALLERY DISPLAY */}
      <div style={{ width: '100%', maxWidth: '900px', display: 'flex', flexDirection: 'column', gap: '40px' }}>
        {sortedSections.map(sectionTitle => {
          const sectionImages = images.filter(img => (img.caption || "general") === sectionTitle);
          if (sectionImages.length === 0) return null;

          const currentIndex = activeIndices[sectionTitle] || 0;
          const currentImage = sectionImages[currentIndex];

          return (
            <div 
              key={sectionTitle} 
              className="glass-notice-box" 
              style={{ color: '#333', padding: '30px', position: 'relative' }}
              onMouseEnter={() => setHoveredSection(sectionTitle)}
              onMouseLeave={() => setHoveredSection(null)}
            >
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ccc', paddingBottom: '10px', marginBottom: '20px' }}>
                <h2 style={{ margin: 0, textTransform: 'capitalize' }}>{sectionTitle}</h2>
                {isAdmin && (
                  <button onClick={() => handleDeleteSection(sectionTitle)} className="delete-btn" style={{ padding: '5px 15px', fontSize: '0.9rem' }}>
                    Delete Entire Section
                  </button>
                )}
              </div>
              
              {isAdmin ? (
                // ADMIN GRID WORKSPACE VIEW
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
                  {sectionImages.map(img => (
                    <div key={img.id} style={{ position: 'relative', height: '150px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #ccc', background: '#f0f0f0' }}>
                      <img src={img.url} alt={sectionTitle} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      <button 
                        onClick={() => handleDeleteImage(img.id, sectionTitle)}
                        style={{ position: 'absolute', top: '5px', right: '5px', background: 'rgba(219, 83, 79, 0.9)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '4px 8px', fontSize: '0.8rem', fontWeight: 'bold' }}
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                // VISITOR VIEW: Auto-scrolling Slideshow with Hover Pause & Dot Bars
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                  
                  <div style={{ display: 'flex', alignItems: 'center', width: '100%', position: 'relative', height: '450px', background: 'rgba(0,0,0,0.02)', borderRadius: '8px' }}>
                    
                    {/* Left Slider Arrow */}
                    {sectionImages.length > 1 && (
                      <button 
                        onClick={() => changeSlide(sectionTitle, 'prev', sectionImages.length)}
                        style={{ position: 'absolute', left: '15px', zIndex: 10, background: 'rgba(255,255,255,0.7)', border: '1px solid #ccc', borderRadius: '50%', width: '45px', height: '45px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        &#8249;
                      </button>
                    )}

                    {/* Image output block */}
                    {currentImage && (
                      <img 
                        src={currentImage.url} 
                        alt={sectionTitle} 
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                      />
                    )}

                    {/* Right Slider Arrow */}
                    {sectionImages.length > 1 && (
                      <button 
                        onClick={() => changeSlide(sectionTitle, 'next', sectionImages.length)}
                        style={{ position: 'absolute', right: '15px', zIndex: 10, background: 'rgba(255,255,255,0.7)', border: '1px solid #ccc', borderRadius: '50%', width: '45px', height: '45px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        &#8250;
                      </button>
                    )}
                  </div>

                  {/* DOT TRACK INDICATOR BAR */}
                  {sectionImages.length > 1 && (
                    <div style={{ display: 'flex', gap: '8px', marginTop: '15px', justifyContent: 'center', alignItems: 'center' }}>
                      {sectionImages.map((_, idx) => (
                        <div 
                          key={idx}
                          onClick={() => setActiveIndices(prev => ({ ...prev, [sectionTitle]: idx }))}
                          style={{ 
                            width: idx === currentIndex ? '12px' : '8px', 
                            height: idx === currentIndex ? '12px' : '8px', 
                            borderRadius: '50%', 
                            background: idx === currentIndex ? '#0056b3' : '#bbb', 
                            transition: 'all 0.2s ease',
                            cursor: 'pointer'
                          }}
                        />
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