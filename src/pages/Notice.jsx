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

  if (loading) {
    return (
      <div style={{ padding: '40px 20px', color: '#111', display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', minHeight: '100vh', boxSizing: 'border-box', backgroundImage: 'url("/pictures/notice.jpg")', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', backgroundAttachment: 'fixed' }}>
        <h2 style={{ background: 'rgba(255,255,255,0.8)', padding: '20px', borderRadius: '8px' }}>Loading Official Notices...</h2>
      </div>
    );
  }

  return (
    <div style={{ padding: '60px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', minHeight: '100vh', boxSizing: 'border-box', backgroundImage: 'url("/pictures/notice.jpg")', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', backgroundAttachment: 'fixed' }}>
      
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '100%', maxWidth: '800px' }}>
        
        {/* Root Node: Notice Box */}
        <div style={{ border: '2px solid #5d4068', padding: '15px 50px', background: 'rgba(255,255,255,0.9)', marginBottom: '0', zIndex: 2, position: 'relative' }}>
          <h1 style={{ margin: 0, color: '#5d4068', fontSize: '3rem', fontWeight: 'normal' }}>Notice</h1>
        </div>

        {/* Tree Structure Container */}
        <div style={{ display: 'flex', flexDirection: 'column', position: 'relative', paddingLeft: '50px', marginLeft: '50px' }}>
          
          {/* Main Vertical Stem */}
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: '50px', width: '2px', background: '#5d4068' }}></div>

          {notices.length === 0 ? (
            <div style={{ marginTop: '40px', padding: '20px', background: 'rgba(255,255,255,0.8)', borderRadius: '8px' }}>
              <p style={{ margin: 0, color: '#555', fontStyle: 'italic', fontSize: '1.2rem' }}>No official notices are currently available.</p>
            </div>
          ) : (
            notices.map((notice) => (
              <div key={notice.id} style={{ position: 'relative', display: 'flex', alignItems: 'center', marginTop: '40px' }}>
                
                {/* Horizontal Branch Line */}
                <div style={{ position: 'absolute', left: '-50px', width: '50px', height: '2px', background: '#5d4068' }}></div>

                {/* Individual Notice Block */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(235, 218, 218, 0.95)', padding: '10px 20px', minWidth: '400px', flexWrap: 'wrap', gap: '20px' }}>
                  <h3 style={{ margin: 0, color: '#5d4068', fontSize: '1.6rem', fontWeight: 'normal', flex: 1 }}>{notice.title}</h3>
                  
                  <a href={notice.url} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: '#c92a2a', fontWeight: 'bold', fontSize: '1.2rem' }}>
                    <span style={{ fontSize: '1.8rem' }}>📄</span>
                    download now
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