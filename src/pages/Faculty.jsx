import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

function Faculty() {
  const [teachersList, setTeachersList] = useState([]);
  const [sectionsMap, setSectionsMap] = useState({});
  const [loading, setLoading] = useState(true);

  // UNIFIED CLASS TAXONOMY SCHEMA (Matches Admin and Teacher dashboards)
  const classes = ["Playgroup", "Nursery", "KG", "Class 1", "Class 2", "Class 3", "Class 4", "Class 5"];

  useEffect(() => {
    const fetchDirectoryAndConfig = async () => {
      setLoading(true);
      try {
        // 1. Fetch live active class section configurations locked by Admin
        const configSnap = await getDoc(doc(db, "settings", "classSections"));
        if (configSnap.exists()) {
          setSectionsMap(configSnap.data().mapping || {});
        }

        // 2. Fetch all uploaded teacher entries from the collection
        const querySnapshot = await getDocs(collection(db, "teachers"));
        setTeachersList(querySnapshot.docs.map(doc => doc.data()));
      } catch (err) { 
        console.error("Error reading teachers directory metadata:", err); 
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
      
      <div style={{ width: '100%', maxWidth: '900px', display: 'flex', flexDirection: 'column', gap: '25px', marginTop: '20px' }}>
        {classes.map(className => {
          // Dynamic section lookup array set strictly by the Admin panel checkboxes
          const activeSections = sectionsMap[className] || [];

          // If no active sections are checked for this class this year, completely skip rendering the card
          if (activeSections.length === 0) return null;

          const classTeachers = teachersList.filter(t => t.class === className);

          return (
            <div key={className} className="glass-notice-box" style={{ color: '#333', padding: '25px' }}>
              <h2 style={{ borderBottom: '2px solid rgba(0,0,0,0.1)', paddingBottom: '5px', margin: '0 0 15px 0' }}>{className}</h2>
              
              <div style={{ display: 'flex', gap: '40px', justifyContent: 'flex-start', flexWrap: 'wrap' }}>
                {activeSections.map(sec => {
                  const assignment = classTeachers.find(t => t.section === sec);
                  
                  return (
                    <div key={sec} style={{ display: 'flex', alignItems: 'center', gap: '15px', minWidth: '250px' }}>
                      <div style={{ fontSize: '1.2rem', fontWeight: 'bold', background: 'rgba(0,0,0,0.05)', borderRadius: '4px', padding: '5px 12px' }}>
                        Sec {sec}
                      </div>
                      
                      {assignment ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {assignment.photoUrl && (
                            <img 
                              src={assignment.photoUrl} 
                              alt={assignment.teacherName} 
                              style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #ccc' }} 
                            />
                          )}
                          <div>
                            <p style={{ margin: 0, fontWeight: 'bold', fontSize: '1.1rem' }}>{assignment.teacherName}</p>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: '#666' }}>Class Teacher</p>
                          </div>
                        </div>
                      ) : (
                        <p style={{ margin: 0, color: '#999', fontStyle: 'italic' }}>No teacher assigned yet</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Fallback baseline view layout message if nothing is configured yet */}
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