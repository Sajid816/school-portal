import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

function Administration() {
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState({ branches: {}, governingBody: {}, accounts: {} });
  
  // Public Viewer State
  const [publicBranch, setPublicBranch] = useState('kurpar');

  const BRANCHES = [
    { id: 'kurpar', name: 'হলি চাইল্ড একাডেমি, কুরপাড়' },
    { id: 'moktarpara', name: 'হলি চাইল্ড একাডেমি, মোক্তারপাড়া' }
  ];

  useEffect(() => {
    const fetchAdministrationData = async () => {
      try {
        const docSnap = await getDoc(doc(db, "settings", "administrationData"));
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfiles({
            branches: data.branches || {},
            governingBody: data.governingBody || {},
            accounts: data.accounts || {}
          });
        }
      } catch (err) {
        console.error("Error loading administration data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdministrationData();
  }, []);

  if (loading) {
    return <div style={{ padding: '40px', color: '#222', textAlign: 'center', minHeight: '100vh', backgroundImage: 'url("/pictures/administration1.jpg")', backgroundSize: 'cover', backgroundAttachment: 'fixed' }}>Loading Administrative Profiles...</div>;
  }

  const activeBranchData = profiles.branches[publicBranch] || {};
  const governingData = profiles.governingBody || {};

  // Helper to render circular profiles
  const renderProfile = (roleKey, data, sizeClass) => {
    if (!data || !data.name) return null;
    
    // Sizing logic based on hierarchy
    const dimensions = sizeClass === 'large' ? '200px' : sizeClass === 'medium' ? '150px' : '120px';
    const nameSize = sizeClass === 'large' ? '1.8rem' : sizeClass === 'medium' ? '1.3rem' : '1.1rem';

    return (
      <div key={roleKey} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', maxWidth: '300px' }}>
        <div style={{ 
          width: dimensions, 
          height: dimensions, 
          borderRadius: '50%', 
          overflow: 'hidden', 
          border: `4px solid ${sizeClass === 'large' ? '#0056b3' : '#5d4068'}`,
          background: '#f0f0f0',
          boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
          marginBottom: '15px'
        }}>
          {data.imageUrl ? (
            <img src={data.imageUrl} alt={data.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ color: '#999', display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>No Photo</span>
          )}
        </div>
        
        <span style={{ textTransform: 'uppercase', fontSize: '0.85rem', fontWeight: 'bold', color: '#555', letterSpacing: '1px' }}>{roleKey}</span>
        <h2 style={{ margin: '5px 0', fontSize: nameSize, color: '#111' }}>{data.name}</h2>
        
        {data.message && sizeClass === 'large' && (
          <p style={{ fontStyle: 'italic', color: '#444', marginTop: '10px', fontSize: '1.1rem', lineHeight: '1.6' }}>
            "{data.message}"
          </p>
        )}
      </div>
    );
  };

  return (
    <div style={{ 
      padding: '60px 20px', 
      color: '#222', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      width: '100%', 
      minHeight: '100vh', 
      boxSizing: 'border-box',
      backgroundImage: 'url("/pictures/administration1.jpg")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundAttachment: 'fixed'
    }}>
      
      {/* HEADER & TABS */}
      <div style={{ textAlign: 'center', marginBottom: '50px' }}>
        <h1 style={{ fontSize: '3rem', color: '#111', margin: '0 0 10px 0', textShadow: '0 2px 10px rgba(255,255,255,0.8)' }}>School Administration</h1>
        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '20px', flexWrap: 'wrap' }}>
          {BRANCHES.map(branch => (
            <button 
              key={branch.id} 
              onClick={() => setPublicBranch(branch.id)}
              className="liquid-btn"
              style={{ 
                background: publicBranch === branch.id ? '#0056b3' : 'rgba(255,255,255,0.7)', 
                color: publicBranch === branch.id ? '#fff' : '#111', 
                border: '2px solid #0056b3',
                padding: '10px 25px', 
                fontSize: '1.1rem',
                fontWeight: 'bold',
                borderRadius: '30px',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              {branch.name}
            </button>
          ))}
        </div>
      </div>

      {/* 1. ACADEMIC BODY SECTION */}
      <div style={{ width: '100%', maxWidth: '1000px', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '80px' }}>
        <div style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)', padding: '10px 30px', borderRadius: '20px', marginBottom: '40px' }}>
          <h2 style={{ color: '#0056b3', margin: 0, textTransform: 'uppercase', letterSpacing: '2px' }}>Academic Body</h2>
        </div>

        {/* Principal (Top Level) */}
        <div style={{ marginBottom: '50px' }}>
          {renderProfile('Principal', activeBranchData['Principal'], 'large')}
        </div>

        {/* Vice Principals (Second Level) */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '60px', flexWrap: 'wrap', width: '100%' }}>
          {renderProfile('Vice Principal 1', activeBranchData['Vice Principal 1'], 'medium')}
          {renderProfile('Vice Principal 2', activeBranchData['Vice Principal 2'], 'medium')}
        </div>
        
        {/* Other Academic Staff */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', flexWrap: 'wrap', width: '100%', marginTop: '40px' }}>
          {renderProfile('Headmaster', activeBranchData['Headmaster'], 'small')}
          {renderProfile('Assistant Headmaster', activeBranchData['Assistant Headmaster'], 'small')}
        </div>
      </div>

      {/* 2. GOVERNING BODY SECTION (Static across branches) */}
      <div style={{ width: '100%', maxWidth: '1200px', display: 'flex', flexDirection: 'column', alignItems: 'center', borderTop: '2px solid rgba(0,0,0,0.1)', paddingTop: '60px' }}>
        <div style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)', padding: '10px 30px', borderRadius: '20px', marginBottom: '50px' }}>
          <h2 style={{ color: '#5d4068', margin: 0, textTransform: 'uppercase', letterSpacing: '2px' }}>Governing Body</h2>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '50px', flexWrap: 'wrap', width: '100%' }}>
          {/* {renderProfile('Chairman', governingData['Chairman'], 'medium')} */}
          {renderProfile('Managing Director 1', governingData['Managing Director 1'], 'medium')}
          {renderProfile('Managing Director 2', governingData['Managing Director 2'], 'medium')}
          {renderProfile('Managing Director 3', governingData['Managing Director 3'], 'medium')}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', flexWrap: 'wrap', width: '100%', marginTop: '50px' }}>
          {renderProfile('Director 1', governingData['Director 1'], 'small')}
          {renderProfile('Director 2', governingData['Director 2'], 'small')}
          {renderProfile('Director 3', governingData['Director 3'], 'small')}
        </div>
      </div>

    </div>
  );
}

export default Administration;