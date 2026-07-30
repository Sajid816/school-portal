import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

function Teachers() {
  const [loading, setLoading] = useState(true);
  const [teachersData, setTeachersData] = useState({});
  const [sectionsMap, setSectionsMap] = useState({});
  
  // FIX: Added missing state to separate teachers by branch!
  const [selectedBranch, setSelectedBranch] = useState('kurpar'); 

  const BRANCHES = [
    { id: 'kurpar', name: 'হলি চাইল্ড একাডেমি, কুরপাড়' },
    { id: 'moktarpara', name: 'হলি চাইল্ড একাডেমি, মোক্তারপাড়া' }
  ];
  const classes = ["Playgroup", "Nursery", "KG", "Class 1", "Class 2", "Class 3", "Class 4", "Class 5"];

  useEffect(() => {
    fetchDirectoryAndConfig();
  }, []);

  const fetchDirectoryAndConfig = async () => {
    setLoading(true);
    try {
      const configSnap = await getDoc(doc(db, "settings", "classSections"));
      // FIX: Admin panel saves mapping as "branchMapping", not "mapping"
      if (configSnap.exists() && configSnap.data().branchMapping) {
        setSectionsMap(configSnap.data().branchMapping);
      }

      const querySnapshot = await getDocs(collection(db, "teachers"));
      const teachersList = querySnapshot.docs.map(doc => doc.data());
      
      const indexedTeachers = {};
      teachersList.forEach(t => {
        if (t.branch && t.class && t.section) {
          // FIX: Look up teachers using Branch + Class + Section 
          indexedTeachers[`${t.branch.trim()}_${t.class.trim()}_${t.section.trim()}`] = t;
        }
      });
      setTeachersData(indexedTeachers);

    } catch (err) {
      console.error("Error loading teachers directory:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', color: 'white', display: 'flex', justifyContent: 'center', minHeight: '100vh', backgroundImage: 'url("/pictures/admin.jpg")', backgroundSize: 'cover', backgroundAttachment: 'fixed' }}>Loading Teachers Directory...</div>;
  }

  const activeBranchData = sectionsMap[selectedBranch] || {};
  const hasAnyConfig = Object.values(activeBranchData).some(arr => arr && arr.length > 0);

  return (
    <div style={{ padding: '60px 20px', color: '#222', display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh', backgroundImage: 'url("/pictures/admin.jpg")', backgroundSize: 'cover', backgroundAttachment: 'fixed' }}>
      
      {/* Title Card */}
      <div style={{ background: 'rgba(255,255,255,0.85)', padding: '20px 40px', borderRadius: '12px', textAlign: 'center', marginBottom: '40px', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
        <h1 style={{ margin: '0 0 10px 0', color: '#111' }}>Class Teachers Directory</h1>
        <p style={{ margin: 0, color: '#555', fontWeight: 'bold' }}>Overview of faculty instructors assigned to each class track</p>
      </div>

      {/* BRANCH SELECTION TABS */}
      <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '40px' }}>
        {BRANCHES.map(branch => (
          <button 
            key={branch.id} 
            onClick={() => setSelectedBranch(branch.id)}
            className="liquid-btn"
            style={{ 
              background: selectedBranch === branch.id ? '#0056b3' : 'rgba(255,255,255,0.8)', 
              color: selectedBranch === branch.id ? '#fff' : '#111', 
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

      {/* TEACHER LIST */}
      <div style={{ width: '100%', maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
        {classes.map(className => {
          const activeSections = activeBranchData[className] || [];
          
          if (activeSections.length === 0) return null;

          return (
            <div key={className} className="glass-notice-box" style={{ color: '#333', padding: '30px', textAlign: 'left', background: 'rgba(255,255,255,0.9)' }}>
              <h2 style={{ margin: '0 0 20px 0', borderBottom: '2px solid #0056b3', paddingBottom: '5px' }}>
                {className}
              </h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {activeSections.map(secLetter => {
                  const teacherKey = `${selectedBranch}_${className}_${secLetter}`;
                  const assignedTeacher = teachersData[teacherKey];

                  return (
                    <div key={secLetter} style={{ display: 'flex', alignItems: 'center', gap: '20px', background: 'rgba(0,0,0,0.04)', padding: '15px', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.1)' }}>
                      
                      <div style={{ background: '#0056b3', color: 'white', fontWeight: 'bold', padding: '8px 15px', borderRadius: '6px', fontSize: '0.95rem', minWidth: '75px', textAlign: 'center' }}>
                        Sec {secLetter}
                      </div>

                      {assignedTeacher ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', width: '100%', flexWrap: 'wrap' }}>
                          {assignedTeacher.photoUrl && (
                            <div style={{ width: '50px', height: '50px', borderRadius: '50%', overflow: 'hidden', border: '1px solid #ccc', background: '#fff' }}>
                              <img src={assignedTeacher.photoUrl} alt={assignedTeacher.teacherName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                          )}
                          <div>
                            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#000' }}>{assignedTeacher.teacherName}</h3>
                            <span style={{ fontSize: '0.8rem', color: '#555' }}>Class Teacher</span>
                          </div>
                        </div>
                      ) : (
                        <span style={{ color: '#777', fontStyle: 'italic' }}>No teacher assigned yet</span>
                      )}

                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {!hasAnyConfig && (
          <div className="glass-notice-box" style={{ padding: '30px', textAlign: 'center', background: 'rgba(255,255,255,0.9)' }}>
            <p style={{ color: '#555', fontStyle: 'italic', margin: 0, fontWeight: 'bold' }}>
              No running class sections have been activated by administration for this branch yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Teachers;