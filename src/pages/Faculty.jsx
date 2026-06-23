import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

function Faculty() {
  const [teachersList, setTeachersList] = useState([]);
  const classes = ["Playgroup", "Nursery", "KG", "KG 1", "KG 2", "KG 3", "KG 4", "KG 5"];

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "teachers"));
        setTeachersList(querySnapshot.docs.map(doc => doc.data()));
      } catch (err) { console.error("Error reading teachers mapping:", err); }
    };
    fetchTeachers();
  }, []);

  return (
    <div style={{ padding: '40px', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h1>Class Teachers Directory</h1>
      
      <div style={{ width: '100%', maxWidth: '900px', display: 'flex', flexDirection: 'column', gap: '25px', marginTop: '20px' }}>
        {classes.map(className => {
          const classTeachers = teachersList.filter(t => t.class === className);

          return (
            <div key={className} className="glass-notice-box" style={{ color: '#333', padding: '25px' }}>
              <h2 style={{ borderBottom: '2px solid rgba(0,0,0,0.1)', paddingBottom: '5px', margin: '0 0 15px 0' }}>{className}</h2>
              
              <div style={{ display: 'flex', gap: '40px', justifyContent: 'flex-start', flexWrap: 'wrap' }}>
                {['A', 'B'].map(sec => {
                  const assignment = classTeachers.find(t => t.section === sec);
                  return (
                    <div key={sec} style={{ display: 'flex', alignItems: 'center', gap: '15px', minWidth: '250px' }}>
                      <div style={{ fontSize: '1.2rem', fontWeight: 'bold', background: 'rgba(0,0,0,0.05)', borderRadius: '4px', padding: '5px 12px' }}>
                        Sec {sec}
                      </div>
                      {assignment ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <img 
                            src={assignment.photoUrl} 
                            alt={assignment.teacherName} 
                            style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #ccc' }} 
                          />
                          <div>
                            <p style={{ margin: 0, fontWeight: 'bold', fontSize: '1.1rem' }}>{assignment.teacherName}</p>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: '#666' }}>Class Teacher</p>
                          </div>
                        </div>
                      ) : (
                        <p style={{ margin: 0, color: '#999', fontStyle: 'italic' }}>No teacher assigned</p>
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
}

export default Faculty;