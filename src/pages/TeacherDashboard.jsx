import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { db } from '../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

function TeacherDashboard() {
  const [file, setFile] = useState(null);
  const [selectedClass, setSelectedClass] = useState('Playgroup');
  const [selectedSection, setSelectedSection] = useState('');
  const [sectionsMap, setSectionsMap] = useState({});
  const [isUploading, setIsUploading] = useState(false);

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
      console.error("Error reading class mappings:", err);
    }
  };

  // Automatically update the section dropdown options when the teacher picks a different class
  const availableSections = sectionsMap[selectedClass] || [];

  useEffect(() => {
    if (availableSections.length > 0) {
      setSelectedSection(availableSections[0]);
    } else {
      setSelectedSection('');
    }
  }, [selectedClass, sectionsMap]);

  const handleUpload = () => {
    if (!file) return alert("Please select a CSV file.");
    if (!selectedSection) return alert("The Admin has not activated any sections for this class yet.");
    setIsUploading(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const docId = `${selectedClass}_${selectedSection}`;
          const docRef = doc(db, "results", docId);
          
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const confirmOverwrite = window.confirm(
              `Results for ${selectedClass} - Section ${selectedSection} already exist. Overwrite them?`
            );
            if (!confirmOverwrite) {
              setIsUploading(false);
              return;
            }
          }

          await setDoc(docRef, {
            class: selectedClass,
            section: selectedSection,
            lastUpdated: new Date().toISOString(),
            students: results.data
          });
          
          alert(`Uploaded results for ${selectedClass} - Section ${selectedSection}`);
          setFile(null);
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
        <p>Your CSV file columns must be: <br/><b>roll, studentName, bangla, english, math, totalGrade</b></p>
        
        <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
          <select className="glass-input" value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
            {classes.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          
          {/* Strict Dropdown mapped cleanly from Admin rules */}
          <select 
            className="glass-input" 
            value={selectedSection} 
            onChange={e => setSelectedSection(e.target.value)}
            disabled={availableSections.length === 0}
          >
            {availableSections.length > 0 ? (
              availableSections.map(sec => <option key={sec} value={sec}>Section {sec}</option>)
            ) : (
              <option value="">No Active Sections</option>
            )}
          </select>
        </div>

        {availableSections.length === 0 && (
          <p style={{ color: '#d9534f', fontSize: '0.85rem', marginBottom: '15px', fontWeight: 'bold' }}>
            ⚠️ Notice: Admin needs to activate sections for {selectedClass} before you can upload.
          </p>
        )}

        <input 
          id="csv-file-input"
          type="file" 
          accept=".csv" 
          onChange={e => setFile(e.target.files[0])} 
          style={{ color: '#000', marginBottom: '20px', display: 'block' }} 
          disabled={availableSections.length === 0}
        />
        
        <button onClick={handleUpload} className="login-btn" disabled={isUploading || availableSections.length === 0}>
          {isUploading ? "Uploading..." : "Upload Results"}
        </button>
      </div>
    </div>
  );
}

export default TeacherDashboard;