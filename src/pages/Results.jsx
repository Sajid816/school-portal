import { useState } from 'react';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

function Results() {
  const [selectedClass, setSelectedClass] = useState('Playgroup');
  const [section, setSection] = useState('A');
  const [resultData, setResultData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Swapped KG 1-5 layout names to standard Class 1-5 keys
  const classes = ["Playgroup", "Nursery", "KG", "Class 1", "Class 2", "Class 3", "Class 4", "Class 5"];

  const fetchResults = async () => {
    setLoading(true);
    setResultData(null);
    try {
      const docId = `${selectedClass}_${section}`;
      const docSnap = await getDoc(doc(db, "results", docId));
      
      if (docSnap.exists()) {
        setResultData(docSnap.data().students);
      } else {
        alert("No results found for this class and section.");
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
        
        <select className="glass-input" style={{ margin: 0, width: '120px' }} value={section} onChange={e => setSection(e.target.value)}>
          <option value="A">Section A</option>
          <option value="B">Section B</option>
        </select>

        <button onClick={fetchResults} className="login-btn" style={{ margin: 0, width: 'auto' }}>
          {loading ? "Searching..." : "View"}
        </button>
      </div>

      {resultData && (
        <div className="glass-notice-box" style={{ color: '#333', padding: '30px', width: '100%', maxWidth: '900px', marginTop: '20px' }}>
          <h3>Results: {selectedClass} - Section {section}</h3>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 10px' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid #ccc' }}>
                <th style={{ padding: '10px' }}>Roll</th> {/* Swapped Header from ID to Roll */}
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
                  {/* Pulls student.roll directly instead of old legacy structural values */}
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