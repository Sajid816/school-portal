import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

function Education() {
  const [sectionsMap, setSectionsMap] = useState({});
  const [extracurricularsMap, setExtracurricularsMap] = useState({});
  const [loading, setLoading] = useState(true);

  const BRANCHES = [
    { id: 'kurpar', name: 'হলি চাইল্ড একাডেমি, কুরপাড়' },
    { id: 'moktarpara', name: 'হলি চাইল্ড একাডেমি, মোক্তারপাড়া' }
  ];
  const orderedClasses = ["Playgroup", "Nursery", "KG", "Class 1", "Class 2", "Class 3", "Class 4", "Class 5"];

  useEffect(() => {
    const fetchSections = async () => {
      try {
        const docSnap = await getDoc(doc(db, "settings", "classSections"));
        if (docSnap.exists()) {
          setSectionsMap(docSnap.data().branchMapping || {});
          setExtracurricularsMap(docSnap.data().extracurriculars || {});
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
      color: '#222', /* Changed to dark text to fix washed-out legibility on light backgrounds */
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
        Our curriculum structure per branch.
      </p>

      {loading ? (
        <div style={{ background: 'rgba(255,255,255,0.8)', padding: '20px', borderRadius: '8px', fontWeight: 'bold' }}>
          Loading...
        </div>
      ) : (
        <div style={{ width: '100%', maxWidth: '900px', display: 'flex', flexDirection: 'column', gap: '40px' }}>
          {BRANCHES.map(branch => {
            const branchExtras = extracurricularsMap[branch.id] || [];
            
            return (
              <div key={branch.id} className="glass-notice-box" style={{ padding: '30px', color: '#333' }}>
                <h2 style={{ color: '#0056b3', marginBottom: '20px', borderBottom: '2px solid #ccc', paddingBottom: '10px' }}>{branch.name}</h2>
                
                {/* Row 1: Active Classes & Sections */}
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

                {/* Thin Glassy Separator Line */}
                <hr style={{ border: 'none', borderTop: '1px solid rgba(0,0,0,0.1)', margin: '35px 0' }} />

                {/* Row 2: Extracurricular Activities (Flowchart Style) */}
                <h3 style={{ marginBottom: '20px', fontSize: '1.4rem', color: '#444' }}>Co-curricular Activities</h3>
                
                {branchExtras.length === 0 ? (
                  <p style={{ fontStyle: 'italic', color: '#777' }}>No co-curricular activities assigned yet.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', position: 'relative', paddingLeft: '40px', marginLeft: '10px' }}>
                    
                    {/* Main Vertical Flowchart Stem */}
                    <div style={{ position: 'absolute', left: 0, top: 0, bottom: '25px', width: '2px', background: '#5d4068' }}></div>

                    {branchExtras.map((extra, index) => (
                      <div key={extra} style={{ position: 'relative', display: 'flex', alignItems: 'center', marginTop: index === 0 ? '10px' : '25px' }}>
                        
                        {/* Horizontal Flowchart Branch Line */}
                        <div style={{ position: 'absolute', left: '-40px', width: '40px', height: '2px', background: '#5d4068' }}></div>

                        {/* Individual Activity Node Block */}
                        <div style={{ 
                          background: 'rgba(240, 235, 245, 0.95)', 
                          border: '1px solid rgba(93, 64, 104, 0.2)',
                          padding: '10px 25px', 
                          borderRadius: '4px', 
                          color: '#5d4068', 
                          fontSize: '1.2rem',
                          fontWeight: '500',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                        }}>
                          {extra}
                        </div>

                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Education;