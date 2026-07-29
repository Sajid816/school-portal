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

  const [showSplash, setShowSplash] = useState(true);
  
  // New state for the dedicated footer
  const [footerData, setFooterData] = useState({
    kurparPhone: '',
    muktarparaPhone: '',
    facebook: '',
    email: ''
  });

  // Splash Screen Timer
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3500); 
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
          `}
        </style>

        <div className="glass-notice-box" style={{ 
          padding: '50px 80px', 
          textAlign: 'center', 
          background: 'rgba(255, 255, 255, 0.85)',
          animation: 'fadeInOut 3.5s ease-in-out',
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
              animation: 'logoReveal 3.5s ease-in-out'
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

      {/* Dedicated Home Footer */}
      <div style={{ 
        width: '100%', 
        background: 'rgba(0, 0, 0, 0.75)', 
        backdropFilter: 'blur(10px)',
        padding: '20px 40px', 
        marginTop: '60px', 
        display: 'flex', 
        flexDirection: 'row', 
        flexWrap: 'wrap',
        justifyContent: 'center', 
        alignItems: 'center',
        gap: '40px',
        color: 'white',
        boxSizing: 'border-box'
      }}>
        
        <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', textAlign: 'center' }}>
          {footerData.kurparPhone && (
            <span style={{ fontSize: '1rem', fontWeight: 'bold' }}>
              Contact (Kurpar): <span style={{ color: '#4da3ff', fontWeight: 'normal' }}>{footerData.kurparPhone}</span>
            </span>
          )}
          {footerData.muktarparaPhone && (
            <span style={{ fontSize: '1rem', fontWeight: 'bold' }}>
              Contact (Muktarpara): <span style={{ color: '#4da3ff', fontWeight: 'normal' }}>{footerData.muktarparaPhone}</span>
            </span>
          )}
        </div>

        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          {footerData.facebook && (
            <a href={footerData.facebook} target="_blank" rel="noreferrer" style={{ transition: 'transform 0.2s ease' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
              <img src="/pictures/FB.png" alt="Facebook" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
            </a>
          )}
          {footerData.email && (
            <a href={`mailto:${footerData.email}`} style={{ transition: 'transform 0.2s ease' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
              <img src="/pictures/mail.png" alt="Email" style={{ width: '38px', height: '38px', objectFit: 'contain' }} />
            </a>
          )}
        </div>

      </div>
    </div>
  );
}

export default Home;