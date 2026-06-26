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
      
      <div style={{ width: '100%', maxWidth: '750px', display: 'flex', flexDirection: 'column', gap: '35px', marginTop: '20px' }}>
        {classes.map(className => {
          const activeSections = sectionsMap[className] || [];

          if (activeSections.length === 0) return null;

          const classTeachers = teachersList.filter(t => t.class === className);

          return (
            <div key={className} className="glass-notice-box" style={{ color: '#333', padding: '30px', width: '100%', boxSizing: 'border-box', margin: '0' }}>
              <h2 style={{ borderBottom: '2px solid #0056b3', paddingBottom: '8px', margin: '0 0 25px 0', color: '#111' }}>
                {className}
              </h2>
              
              {/* Stacked Card System: Renders sections vertically stacked beneath each other */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {activeSections.map(sec => {
                  const assignment = classTeachers.find(t => t.section === sec);
                  
                  return (
                    <div key={sec} style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(255,255,255,0.4)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.6)', boxShadow: '0 4px 10px rgba(0,0,0,0.02)' }}>
                      
                      {/* Top Header Row inside Card: Section Title Badge */}
                      <div style={{ display: 'inline-block', alignSelf: 'flex-start', background: '#0056b3', color: 'white', fontWeight: 'bold', padding: '4px 12px', borderRadius: '6px', fontSize: '0.85rem', uppercase: 'true' }}>
                        Section {sec}
                      </div>
                      
                      {assignment ? (
                        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
                          
                          {/* Conditional Image Block: Only mounts if photoUrl exists */}
                          {assignment.photoUrl && (
                            <div style={{ width: '60px', height: '60px', borderRadius: '50%', overflow: 'hidden', border: '2px solid #0056b3', background: '#fff' }}>
                              <img src={assignment.photoUrl} alt={assignment.teacherName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                          )}
                          
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#000' }}>{assignment.teacherName}</h3>
                            
                            {/* Contact Info Line Layout Metrics */}
                            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginTop: '4px', fontSize: '0.9rem', color: '#444' }}>
                              {assignment.email && <span><b>📧 Email:</b> <a href={`mailto:${assignment.email}`} style={{ color: '#0056b3', textDecoration: 'none' }}>{assignment.email}</a></span>}
                              {assignment.phone && <span><b>📞 Phone:</b> {assignment.phone}</span>}
                              {!assignment.email && !assignment.phone && <span style={{ color: '#777', fontStyle: 'italic' }}>No contact details published</span>}
                            </div>
                          </div>

                        </div>
                      ) : (
                        <p style={{ margin: '5px 0 0 0', color: '#777', fontStyle: 'italic', fontSize: '0.95rem' }}>
                          No class teacher assigned yet for this section track.
                        </p>
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