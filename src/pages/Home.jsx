import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
// import { collection, getDocs } from 'firebase/firestore'; // Uncomment if restoring news/notices

function Home() {
  const [tickerMessage, setTickerMessage] = useState('Loading announcements...');
  const [principals, setPrincipals] = useState([]);
  const [showSplash, setShowSplash] = useState(true);
  
  /* --- COMMENTED OUT: Previous State Variables --- 
  const [newsImages, setNewsImages] = useState([]);
  const [notices, setNotices] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  ------------------------------------------------ */

  // Splash Screen Timer
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3500); // 3.5 seconds
    return () => clearTimeout(timer);
  }, []);

  // Fetch Ticker
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "settings", "ticker"), (docSnap) => {
      if (docSnap.exists()) {
        setTickerMessage(docSnap.data().message || '');
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch Principals dynamically from Administration Data
  useEffect(() => {
    const fetchPrincipals = async () => {
      try {
        const docSnap = await getDoc(doc(db, "settings", "administrationData"));
        if (docSnap.exists()) {
          const data = docSnap.data().branches || {};
          let extractedPrincipals = [];
          
          Object.keys(data).forEach(branchKey => {
            if (data[branchKey].Principal && data[branchKey].Principal.name) {
              extractedPrincipals.push({
                branch: branchKey === 'kurpar' ? 'কুরপাড়' : 'মোক্তারপাড়া',
                ...data[branchKey].Principal
              });
            }
          });
          setPrincipals(extractedPrincipals);
        }
      } catch (err) { console.error(err); }
    };
    fetchPrincipals();
  }, []);

  /* --- COMMENTED OUT: News & Notices Fetching & Logic ---
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "news"));
        const images = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        images.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
        setNewsImages(images);
      } catch (err) { console.error(err); }
    };
    fetchNews();
  }, []);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "notices"));
        const fetchedNotices = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        fetchedNotices.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
        setNotices(fetchedNotices);
      } catch (err) { console.error(err); }
    };
    fetchNotices();
  }, []);

  useEffect(() => {
    if (newsImages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % newsImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [newsImages]);
  --------------------------------------------------------- */

  // 1. SPLASH SCREEN RENDER
  if (showSplash) {
    return (
      <div style={{ 
        width: '100%', 
        minHeight: '100vh', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        boxSizing: 'border-box',
        backgroundImage: 'url("/pictures/home.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}>
        <div className="glass-notice-box" style={{ 
          padding: '50px 80px', 
          textAlign: 'center', 
          background: 'rgba(255, 255, 255, 0.85)',
          animation: 'fadeInOut 3.5s ease-in-out' // Optional: if you add a css animation
        }}>
          <h1 style={{ color: '#111', fontSize: '3.5rem', margin: '0' }}>Welcome to Holy Child Academy</h1>
          {/* Subtitle removed as requested */}
        </div>
      </div>
    );
  }

  // 2. MAIN HOMEPAGE RENDER
  return (
    <div style={{ 
      width: '100%', 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      boxSizing: 'border-box',
      backgroundImage: 'url("/pictures/home.jpg")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundAttachment: 'fixed'
    }}>
      
      {/* Moving News Ticker */}
      <div className="news-ticker" style={{ overflow: 'hidden', whiteSpace: 'nowrap', width: '100%', borderRadius: '8px', marginBottom: '40px', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
        <marquee behavior="scroll" direction="left" scrollamount="6" style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
          {tickerMessage}
        </marquee>
      </div>

      <div style={{ width: '100%', maxWidth: '1200px', display: 'flex', flexDirection: 'column', gap: '50px', alignItems: 'center', padding: '0 20px' }}>
        
        {/* Principals Section - Prominent & Centered */}
        {principals.length > 0 && (
          <div style={{ width: '100%', display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '40px' }}>
            {principals.map((principal, idx) => (
              <div key={idx} style={{ 
                background: 'rgba(255, 255, 255, 0.75)', 
                backdropFilter: 'blur(12px)',
                borderRadius: '16px',
                padding: '40px', 
                color: '#222', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                textAlign: 'center',
                maxWidth: '600px',
                width: '100%',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
              }}>
                <div style={{ 
                  width: '180px', 
                  height: '180px', 
                  borderRadius: '50%', 
                  overflow: 'hidden', 
                  border: '5px solid #0056b3', 
                  marginBottom: '20px',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                }}>
                  {principal.imageUrl ? (
                    <img src={principal.imageUrl} alt={principal.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ background: '#ccc', width: '100%', height: '100%' }}></div>
                  )}
                </div>
                
                <h3 style={{ margin: '0 0 5px 0', fontSize: '2rem', color: '#111' }}>{principal.name}</h3>
                <span style={{ color: '#0056b3', fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '20px', letterSpacing: '1px' }}>
                  Principal ({principal.branch} শাখা)
                </span>
                
                {principal.message && (
                  <div style={{ position: 'relative', marginTop: '10px' }}>
                    <span style={{ position: 'absolute', top: '-15px', left: '-20px', fontSize: '3rem', color: 'rgba(0, 86, 179, 0.2)' }}>"</span>
                    <p style={{ fontStyle: 'italic', color: '#444', lineHeight: '1.8', fontSize: '1.15rem', padding: '0 20px', margin: 0 }}>
                      {principal.message}
                    </p>
                    <span style={{ position: 'absolute', bottom: '-30px', right: '-10px', fontSize: '3rem', color: 'rgba(0, 86, 179, 0.2)' }}>"</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* --- COMMENTED OUT: Dynamic News Image Canvas ---
        {newsImages.length > 0 && (
          <div style={{ width: '100%', boxSizing: 'border-box', position: 'relative' }}>
            <div style={{ position: 'relative', width: '100%', height: '600px', borderRadius: '12px', overflow: 'hidden', background: '#000', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
              {newsImages.map((img, index) => (
                <div 
                  key={img.id} 
                  style={{
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                    opacity: index === currentSlide ? 1 : 0,
                    transition: 'opacity 1.5s ease-in-out',
                    zIndex: index === currentSlide ? 10 : 1
                  }}
                >
                  <img src={img.url} alt={img.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  {img.title && (
                    <div style={{ position: 'absolute', bottom: '30px', left: '30px', right: '30px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', color: 'white', padding: '20px', borderRadius: '12px' }}>
                      <h2 style={{ margin: 0, fontSize: '1.8rem', textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>{img.title}</h2>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {newsImages.length > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
                {newsImages.map((_, i) => (
                  <div key={i} onClick={() => setCurrentSlide(i)} style={{ width: '15px', height: '15px', borderRadius: '50%', background: i === currentSlide ? '#fff' : 'rgba(255,255,255,0.4)', cursor: 'pointer', transition: 'background 0.3s', boxShadow: '0 2px 4px rgba(0,0,0,0.3)' }} />
                ))}
              </div>
            )}
          </div>
        )}
        ----------------------------------------------------- */}


        {/* --- COMMENTED OUT: Home Page Notice Board ---
        <div className="glass-notice-box" style={{ width: '100%', padding: '30px', boxSizing: 'border-box' }}>
          <h2 style={{ borderBottom: '2px solid #0056b3', paddingBottom: '10px', color: '#111', margin: '0 0 25px 0' }}>📌 Official Notice Board</h2>
          {notices.length === 0 ? (
            <p style={{ color: '#777', fontStyle: 'italic' }}>No active notices at this time.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {notices.map(notice => (
                <div key={notice.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.7)', padding: '15px 20px', borderRadius: '8px', border: '1px solid #ddd', flexWrap: 'wrap', gap: '15px' }}>
                  <div>
                    <h3 style={{ margin: '0 0 5px 0', color: '#222', fontSize: '1.1rem' }}>{notice.title}</h3>
                    <span style={{ fontSize: '0.85rem', color: '#666' }}>Posted: {new Date(notice.uploadedAt).toLocaleDateString()}</span>
                  </div>
                  <a href={notice.url} target="_blank" rel="noreferrer" className="liquid-btn" style={{ padding: '8px 16px', fontSize: '0.9rem', textDecoration: 'none', background: '#0056b3', color: 'white' }}>
                    Download PDF ⬇
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
        -------------------------------------------------- */}


        {/* About Us Section */}
        <div style={{ 
          width: '100%', 
          background: 'rgba(255, 255, 255, 0.85)', 
          backdropFilter: 'blur(10px)',
          borderRadius: '16px', 
          padding: '40px', 
          textAlign: 'center', 
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          marginTop: '20px',
          marginBottom: '60px'
        }}>
          <h2 style={{ color: '#111', fontSize: '2.2rem', marginBottom: '20px' }}>আমাদের সম্পর্কে (About Us)</h2>
          <p style={{ color: '#444', fontSize: '1.1rem', lineHeight: '1.8', maxWidth: '800px', margin: '0 auto' }}>
            Holy Child Academy is committed to fostering excellence in education. 
            We strive to build a foundation of lifelong learning, guiding students toward brighter futures 
            through dedicated teaching, modern facilities, and a supportive community environment across both our campuses.
          </p>
        </div>

      </div>
    </div>
  );
}

export default Home;