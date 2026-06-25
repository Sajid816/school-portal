import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

function Results() {
  const [selectedClass, setSelectedClass] = useState('Playgroup');
  const [selectedSection, setSelectedSection] = useState('');
  const [sectionsMap, setSectionsMap] = useState({});
  const [resultData, setResultData] = useState(null);
  const [loading, setLoading] = useState(false);

  const classes = ["Playgroup", "Nursery", "KG", "Class 1", "Class 2", "Class 3", "Class 4", "Class 5"];

  useEffect(() => {
    fetchAdminSectionsConfig();
  }, []);

  const fetchAdminSectionsConfig = async () => {
    try {
      const docSnap = await getDoc(doc(db, "settings", "classSections"));
      if (docSnap.exists()) {
        setSectionsMap(docSnap.data().mapping || {});
      }
    } catch (err) {
      console.error("Error loading sections layout metadata:", err);
    }
  };

  const availableSections = sectionsMap[selectedClass] || [];

  // Reset dropdown index pointer when user flips parent class parameters
  useEffect(() => {
    if (availableSections.length > 0) {
      setSelectedSection(availableSections[0]);
    } else {
      setSelectedSection('');
    }
    setResultData(null);
  }, [selectedClass, sectionsMap]);

  const fetchResults = async () => {
    if (!selectedSection) return alert("No active sections mapping found.");
    setLoading(true);
    setResultData(null);
    try {
      const docId = `${selectedClass}_${selectedSection}`;
      const docSnap = await getDoc(doc(doc(db, "results", docId)));
      
      if (docSnap.exists()) {
        setResultData(docSnap.data().students);
      } else {
        alert(`No student results uploaded yet for ${selectedClass} - Section ${selectedSection}.`);
      }
    } catch (error) {
      console.error("Error fetching results:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h1>Class Results</h1>
      
      <div className="glass-notice-box" style={{ color: '#333', padding: '20px', width: '100%', maxWidth: '600px', display: 'flex', gap: '10px' }}>
        <select className="glass-input" style={{ margin: 0 }} value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
          {classes.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        
        <select 
          className="glass-input" 
          style={{ margin: 0, width: '140px' }} 
          value={selectedSection} 
          onChange={e => setSelectedSection(e.target.value)}
          disabled={availableSections.length === 0}
        >
          {availableSections.length > 0 ? (
            availableSections.map(sec => <option key={sec} value={sec}>Section {sec}</option>)
          ) : (
            <option value="">No Sections</option>
          )}
        </select>

        <button onClick={fetchResults} className="login-btn" style={{ margin: 0, width: 'auto' }} disabled={availableSections.length === 0}>
          {loading ? "Searching..." : "View"}
        </button>
      </div>

      {resultData && (
        <div className="glass-notice-box" style={{ color: '#333', padding: '30px', width: '100%', maxWidth: '900px', marginTop: '20px' }}>
          <h3>Results: {selectedClass} - Section {selectedSection}</h3>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 10px' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid #ccc' }}>
                <th style={{ padding: '10px' }}>Roll</th>
                <th style={{ padding: '10px' }}>Name</th>
                <th style={{ padding: '10px' }}>Bangla</th>
                <th style={{ padding: '10px' }}>English</th>
                <th style={{ padding: '10px' }}>Math</th>
                <th style={{ padding: '10px' }}>Total Grade</th>
              </tr>
            </thead>
            <tbody>
              {resultData.map((student, index) => (
                <tr key={index} style={{ backgroundColor: 'rgba(255,255,255,0.3)' }}>
                  <td style={{ padding: '15px' }}>{student.roll || student.studentId}</td>
                  <td style={{ padding: '15px' }}>{student.studentName}</td>
                  <td style={{ padding: '15px' }}>{student.bangla}</td>
                  <td style={{ padding: '15px' }}>{student.english}</td>
                  <td style={{ padding: '15px' }}>{student.math}</td>
                  <td style={{ padding: '15px', fontWeight: 'bold' }}>{student.totalGrade}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Results;