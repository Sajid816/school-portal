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
    <div style={{ padding: '40px 20px', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', boxSizing: 'border-box' }}>
      <h1>Education & Academics</h1>
      <p style={{ marginBottom: '40px', color: '#ddd', textAlign: 'center', maxWidth: '600px' }}>
        Our curriculum structure per branch.
      </p>

      {loading ? <p>Loading...</p> : (
        <div style={{ width: '100%', maxWidth: '900px', display: 'flex', flexDirection: 'column', gap: '40px' }}>
          {BRANCHES.map(branch => (
            <div key={branch.id} className="glass-notice-box" style={{ padding: '30px', color: '#333' }}>
              <h2 style={{ color: '#0056b3', marginBottom: '20px' }}>{branch.name}</h2>
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
export default Education;