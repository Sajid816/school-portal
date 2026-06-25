import { useState } from 'react';
import Papa from 'papaparse';
import { db } from '../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

function TeacherDashboard() {
  const [file, setFile] = useState(null);
  const [selectedClass, setSelectedClass] = useState('Playgroup');
  const [section, setSection] = useState('A');
  const [isUploading, setIsUploading] = useState(false);

  // Updated array mapping structure: Changed KG 1-5 variants to Class 1-5
  const classes = ["Playgroup", "Nursery", "KG", "Class 1", "Class 2", "Class 3", "Class 4", "Class 5"];

  const handleUpload = () => {
    if (!file) return alert("Please select a CSV file.");
    setIsUploading(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const docId = `${selectedClass}_${section}`;
          const docRef = doc(db, "results", docId);
          
          // Check if results for this class/section combination already exist
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const confirmOverwrite = window.confirm(
              `Results for ${selectedClass} - Section ${section} already exist. Are you sure you want to overwrite them?`
            );
            if (!confirmOverwrite) {
              setIsUploading(false);
              return; // Halt execution safely if user aborts
            }
          }

          // Write updated dataset back into the target document path
          await setDoc(docRef, {
            class: selectedClass,
            section: section,
            lastUpdated: new Date().toISOString(),
            students: results.data
          });
          
          alert(`Successfully uploaded results for ${selectedClass} - Section ${section}`);
          setFile(null);
          // Safely resets native upload file selector UI value
          document.getElementById("csv-file-input").value = "";
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
        <b>roll, studentName, bangla, english, math, totalGrade</b></p>
        
        <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
          <select className="glass-input" value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
            {classes.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          
          <select className="glass-input" value={section} onChange={e => setSection(e.target.value)}>
            <option value="A">Section A</option>
            <option value="B">Section B</option>
          </select>
        </div>

        <input 
          id="csv-file-input"
          type="file" 
          accept=".csv" 
          onChange={e => setFile(e.target.files[0])} 
          style={{ color: '#000', marginBottom: '20px', display: 'block' }} 
        />
        
        <button onClick={handleUpload} className="login-btn" disabled={isUploading}>
          {isUploading ? "Uploading..." : "Upload Results"}
        </button>
      </div>
    </div>
  );
}

export default TeacherDashboard;