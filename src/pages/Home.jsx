import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, collection, getDocs, onSnapshot } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

function Home() {
  const [tickerMessage, setTickerMessage] = useState('Loading announcements...');
  const [newsImages, setNewsImages] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  // Fetch Ticker
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "settings", "ticker"), (docSnap) => {
      if (docSnap.exists()) {
        setTickerMessage(docSnap.data().message || '');
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch News Carousel Images
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "news"));
        const images = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Sort by newest first based on uploadedAt timestamp
        images.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
        setNewsImages(images);
      } catch (err) {
        console.error("Failed to load news images", err);
      }
    };
    fetchNews();
  }, []);

  // Auto-fading Carousel Logic (changes every 5 seconds)
  useEffect(() => {
    if (newsImages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % newsImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [newsImages]);

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      
      {/* Moving News Ticker */}
      <div className="news-ticker" style={{ overflow: 'hidden', whiteSpace: 'nowrap', width: '100%', borderRadius: '8px', marginBottom: '30px', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
        <marquee behavior="scroll" direction="left" scrollamount="6" style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
          {tickerMessage}
        </marquee>
      </div>

      <div style={{ width: '100%', maxWidth: '1000px', display: 'flex', flexDirection: 'column', gap: '30px', alignItems: 'center' }}>
        
        {/* Hero Welcome & Action Box */}
        <div className="glass-notice-box" style={{ width: '100%', padding: '40px', textAlign: 'center', boxSizing: 'border-box' }}>
          <h1 style={{ color: '#111', fontSize: '2.5rem', margin: '0 0 10px 0' }}>Welcome to Holy Child Academy</h1>
          <p style={{ color: '#444', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto 30px auto' }}>
            Fostering excellence in education and building brighter futures for our students.
          </p>
          
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/results')} className="login-btn" style={{ margin: 0, width: 'auto', padding: '12px 30px', fontSize: '1.1rem' }}>
              📝 View Class Results
            </button>
            <button onClick={() => navigate('/admissions')} className="liquid-btn" style={{ padding: '12px 30px', fontSize: '1.1rem', background: 'rgba(255,255,255,0.6)' }}>
              🎓 Admissions Info
            </button>
          </div>
        </div>

        {/* Dynamic News Image Carousel */}
        {newsImages.length > 0 && (
          <div className="glass-notice-box" style={{ width: '100%', padding: '20px', boxSizing: 'border-box' }}>
            <h3 style={{ margin: '0 0 15px 0', borderBottom: '2px solid rgba(0,0,0,0.1)', paddingBottom: '8px' }}>Latest Campus News</h3>
            
            <div style={{ position: 'relative', width: '100%', height: '450px', borderRadius: '12px', overflow: 'hidden', background: '#000' }}>
              {newsImages.map((img, index) => (
                <div 
                  key={img.id} 
                  style={{
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                    opacity: index === currentSlide ? 1 : 0,
                    transition: 'opacity 1s ease-in-out',
                    zIndex: index === currentSlide ? 10 : 1
                  }}
                >
                  <img src={img.url} alt={img.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  
                  {/* Glassy caption banner at the bottom of the image */}
                  {img.title && (
                    <div style={{ position: 'absolute', bottom: '20px', left: '20px', right: '20px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', color: 'white', padding: '15px', borderRadius: '8px' }}>
                      <h4 style={{ margin: 0, fontSize: '1.2rem' }}>{img.title}</h4>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {/* Carousel Dots */}
            {newsImages.length > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '15px' }}>
                {newsImages.map((_, i) => (
                  <div key={i} onClick={() => setCurrentSlide(i)} style={{ width: '12px', height: '12px', borderRadius: '50%', background: i === currentSlide ? '#0056b3' : '#ccc', cursor: 'pointer', transition: 'background 0.3s' }} />
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

export default Home;