import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';

function Home() {
  const [tickerMessage, setTickerMessage] = useState('Loading announcements...');
  
  // Leadership State structured for Home Page Hierarchy
  const [leadership, setLeadership] = useState({
    principal: null,
    kurparVPs: [],
    moktarparaVPs: []
  });

  // Check window object: Resets on page reload, but remembers if navigating via navbar
  const [showSplash, setShowSplash] = useState(() => {
    return !window.hasShownSplash;
  });
  
  // New state for the dedicated footer
  const [footerData, setFooterData] = useState({
    kurparPhone: '',
    muktarparaPhone: '',
    facebook: '',
    email: ''
  });

  // Splash Screen Timer (Runs for 2.5s)
  useEffect(() => {
    if (showSplash) {
      const timer = setTimeout(() => {
        setShowSplash(false);
        window.hasShownSplash = true; // Mark as shown for this React session
      }, 2500); 
      return () => clearTimeout(timer);
    }
  }, [showSplash]);

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
    const fetchLeadership = async () => {
      try {
        const docSnap = await getDoc(doc(db, "settings", "administrationData"));
        if (docSnap.exists()) {
          const data = docSnap.data().branches || {};
          const kurpar = data.kurpar || {};
          const moktarpara = data.moktarpara || {};

          // 1. Grab single principal (checking kurpar first)
          let singlePrincipal = null;
          if (kurpar.Principal && kurpar.Principal.name) {
            singlePrincipal = kurpar.Principal;
          } else if (moktarpara.Principal && moktarpara.Principal.name) {
            singlePrincipal = moktarpara.Principal;
          }

          // 2. Extract Kurpar VPs
          const kVPs = [];
          if (kurpar['Vice Principal 1']?.name) kVPs.push(kurpar['Vice Principal 1']);
          if (kurpar['Vice Principal 2']?.name) kVPs.push(kurpar['Vice Principal 2']);

          // 3. Extract Moktarpara VPs
          const mVPs = [];
          if (moktarpara['Vice Principal 1']?.name) mVPs.push(moktarpara['Vice Principal 1']);
          if (moktarpara['Vice Principal 2']?.name) mVPs.push(moktarpara['Vice Principal 2']);

          setLeadership({
            principal: singlePrincipal,
            kurparVPs: kVPs,
            moktarparaVPs: mVPs
          });
        }
      } catch (err) { console.error(err); }
    };
    fetchLeadership();
  }, []);

  // Fetch Home Page Footer Data
  useEffect(() => {
    const fetchFooter = async () => {
      try {
        const docSnap = await getDoc(doc(db, "settings", "footerContact"));
        if (docSnap.exists()) {
          setFooterData(docSnap.data());
        }
      } catch (err) { console.error(err); }
    };
    fetchFooter();
  }, []);

  // Reusable component for rendering a profile card to keep code clean
  const ProfileCard = ({ person, roleLabel, isLarge }) => (
    <div style={{ 
      background: 'rgba(255, 255, 255, 0.75)', 
      backdropFilter: 'blur(12px)',
      borderRadius: '16px',
      padding: isLarge ? '40px' : '30px', 
      color: '#222', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      textAlign: 'center',
      maxWidth: isLarge ? '600px' : '450px',
      width: '100%',
      flex: '1',
      minWidth: '280px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
    }}>
      <div style={{ 
        width: isLarge ? '180px' : '130px', 
        height: isLarge ? '180px' : '130px', 
        borderRadius: '50%', 
        overflow: 'hidden', 
        border: `5px solid #0056b3`, 
        marginBottom: '20px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
        background: '#e0e0e0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {person.imageUrl ? (
          <img src={person.imageUrl} alt={person.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span style={{ color: '#888', fontSize: '0.9rem' }}>No Photo</span>
        )}
      </div>
      
      <h3 style={{ margin: '0 0 5px 0', fontSize: isLarge ? '2rem' : '1.5rem', color: '#111' }}>{person.name}</h3>
      <span style={{ color: '#0056b3', fontWeight: 'bold', fontSize: '1rem', marginBottom: '15px', letterSpacing: '1px', textTransform: 'uppercase' }}>
        {roleLabel}
      </span>
      
      {person.message && (
        <div style={{ position: 'relative', marginTop: '10px' }}>
          <span style={{ position: 'absolute', top: '-15px', left: '-15px', fontSize: '2.5rem', color: 'rgba(0, 86, 179, 0.2)' }}>"</span>
          <p style={{ fontStyle: 'italic', color: '#444', lineHeight: '1.6', fontSize: isLarge ? '1.15rem' : '1rem', padding: '0 15px', margin: 0 }}>
            {person.message}
          </p>
          <span style={{ position: 'absolute', bottom: '-25px', right: '-10px', fontSize: '2.5rem', color: 'rgba(0, 86, 179, 0.2)' }}>"</span>
        </div>
      )}
    </div>
  );

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
        <style>
          {`
            @keyframes logoReveal {
              0% { opacity: 0; filter: blur(10px); transform: scale(0.9); }
              20% { opacity: 1; filter: blur(0px); transform: scale(1); }
              80% { opacity: 1; filter: blur(0px); transform: scale(1); }
              100% { opacity: 0; filter: blur(10px); transform: scale(1.1); }
            }
            @keyframes fadeInOut {
              0% { opacity: 0; }
              15% { opacity: 1; }
              85% { opacity: 1; }
              100% { opacity: 0; }
            }
          `}
        </style>

        <div className="glass-notice-box" style={{ 
          padding: '50px 80px', 
          textAlign: 'center', 
          background: 'rgba(255, 255, 255, 0.85)',
          animation: 'fadeInOut 2.5s ease-in-out forwards',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px'
        }}>
          <img 
            src="/pictures/school logo.png" 
            alt="Holy Child Academy Logo" 
            style={{ 
              width: '140px', 
              height: 'auto',
              animation: 'logoReveal 2.5s ease-in-out forwards'
            }} 
          />
          <h1 style={{ color: '#111', fontSize: '3.5rem', margin: '0' }}>Welcome to Holy Child Academy</h1>
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

      <div style={{ width: '100%', maxWidth: '1200px', display: 'flex', flexDirection: 'column', gap: '50px', alignItems: 'center', padding: '0 20px', flex: 1 }}>
        
        {/* LEADERSHIP HIERARCHY */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          
          {/* 1. Singular Principal Block */}
          {leadership.principal && (
            <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginBottom: '40px' }}>
              <ProfileCard person={leadership.principal} roleLabel="Principal" isLarge={true} />
            </div>
          )}

          {/* 2. Kurpar Vice Principals Block */}
          {leadership.kurparVPs.length > 0 && (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '40px' }}>
              <h3 style={{ margin: '0 0 20px 0', color: '#111', textShadow: '0 2px 10px rgba(255,255,255,0.8)' }}>Vice Principals (কুরপাড় শাখা)</h3>
              <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '30px', width: '100%' }}>
                {leadership.kurparVPs.map((vp, idx) => (
                  <ProfileCard key={`k-${idx}`} person={vp} roleLabel="Vice Principal" isLarge={false} />
                ))}
              </div>
            </div>
          )}

          {/* 3. Moktarpara Vice Principals Block */}
          {leadership.moktarparaVPs.length > 0 && (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <h3 style={{ margin: '0 0 20px 0', color: '#111', textShadow: '0 2px 10px rgba(255,255,255,0.8)' }}>Vice Principals (মোক্তারপাড়া শাখা)</h3>
              <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '30px', width: '100%' }}>
                {leadership.moktarparaVPs.map((vp, idx) => (
                  <ProfileCard key={`m-${idx}`} person={vp} roleLabel="Vice Principal" isLarge={false} />
                ))}
              </div>
            </div>
          )}

        </div>

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
        }}>
          <h2 style={{ color: '#111', fontSize: '1.6rem', marginBottom: '15px' }}>আমাদের সম্পর্কে (About Us)</h2>
          <p style={{ color: '#444', fontSize: '1.1rem', lineHeight: '1.8', maxWidth: '800px', margin: '0 auto' }}>
            Holy Child Academy is committed to fostering excellence in education. 
            We strive to build a foundation of lifelong learning, guiding students toward brighter futures 
            through dedicated teaching, modern facilities, and a supportive community environment across both our campuses.
          </p>
        </div>

      </div>

      {/* Beautiful Designed Home Footer */}
      <div style={{ 
        width: '100%', 
        background: 'linear-gradient(135deg, #002d5e 0%, #0056b3 100%)', 
        padding: '50px 20px 30px 20px', 
        marginTop: '80px', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        gap: '40px',
        color: 'white',
        boxSizing: 'border-box',
        boxShadow: '0 -10px 30px rgba(0,0,0,0.15)'
      }}>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '50px', width: '100%', maxWidth: '1000px' }}>
          
          {/* Phone Information */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', textAlign: 'center', justifyContent: 'center' }}>
            <h4 style={{ margin: 0, fontSize: '1.3rem', color: '#80bfff', letterSpacing: '1px', textTransform: 'uppercase' }}>Contact Us</h4>
            {footerData.kurparPhone && (
              <div style={{ fontSize: '1.1rem' }}>
                <span style={{ fontWeight: 'bold' }}>Kurpar:</span> {footerData.kurparPhone}
              </div>
            )}
            {footerData.muktarparaPhone && (
              <div style={{ fontSize: '1.1rem' }}>
                <span style={{ fontWeight: 'bold' }}>Muktarpara:</span> {footerData.muktarparaPhone}
              </div>
            )}
          </div>

          {/* Large Social Buttons */}
          <div style={{ display: 'flex', gap: '25px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
            
            {/* Facebook Button */}
            {footerData.facebook && (
              <a href={footerData.facebook} target="_blank" rel="noreferrer" 
                 style={{ 
                   display: 'flex', alignItems: 'center', justifyContent: 'center',
                   width: '110px', height: '75px', 
                   background: 'linear-gradient(135deg, #e6f0ff 0%, #ffffff 100%)', 
                   borderRadius: '20px', border: '2px solid #b3d4ff',
                   transition: 'all 0.3s ease', boxShadow: '0 8px 20px rgba(0,0,0,0.2)'
                 }} 
                 onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px) scale(1.05)'; e.currentTarget.style.boxShadow = '0 12px 25px rgba(0,0,0,0.3)'; }} 
                 onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0px) scale(1)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.2)'; }}
              >
                <img src="/pictures/FB.png" alt="Facebook" style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
              </a>
            )}

            {/* YouTube Button */}
            <a href="https://youtube.com/@holychildacademy4192?si=ATYqtBrjzKKZG7pG" target="_blank" rel="noreferrer" 
               style={{ 
                 display: 'flex', alignItems: 'center', justifyContent: 'center',
                 width: '110px', height: '75px', 
                 background: 'linear-gradient(135deg, #ffe6e6 0%, #ffffff 100%)', 
                 borderRadius: '20px', border: '2px solid #ffb3b3',
                 transition: 'all 0.3s ease', boxShadow: '0 8px 20px rgba(0,0,0,0.2)'
               }} 
               onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px) scale(1.05)'; e.currentTarget.style.boxShadow = '0 12px 25px rgba(0,0,0,0.3)'; }} 
               onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0px) scale(1)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.2)'; }}
            >
              <img src="/pictures/youtube.png" alt="YouTube" style={{ width: '60px', height: '60px', objectFit: 'contain' }} onError={(e) => e.target.style.display='none'} />
            </a>

            {/* Email Button */}
            {footerData.email && (
              <a href={`mailto:${footerData.email}`}
                 style={{ 
                   display: 'flex', alignItems: 'center', justifyContent: 'center',
                   width: '110px', height: '75px', 
                   background: 'linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%)', 
                   borderRadius: '20px', border: '2px solid #cccccc',
                   transition: 'all 0.3s ease', boxShadow: '0 8px 20px rgba(0,0,0,0.2)'
                 }} 
                 onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px) scale(1.05)'; e.currentTarget.style.boxShadow = '0 12px 25px rgba(0,0,0,0.3)'; }} 
                 onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0px) scale(1)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.2)'; }}
              >
                <img src="/pictures/mail.png" alt="Email" style={{ width: '50px', height: '50px', objectFit: 'contain' }} />
              </a>
            )}

          </div>
        </div>

        {/* Copyright Line */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '20px', width: '100%', maxWidth: '1000px', textAlign: 'center', fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>
          © {new Date().getFullYear()} Holy Child Academy. All rights reserved.
        </div>

      </div>
    </div>
  );
}

export default Home;