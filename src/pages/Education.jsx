// src/pages/Education.jsx
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
    <div style={{ padding: '40px 20px', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', boxSizing: 'border-box' }}>
      <h1>Education & Academics</h1>
      <p style={{ marginBottom: '40px', color: '#ddd', textAlign: 'center', maxWidth: '600px' }}>
        Our curriculum structure per branch.
      </p>

      {loading ? <p>Loading...</p> : (
        <div style={{ width: '100%', maxWidth: '900px', display: 'flex', flexDirection: 'column', gap: '40px' }}>
          {BRANCHES.map(branch => {
            const branchExtras = extracurricularsMap[branch.id] || [];
            
            return (
              <div key={branch.id} className="glass-notice-box" style={{ padding: '30px', color: '#333' }}>
                <h2 style={{ color: '#0056b3', marginBottom: '20px' }}>{branch.name}</h2>
                
                {/* Row 1: Active Classes & Sections */}
                <h3 style={{ borderBottom: '2px solid #ccc', paddingBottom: '8px', marginBottom: '20px' }}>Academic Classes</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                  {orderedClasses.map(className => {
                    const sections = (sectionsMap[branch.id] && sectionsMap[branch.id][className]) || [];
                    if (sections.length === 0) return null;
                    return (
                      <div key={className} style={{ border: '1px solid #e0e0e0', borderRadius: '12px', padding: '15px', background: '#fff' }}>
                        <h3 style={{ margin: '0 0 10px 0' }}>📚 {className}</h3>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          {sections.map(s => (
                            <span key={s} style={{ background: '#0056b3', color: 'white', padding: '2px 8px', borderRadius: '10px', fontSize: '0.8rem' }}>Section {s}</span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Thin Glassy Separator Line */}
                <hr style={{ border: 'none', borderTop: '1px solid rgba(0,0,0,0.1)', margin: '35px 0' }} />

                {/* Row 2: Extracurricular Activities */}
                <h3 style={{ borderBottom: '2px solid #ccc', paddingBottom: '8px', marginBottom: '20px' }}>Extracurricular Activities</h3>
                {branchExtras.length === 0 ? (
                  <p style={{ fontStyle: 'italic', color: '#777' }}>No extracurricular activities assigned yet.</p>
                ) : (
                  <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                    {branchExtras.map(extra => (
                      <div key={extra} style={{ background: '#fff', border: '1px solid #e0e0e0', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', color: '#0056b3', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                        ✨ {extra}
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