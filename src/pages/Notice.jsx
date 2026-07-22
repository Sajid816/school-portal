import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

function Notice() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "notices"));
        const fetchedNotices = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Sort newest first
        fetchedNotices.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
        setNotices(fetchedNotices);
      } catch (err) {
        console.error("Error fetching notices:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotices();
  }, []);

  // Utility to cleanly remove ".pdf" if the admin accidentally typed it in the title
  const cleanTitle = (title) => {
    if (!title) return "Official Notice";
    return title.replace(/\.pdf$/i, '').trim();
  };

  if (loading) {
    return (
      <div style={{ padding: '40px 20px', color: '#111', display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', minHeight: '100vh', boxSizing: 'border-box', backgroundImage: 'url("/pictures/notice.jpg")', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', backgroundAttachment: 'fixed' }}>
        <h2 style={{ background: 'rgba(255,255,255,0.8)', padding: '20px', borderRadius: '12px', backdropFilter: 'blur(10px)' }}>Loading Official Notices...</h2>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '60px 20px', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      width: '100%', 
      minHeight: '100vh', 
      boxSizing: 'border-box', 
      backgroundImage: 'url("/pictures/notice.jpg")', 
      backgroundSize: 'cover', 
      backgroundPosition: 'center', 
      backgroundRepeat: 'no-repeat', 
      backgroundAttachment: 'fixed' 
    }}>
      
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '900px' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ margin: 0, color: '#111', fontSize: '3rem', textShadow: '0 2px 10px rgba(255,255,255,0.5)' }}>Notice Board</h1>
          <p style={{ color: '#333', fontSize: '1.1rem', marginTop: '10px', fontWeight: 'bold' }}>Important academic and administrative documents</p>
        </div>

        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {notices.length === 0 ? (
            <div style={{ padding: '30px', background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(10px)', borderRadius: '12px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.4)' }}>
              <p style={{ margin: 0, color: '#555', fontStyle: 'italic', fontSize: '1.2rem' }}>No official notices are currently available.</p>
            </div>
          ) : (
            notices.map((notice) => (
              <div 
                key={notice.id} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  background: 'rgba(255, 255, 255, 0.7)', 
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  padding: '20px 25px', 
                  borderRadius: '16px',
                  border: '1px solid rgba(255,255,255,0.6)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                  flexWrap: 'wrap', 
                  gap: '20px',
                  transition: 'transform 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                
                {/* Document Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1, minWidth: '250px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.5rem' }}>📄</span>
                    <h3 style={{ margin: 0, color: '#111', fontSize: '1.3rem' }}>{cleanTitle(notice.title)}</h3>
                  </div>
                  <span style={{ fontSize: '0.85rem', color: '#555', marginLeft: '35px', fontWeight: 'bold' }}>
                    Posted: {new Date(notice.uploadedAt).toLocaleDateString()}
                  </span>
                </div>
                
                {/* Action Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
                  <a 
                    href={notice.url} 
                    target="_blank" 
                    rel="noreferrer" 
                    style={{ 
                      padding: '10px 20px', 
                      textDecoration: 'none', 
                      color: '#0056b3', 
                      fontWeight: 'bold', 
                      fontSize: '1rem',
                      background: 'rgba(255,255,255,0.8)',
                      border: '2px solid #0056b3',
                      borderRadius: '8px',
                      transition: 'background 0.3s'
                    }}
                    onMouseEnter={(e) => e.target.style.background = '#e6f0fa'}
                    onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.8)'}
                  >
                    👁️ View
                  </a>
                  
                  <a 
                    href={notice.url} 
                    download 
                    target="_blank" 
                    rel="noreferrer" 
                    style={{ 
                      padding: '12px 20px', 
                      textDecoration: 'none', 
                      color: 'white', 
                      fontWeight: 'bold', 
                      fontSize: '1rem',
                      background: '#0056b3',
                      borderRadius: '8px',
                      border: 'none',
                      boxShadow: '0 4px 12px rgba(0, 86, 179, 0.3)',
                      transition: 'background 0.3s'
                    }}
                    onMouseEnter={(e) => e.target.style.background = '#004494'}
                    onMouseLeave={(e) => e.target.style.background = '#0056b3'}
                  >
                    ⬇ Download
                  </a>
                </div>

              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}

export default Notice;