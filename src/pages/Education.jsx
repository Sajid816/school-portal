import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

function Education() {
  const [sectionsMap, setSectionsMap] = useState({});
  const [loading, setLoading] = useState(true);

  const BRANCHES = [
    { id: 'kurpar', name: 'হলি চাইল্ড একাডেমি, কুরপাড়' },
    { id: 'moktarpara', name: 'হলি চাইল্ড একাডেমি, মোক্তারপাড়া' }
  ];
  
  const orderedClasses = ["Playgroup", "Nursery", "KG", "Class 1", "Class 2", "Class 3", "Class 4", "Class 5"];

  // Co-curricular activities paired with their respective sticker PNG paths
  const CO_CURRICULAR = [
    { name: "Swimming", sticker: "/pictures/stickers/swimming.png" },
    { name: "Drawing", sticker: "/pictures/stickers/drawing.png" },
    { name: "Class Party", sticker: "/pictures/stickers/party.png" },
    { name: "Annual Sports", sticker: "/pictures/stickers/sports.png" },
    { name: "Presentation", sticker: "/pictures/stickers/presentation.png" },
    { name: "Cultural Activities", sticker: "/pictures/stickers/cultural.png" }
  ];

  useEffect(() => {
    const fetchSections = async () => {
      try {
        const docSnap = await getDoc(doc(db, "settings", "classSections"));
        if (docSnap.exists()) {
          setSectionsMap(docSnap.data().branchMapping || {});
        }
      } catch (err) {
        console.error("Error fetching class sections:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSections();
  }, []);

  return (
    <div style={{ 
      padding: '40px 20px', 
      color: '#222', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      width: '100%', 
      minHeight: '100vh', 
      boxSizing: 'border-box', 
      backgroundImage: 'url("/pictures/education.jpg")', 
      backgroundSize: 'cover', 
      backgroundPosition: 'center', 
      backgroundRepeat: 'no-repeat', 
      backgroundAttachment: 'fixed' 
    }}>
      <h1 style={{ color: '#111' }}>Education & Academics</h1>
      <p style={{ marginBottom: '40px', color: '#444', textAlign: 'center', maxWidth: '600px', fontSize: '1.1rem' }}>
        Our curriculum structure and vibrant campus activities.
      </p>

      {loading ? (
        <div style={{ background: 'rgba(255,255,255,0.8)', padding: '20px', borderRadius: '8px', fontWeight: 'bold' }}>
          Loading...
        </div>
      ) : (
        <div style={{ width: '100%', maxWidth: '900px', display: 'flex', flexDirection: 'column', gap: '40px' }}>
          
          {/* ACADEMIC CLASSES (Separated by Branch) */}
          {BRANCHES.map(branch => {
            return (
              <div key={branch.id} className="glass-notice-box" style={{ padding: '30px', color: '#333' }}>
                <h2 style={{ color: '#0056b3', marginBottom: '20px', borderBottom: '2px solid #ccc', paddingBottom: '10px' }}>{branch.name}</h2>
                <h3 style={{ marginBottom: '20px', fontSize: '1.4rem', color: '#444' }}>Academic Classes</h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                  {orderedClasses.map(className => {
                    const sections = (sectionsMap[branch.id] && sectionsMap[branch.id][className]) || [];
                    if (sections.length === 0) return null;
                    return (
                      <div key={className} style={{ border: '1px solid #e0e0e0', borderRadius: '12px', padding: '15px', background: 'rgba(255,255,255,0.85)' }}>
                        <h3 style={{ margin: '0 0 10px 0', color: '#222' }}>📚 {className}</h3>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          {sections.map(s => (
                            <span key={s} style={{ background: '#0056b3', color: 'white', padding: '4px 10px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 'bold' }}>Section {s}</span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* CO-CURRICULAR ACTIVITIES (Glassy Cascading Layout with Stickers) */}
          <div className="glass-notice-box" style={{ padding: '35px', color: '#333' }}>
            <h2 style={{ color: '#0056b3', marginBottom: '30px', borderBottom: '2px solid rgba(0, 86, 179, 0.2)', paddingBottom: '10px' }}>
              Co-curricular Activities
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', position: 'relative', paddingLeft: '45px', marginLeft: '15px' }}>
              
              {/* Main Vertical Cascading Line */}
              <div style={{ position: 'absolute', left: 0, top: '20px', bottom: '30px', width: '3px', background: '#0056b3', borderRadius: '2px' }}></div>

              {CO_CURRICULAR.map((item, index) => (
                <div key={item.name} style={{ position: 'relative', display: 'flex', alignItems: 'center', marginTop: index === 0 ? '0px' : '20px' }}>
                  
                  {/* Horizontal Branch Connector Line */}
                  <div style={{ position: 'absolute', left: '-45px', width: '45px', height: '3px', background: '#0056b3' }}></div>

                  {/* Activity Glass Card Container */}
                  <div 
                    style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      gap: '15px',
                      background: 'rgba(255, 255, 255, 0.75)', 
                      backdropFilter: 'blur(10px)',
                      WebkitBackdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.8)',
                      padding: '10px 22px', 
                      borderRadius: '12px', 
                      color: '#111', 
                      fontSize: '1.2rem',
                      fontWeight: 'bold',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                      transition: 'transform 0.2s ease, background 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateX(5px)';
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateX(0px)';
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.75)';
                    }}
                  >
                    {/* Activity Sticker Icon */}
                    <img 
                      src={item.sticker} 
                      alt={item.name} 
                      style={{ 
                        width: '32px', 
                        height: '32px', 
                        objectFit: 'contain',
                        filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.15))' 
                      }} 
                      onError={(e) => {
                        // Fallback handling if sticker file is missing
                        e.target.style.display = 'none';
                      }}
                    />

                    <span>{item.name}</span>
                  </div>

                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

export default Education;