import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

function Gallery() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "gallery"));
        setImages(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error("Error loading gallery:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchGallery();
  }, []);

  if (loading) {
    return <div style={{ padding: '40px', color: 'white', textAlign: 'center' }}>Loading Gallery...</div>;
  }

  return (
    <div style={{ padding: '40px', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      <h1>Campus Gallery</h1>
      <p style={{ marginBottom: '40px', color: '#ddd' }}>Photos of the campus and student life</p>

      {images.length === 0 ? (
        <p style={{ fontStyle: 'italic', color: '#ccc' }}>No images uploaded yet.</p>
      ) : (
        <div className="glass-notice-box" style={{ width: '100%', maxWidth: '900px', padding: '30px' }}>
          
          {/* This is the strict 2-column grid layout */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: '20px', 
            width: '100%' 
          }}>
            {images.map((img) => (
              <div key={img.id} style={{ 
                borderRadius: '12px', 
                overflow: 'hidden', 
                background: 'rgba(255,255,255,0.2)',
                border: '1px solid rgba(255,255,255,0.4)',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
              }}>
                <img 
                  src={img.url} 
                  alt={img.caption} 
                  style={{ width: '100%', height: '250px', objectFit: 'cover', display: 'block' }} 
                />
                {img.caption && (
                  <div style={{ padding: '12px', background: 'rgba(255,255,255,0.9)', color: '#333', textAlign: 'center' }}>
                    <p style={{ margin: 0, fontWeight: 'bold', fontSize: '1rem', textTransform: 'capitalize' }}>
                      {img.caption}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
          
        </div>
      )}
    </div>
  );
}

export default Gallery;