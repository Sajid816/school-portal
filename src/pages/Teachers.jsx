import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

function Teachers() {
  const [loading, setLoading] = useState(true);
  const [teachersData, setTeachersData] = useState({});
  const [sectionsMap, setSectionsMap] = useState({});

  // Unified structural class taxonomy tracking roadmaps
  const classes = ["Playgroup", "Nursery", "KG", "Class 1", "Class 2", "Class 3", "Class 4", "Class 5"];

  useEffect(() => {
    fetchDirectoryAndConfig();
  }, []);

  const fetchDirectoryAndConfig = async () => {
    setLoading(true);
    try {
      // 1. Fetch active class section configurations locked by Admin
      const configSnap = await getDoc(doc(db, "settings", "classSections"));
      if (configSnap.exists()) {
        setSectionsMap(configSnap.data().mapping || {});
      }

      // 2. Fetch all uploaded teacher entries from the collection
      const querySnapshot = await getDocs(collection(db, "teachers"));
      const teachersList = querySnapshot.docs.map(doc => doc.data());
      
      // Map list array directly into an indexed key lookup dictionary layout state: e.g. {"Playgroup_A": {data}}
      const indexedTeachers = {};
      teachersList.forEach(t => {
        if (t.class && t.section) {
          indexedTeachers[`${t.class}_${t.section}`] = t;
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
    return <div style={{ padding: '40px', color: 'white', textAlign: 'center' }}>Loading Teachers Directory...</div>;
  }

  // Check if the administrator has configured ANY active sections across the board yet
  const hasAnyConfig = Object.values(sectionsMap).some(arr => arr && arr.length > 0);

  return (
    <div style={{ padding: '40px', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h1>Class Teachers Directory</h1>
      <p style={{ marginBottom: '40px', color: '#ddd' }}>Overview of faculty instructors assigned to each class track</p>

      <div style={{ width: '100%', maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
        {classes.map(className => {
          const activeSections = sectionsMap[className] || [];
          
          // If no active sections are configured for this class, don't render an empty card block
          if (activeSections.length === 0) return null;

          return (
            <div key={className} className="glass-notice-box" style={{ color: '#333', padding: '30px', textAlign: 'left' }}>
              <h2 style={{ margin: '0 0 20px 0', borderBottom: '2px solid #0056b3', paddingBottom: '5px' }}>
                {className}
              </h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {activeSections.map(secLetter => {
                  const teacherKey = `${className}_${secLetter}`;
                  const assignedTeacher = teachersData[teacherKey];

                  return (
                    <div key={secLetter} style={{ display: 'flex', alignItems: 'center', gap: '20px', background: 'rgba(255,255,255,0.25)', padding: '15px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.4)' }}>
                      
                      {/* Section Badge */}
                      <div style={{ background: '#0056b3', color: 'white', fontWeight: 'bold', padding: '8px 15px', borderRadius: '6px', fontSize: '0.95rem', minWidth: '75px', textAlign: 'center' }}>
                        Sec {secLetter}
                      </div>

                      {/* Teacher Profile Info Block */}
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

        {/* Fallback layout banner notice if database class mappings dictionary path is completely unconfigured */}
        {!hasAnyConfig && (
          <p style={{ textAlign: 'center', color: '#ddd', fontStyle: 'italic' }}>
            No running class sections have been locked by administration yet.
          </p>
        )}
      </div>
    </div>
  );
}

export default Teachers;