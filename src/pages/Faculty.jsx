import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

function Faculty() {
  const [teachersList, setTeachersList] = useState([]);
  const [sectionsMap, setSectionsMap] = useState({});
  const [loading, setLoading] = useState(true);

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

  return (
    <div style={{ padding: '40px', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h1>Class Teachers Directory</h1>
      <p style={{ color: '#ddd', marginBottom: '20px' }}>Overview of active faculty instructors running our classrooms</p>
      
      {/* Master alignment container set to 100% width up to 800px max */}
      <div style={{ width: '100%', maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '25px', marginTop: '20px', alignItems: 'center' }}>
        {classes.map(className => {
          const activeSections = sectionsMap[className] || [];

          if (activeSections.length === 0) return null;

          const classTeachers = teachersList.filter(t => t.class === className);

          return (
            /* Overriding width styles here to force all panels to stay exactly 100% wide */
            <div key={className} className="glass-notice-box" style={{ color: '#333', padding: '30px', width: '100%', maxWidth: '100%', boxSizing: 'border-box', margin: '0' }}>
              <h2 style={{ borderBottom: '2px solid rgba(0,0,0,0.1)', paddingBottom: '8px', margin: '0 0 20px 0' }}>{className}</h2>
              
              <div style={{ display: 'flex', gap: '30px', justifyContent: 'flex-start', flexWrap: 'wrap' }}>
                {activeSections.map(sec => {
                  const assignment = classTeachers.find(t => t.section === sec);
                  
                  return (
                    <div key={sec} style={{ display: 'flex', alignItems: 'center', gap: '15px', minWidth: '220px' }}>
                      <div style={{ fontSize: '1.1rem', fontWeight: 'bold', background: 'rgba(0,0,0,0.05)', borderRadius: '6px', padding: '6px 14px' }}>
                        Sec {sec}
                      </div>
                      
                      {assignment ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {assignment.photoUrl && (
                            <img 
                              src={assignment.photoUrl} 
                              alt={assignment.teacherName} 
                              style={{ width: '45px', height: '45px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #ccc' }} 
                            />
                          )}
                          <div>
                            <p style={{ margin: 0, fontWeight: 'bold', fontSize: '1.05rem' }}>{assignment.teacherName}</p>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: '#666' }}>Class Teacher</p>
                          </div>
                        </div>
                      ) : (
                        <p style={{ margin: 0, color: '#888', fontStyle: 'italic', fontSize: '0.95rem' }}>No teacher assigned yet</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {!hasAnyConfig && (
          <p style={{ textAlign: 'center', color: '#ddd', fontStyle: 'italic' }}>
            No running class sections have been locked by administration yet.
          </p>
        )}
      </div>
    </div>
  );
}

export default Faculty;