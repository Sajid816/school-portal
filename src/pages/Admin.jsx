import { useState } from 'react';
import Papa from 'papaparse';
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

function Admin() {
  const [file, setFile] = useState(null);

  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files[0];
    setFile(uploadedFile);
  };

  const processCSV = () => {
    if (!file) return alert("Please select a file first.");

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        // Logic to sync data with Firebase will go here
        console.log("Parsed Data:", results.data);
        alert("File parsed! Check console for data preview.");
        // Next step: Loop through results.data and use writeBatch to update Firestore
      }
    });
  };

  return (
    <div style={{ padding: '40px', color: 'white' }}>
      <h1>Admin Panel</h1>
      <div className="glass-notice-box" style={{ padding: '20px' }}>
        <h3>Bulk Student Upload</h3>
        <input type="file" accept=".csv" onChange={handleFileUpload} />
        <button onClick={processCSV} className="login-btn">Upload & Sync</button>
      </div>
    </div>
  );
}

export default Admin;