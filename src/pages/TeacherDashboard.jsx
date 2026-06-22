import { useState } from 'react';
import Papa from 'papaparse';
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

function TeacherDashboard() {
  const [file, setFile] = useState(null);
  const [selectedClass, setSelectedClass] = useState('Playgroup');
  const [section, setSection] = useState('A');
  const [isUploading, setIsUploading] = useState(false);

  // Classes extracted from the school document
  const classes = ["Playgroup", "Nursery", "KG", "KG 1", "KG 2", "KG 3", "KG 4", "KG 5"];

  const handleUpload = () => {
    if (!file) return alert("Please select a CSV file.");
    setIsUploading(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          // Store the entire parsed array in a single document named "Class_Section"
          const docId = `${selectedClass}_${section}`;
          await setDoc(doc(db, "results", docId), {
            class: selectedClass,
            section: section,
            lastUpdated: new Date().toISOString(),
            students: results.data
          });
          alert(`Successfully uploaded results for ${selectedClass} - Section ${section}`);
          setFile(null);
        } catch (error) {
          console.error(error);
          alert("Error uploading results to database.");
        } finally {
          setIsUploading(false);
        }
      }
    });
  };

  return (
    <div style={{ padding: '40px', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h1>Teacher Dashboard</h1>
      
      <div className="glass-notice-box" style={{ color: '#333', padding: '30px', width: '100%', maxWidth: '600px' }}>
        <h3>Upload Class Results</h3>
        <p>Your CSV file <b>must</b> have columns exactly in this order: <br/>
        <b>studentId, studentName, bangla, english, math, totalGrade</b></p>
        
        <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
          <select className="glass-input" value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
            {classes.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          
          <input 
            type="text" 
            className="glass-input" 
            placeholder="Section (e.g., A)" 
            value={section} 
            onChange={e => setSection(e.target.value)} 
          />
        </div>

        <input type="file" accept=".csv" onChange={e => setFile(e.target.files[0])} style={{ color: '#000', marginBottom: '20px', display: 'block' }} />
        
        <button onClick={handleUpload} className="login-btn" disabled={isUploading}>
          {isUploading ? "Uploading..." : "Upload Results"}
        </button>
      </div>
    </div>
  );
}

export default TeacherDashboard;