import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

function Education() {
  const [sectionsMap, setSectionsMap] = useState({});
  const [loading, setLoading] = useState(true);

  // Defining the standard order of classes
  const orderedClasses = ["Playgroup", "Nursery", "KG", "Class 1", "Class 2", "Class 3", "Class 4", "Class 5"];

  useEffect(() => {
    const fetchSections = async () => {
      try {
        const docSnap = await getDoc(doc(db, "settings", "classSections"));
        if (docSnap.exists()) {
          setSectionsMap(docSnap.data().mapping || {});
        }
      } catch (err) {
        console.error("Error fetching class sections:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSections();
  }, []);

  // Filter out classes that have 0 active sections
  const activeClasses = orderedClasses.filter(c => sectionsMap[c] && sectionsMap[c].length > 0);

  return (
    <div style={{ padding: '40px 20px', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', boxSizing: 'border-box' }}>
      <h1>Education & Academics</h1>
      <p style={{ marginBottom: '30px', color: '#ddd', textAlign: 'center', maxWidth: '600px' }}>
        Our curriculum is designed to foster holistic development. Below is the current academic structure for our active classes and their respective sections.
      </p>

      <div className="glass-notice-box" style={{ width: '100%', maxWidth: '900px', padding: '30px', color: '#333' }}>
        
        {/* Branch Hierarchy Level */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ color: '#0056b3', margin: '0 0 15px 0' }}>Our Campuses</h2>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <span style={{ background: '#f0f4f8', padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', border: '1px solid #dcdcdc', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              📍 হলি চাইল্ড একাডেমি, কুরপাড়
            </span>
            <span style={{ background: '#f0f4f8', padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', border: '1px solid #dcdcdc', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              📍 হলি চাইল্ড একাডেমি, মোক্তারপাড়া
            </span>
          </div>
          <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '15px' }}>
            The academic structure below applies to both branches.
          </p>
        </div>

        {/* Classes Hierarchy Level */}
        <h2 style={{ borderBottom: '2px solid #0056b3', paddingBottom: '8px', marginBottom: '20px', color: '#111' }}>
          Currently Active Classes
        </h2>

        {loading ? (
          <p style={{ textAlign: 'center', padding: '20px' }}>Loading academic structure...</p>
        ) : activeClasses.length === 0 ? (
          <p style={{ fontStyle: 'italic', color: '#777', textAlign: 'center', padding: '20px' }}>
            Class configurations have not been set up yet.
          </p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            {activeClasses.map((className) => (
              <div key={className} style={{ border: '1px solid #e0e0e0', borderRadius: '12px', padding: '20px', background: '#fff', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                <h3 style={{ margin: '0 0 15px 0', color: '#222', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  📚 {className}
                </h3>
                
                {/* Sections Hierarchy Level */}
                <div>
                  <p style={{ fontSize: '0.85rem', color: '#666', margin: '0 0 8px 0', fontWeight: 'bold' }}>Active Sections:</p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {sectionsMap[className].map(section => (
                      <span key={section} style={{ background: '#0056b3', color: 'white', padding: '4px 12px', borderRadius: '15px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                        Section {section}
                      </span>
                    ))}
                  </div>
                </div>
                
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Education;