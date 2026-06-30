import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

function Faculty() {
  const [teachersList, setTeachersList] = useState([]);
  const [sectionsMap, setSectionsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [publicBranch, setPublicBranch] = useState('kurpar');

  const BRANCHES = [
    { id: 'kurpar', name: 'হলি চাইল্ড একাডেমি, কুরপাড়' },
    { id: 'moktarpara', name: 'হলি চাইল্ড একাডেমি, মোক্তারপাড়া' }
  ];
  const classes = ["Playgroup", "Nursery", "KG", "Class 1", "Class 2", "Class 3", "Class 4", "Class 5"];

  useEffect(() => {
    const fetchDirectoryAndConfig = async () => {
      setLoading(true);
      try {
        const configSnap = await getDoc(doc(db, "settings", "classSections"));
        if (configSnap.exists()) {
          setSectionsMap(configSnap.data().mapping || {});
        }

        const querySnapshot = await getDocs(collection(db, "teachers"));
        setTeachersList(querySnapshot.docs.map(doc => doc.data()));
      } catch (err) { 
        console.error("Error reading teachers directory:", err); 
      } finally {
        setLoading(false);
      }
    };

    fetchDirectoryAndConfig();
  }, []);

  if (loading) {
    return <div style={{ padding: '40px', color: 'white', textAlign: 'center' }}>Loading Teachers Directory...</div>;
  }

  const hasAnyConfig = Object.values(sectionsMap).some(arr => arr && arr.length > 0);

  // Filter teachers globally based on the selected branch tab
  const activeBranchTeachers = teachersList.filter(t => t.branch === publicBranch);

  return (
    <div style={{ padding: '40px 20px', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', boxSizing: 'border-box' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '10px' }}>Class Teachers Directory</h1>
      <p style={{ color: '#ddd', marginBottom: '30px', textAlign: 'center' }}>Overview of active faculty instructors running our classrooms</p>
      
      {/* Tab Container */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '40px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {BRANCHES.map(branch => (
          <button 
            key={branch.id} 
            onClick={() => setPublicBranch(branch.id)}
            className="liquid-btn"
            style={{ 
              background: publicBranch === branch.id ? 'white' : 'rgba(255,255,255,0.2)',
              color: publicBranch === branch.id ? '#0056b3' : '#fff',
              border: '1px solid rgba(255,255,255,0.5)',
              padding: '12px 25px',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            {branch.name}
          </button>
        ))}
      </div>

      {/* Main List Container: Removed fixed width constraints that were squishing it */}
      <div style={{ width: '100%', maxWidth: '850px', display: 'flex', flexDirection: 'column', gap: '35px' }}>
        {classes.map(className => {
          const activeSections = sectionsMap[className] || [];
          if (activeSections.length === 0) return null;
          const classTeachers = activeBranchTeachers.filter(t => t.class === className);

          return (
            <div key={className} className="glass-notice-box" style={{ 
              color: '#333', 
              padding: '30px', 
              width: '100%', 
              boxSizing: 'border-box' 
            }}>
              <h2 style={{ borderBottom: '2px solid #0056b3', paddingBottom: '8px', margin: '0 0 25px 0', color: '#111' }}>
                {className}
              </h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {activeSections.map(sec => {
                  const assignment = classTeachers.find(t => t.section === sec);
                  
                  return (
                    <div key={sec} style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(255,255,255,0.6)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.1)' }}>
                      <div style={{ display: 'inline-block', alignSelf: 'flex-start', background: '#0056b3', color: 'white', fontWeight: 'bold', padding: '4px 12px', borderRadius: '6px', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                        Section {sec}
                      </div>
                      
                      {assignment ? (
                        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
                          {assignment.photoUrl && (
                            <div style={{ width: '60px', height: '60px', borderRadius: '50%', overflow: 'hidden', border: '2px solid #0056b3', background: '#fff' }}>
                              <img src={assignment.photoUrl} alt={assignment.teacherName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                          )}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <h3 style={{ margin: 0, fontSize: '1.3rem', color: '#000' }}>{assignment.teacherName}</h3>
                            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '0.95rem', color: '#444' }}>
                              {assignment.email && <span><b>📧</b> {assignment.email}</span>}
                              {assignment.phone && <span><b>📞</b> {assignment.phone}</span>}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p style={{ margin: 0, color: '#888', fontStyle: 'italic' }}>No teacher assigned yet.</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

export default Faculty;