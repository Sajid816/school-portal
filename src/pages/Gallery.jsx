import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, deleteDoc, doc, addDoc, writeBatch } from 'firebase/firestore';

function Gallery() {
  const [images, setImages] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Admin Upload State
  const [imageUrl, setImageUrl] = useState('');
  const [sectionName, setSectionName] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchImages();
    if (localStorage.getItem('role') === 'admin') {
      setIsAdmin(true);
    }
  }, []);

  const fetchImages = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "gallery"));
      const list = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Sort images chronologically by their upload timestamp (oldest first)
      const sortedList = list.sort((a, b) => {
        return new Date(a.uploadedAt || 0) - new Date(b.uploadedAt || 0);
      });

      setImages(sortedList);
    } catch (err) {
      console.error("Error loading gallery:", err);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!imageUrl || !sectionName) return alert("Please provide both an image URL and a section name.");
    setIsUploading(true);

    // Clean up spaces and force a uniform lowercase layout format to avoid duplicate section variants
    const cleanSectionName = sectionName.trim().replace(/\s+/g, ' ').toLowerCase();

    try {
      await addDoc(collection(db, "gallery"), {
        url: imageUrl,
        caption: cleanSectionName, 
        uploadedAt: new Date().toISOString()
      });
      alert(`Image added to ${sectionName}!`);
      setImageUrl('');
      setSectionName('');
      fetchImages();
    } catch (error) {
      alert("Failed to upload image.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteImage = async (id) => {
    if (window.confirm("Remove this image?")) {
      await deleteDoc(doc(db, "gallery", id));
      fetchImages();
    }
  };

  const handleDeleteSection = async (targetSection) => {
    if (window.confirm(`Are you sure you want to delete the ENTIRE "${targetSection}" section and all its images?`)) {
      try {
        const batch = writeBatch(db);
        const imagesToDelete = images.filter(img => (img.caption || "general") === targetSection);
        
        imagesToDelete.forEach(img => {
          const imgRef = doc(db, "gallery", img.id);
          batch.delete(imgRef);
        });

        await batch.commit();
        alert(`Section deleted completely.`);
        fetchImages();
      } catch (error) {
        alert("Failed to delete section.");
      }
    }
  };

  const handleScroll = (sectionTitle, direction) => {
    const container = document.getElementById(`carousel-${sectionTitle}`);
    if (container) {
      const scrollAmount = 480; // Adjusted scroll step to match larger image blocks
      if (direction === 'left') {
        container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  const sections = [...new Set(images.map(img => img.caption || "general"))];

  return (
    <div style={{ padding: '40px', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h1>Campus Gallery</h1>
      <p style={{ marginBottom: '30px', color: '#ddd' }}>Photos of the campus and student life</p>

      {/* ADMIN UPLOAD PANEL */}
      {isAdmin && (
        <div className="glass-notice-box" style={{ color: '#333', padding: '30px', width: '100%', maxWidth: '1000px', marginBottom: '40px' }}>
          <h3>Add to Gallery</h3>
          <p style={{ fontSize: '0.9rem', marginBottom: '15px' }}>
            Upload your image to <a href="https://postimages.org" target="_blank" rel="noreferrer" style={{ color: '#0056b3' }}>Postimages</a> and paste the Direct Link here. Type a new section name to create one, or use an existing name.
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
              placeholder="Section Name (e.g., Winter Tour)" 
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
      <div style={{ width: '100%', maxWidth: '1000px', display: 'flex', flexDirection: 'column', gap: '40px' }}>
        {sections.map(sectionTitle => {
          const sectionImages = images.filter(img => (img.caption || "general") === sectionTitle);

          return (
            <div key={sectionTitle} className="glass-notice-box" style={{ color: '#333', padding: '30px', position: 'relative' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ccc', paddingBottom: '10px', marginBottom: '20px' }}>
                <h2 style={{ margin: 0, textTransform: 'capitalize' }}>{sectionTitle}</h2>
                {isAdmin && (
                  <button onClick={() => handleDeleteSection(sectionTitle)} className="delete-btn" style={{ padding: '5px 15px', fontSize: '0.9rem' }}>
                    Delete Entire Section
                  </button>
                )}
              </div>
              
              {isAdmin ? (
                // ADMIN VIEW: Wrapping Grid layout for quick content deletion management
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                  {sectionImages.map(img => (
                    <div key={img.id} style={{ position: 'relative', height: '200px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #ccc' }}>
                      <img src={img.url} alt={sectionTitle} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button 
                        onClick={() => handleDeleteImage(img.id)}
                        style={{ position: 'absolute', top: '5px', right: '5px', background: 'rgba(219, 83, 79, 0.9)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '4px 8px', fontSize: '0.8rem', fontWeight: 'bold' }}
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                // VISITOR VIEW: Clean Horizontal Scroll Carousel Matching Sample Mockup
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  
                  {sectionImages.length > 2 && (
                    <button 
                      onClick={() => handleScroll(sectionTitle, 'left')}
                      style={{ position: 'absolute', left: '-20px', zIndex: 10, background: '#fff', border: '1px solid #ccc', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}
                    >
                      &#8249;
                    </button>
                  )}

                  <div 
                    id={`carousel-${sectionTitle}`}
                    style={{ display: 'flex', gap: '20px', overflowX: 'hidden', scrollBehavior: 'smooth', width: '100%', padding: '10px 0' }}
                  >
                    {sectionImages.map(img => (
                      <div key={img.id} style={{ minWidth: '450px', width: '450px', height: '320px', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', background: '#000' }}>
                        <img src={img.url} alt={sectionTitle} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    ))}
                  </div>

                  {sectionImages.length > 2 && (
                    <button 
                      onClick={() => handleScroll(sectionTitle, 'right')}
                      style={{ position: 'absolute', right: '-20px', zIndex: 10, background: '#fff', border: '1px solid #ccc', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}
                    >
                      &#8250;
                    </button>
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