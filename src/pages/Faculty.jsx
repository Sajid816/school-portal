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
        // Fetch branch-specific sections configuration
        const configSnap = await getDoc(doc(db, "settings", "classSections"));
        if (configSnap.exists()) {
          setSectionsMap(configSnap.data().branchMapping || {});
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

  if (loading) return <div style={{ padding: '40px', color: 'white', textAlign: 'center' }}>Loading...</div>;

  const activeBranchSections = sectionsMap[publicBranch] || {};
  const activeBranchTeachers = teachersList.filter(t => t.branch === publicBranch);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', padding: '20px', boxSizing: 'border-box' }}>
      <h1>Class Teachers Directory</h1>
      <p style={{ color: '#ddd', marginBottom: '20px' }}>Overview of active faculty instructors</p>
      
      <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {BRANCHES.map(branch => (
          <button key={branch.id} onClick={() => setPublicBranch(branch.id)} className="liquid-btn" style={{ 
            background: publicBranch === branch.id ? 'white' : 'rgba(255,255,255,0.3)',
            color: 'black', padding: '10px 20px', cursor: 'pointer', border: 'none', borderRadius: '5px' 
          }}>
            {branch.name}
          </button>
        ))}
      </div>

      <div style={{ width: '100%', maxWidth: '750px', margin: '0 auto' }}>
        {classes.map(className => {
          const activeSections = activeBranchSections[className] || [];
          if (activeSections.length === 0) return null;
          const classTeachers = activeBranchTeachers.filter(t => t.class === className);

          return (
            <div key={className} className="glass-notice-box" style={{ marginBottom: '30px', padding: '30px', width: '100%', boxSizing: 'border-box' }}>
              <h2 style={{ borderBottom: '2px solid #0056b3', paddingBottom: '8px', color: '#111' }}>{className}</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
                {activeSections.map(sec => {
                  const assignment = classTeachers.find(t => t.section === sec);
                  return (
                    <div key={sec} style={{ padding: '15px', background: 'rgba(255,255,255,0.6)', borderRadius: '8px', border: '1px solid #ddd' }}>
                      <div style={{ background: '#0056b3', color: 'white', display: 'inline-block', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '10px' }}>SECTION {sec}</div>
                      {assignment ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                          {assignment.photoUrl && <img src={assignment.photoUrl} alt={assignment.teacherName} style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }} />}
                          <div>
                            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{assignment.teacherName}</h3>
                            <div style={{ fontSize: '0.85rem', color: '#444' }}>
                              {assignment.email && <div>📧 {assignment.email}</div>}
                              {assignment.phone && <div>📞 {assignment.phone}</div>}
                            </div>
                          </div>
                        </div>
                      ) : <p style={{ margin: 0, fontSize: '0.9rem', color: '#777' }}>No teacher assigned yet.</p>}
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