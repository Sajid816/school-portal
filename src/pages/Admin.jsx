import { useState } from 'react';
import Papa from 'papaparse';
import { db } from '../firebase';
import { doc, writeBatch } from 'firebase/firestore';

function Admin() {
  const [file, setFile] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleFileUpload = (e) => setFile(e.target.files[0]);

  const processCSV = () => {
    if (!file) return alert("Please select a file first.");
    setIsSyncing(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const batch = writeBatch(db);
        let count = 0;

        results.data.forEach((row) => {
          // Ensure every row has an 'email' to use as the unique ID
          if (row.email) {
            const userRef = doc(db, "users", row.email); // Using email as the Document ID
            batch.set(userRef, {
              fullName: row.fullName,
              role: row.role,
              studentId: row.studentId || "",
              class: row.class || "",
              email: row.email
            });
            count++;
          }
        });

        try {
          await batch.commit();
          alert(`Successfully synced ${count} students to the database!`);
        } catch (err) {
          console.error("Batch error:", err);
          alert("Error syncing data. Check console.");
        } finally {
          setIsSyncing(false);
        }
      }
    });
  };

  return (
    <div style={{ padding: '40px', color: 'white' }}>
      <h1>Admin Panel</h1>
      <div className="glass-notice-box" style={{ padding: '30px', color: '#333' }}>
        <h3>Bulk Student Upload</h3>
        <input type="file" accept=".csv" onChange={handleFileUpload} style={{ color: '#000', marginBottom: '15px' }} />
        <button onClick={processCSV} className="login-btn" disabled={isSyncing}>
          {isSyncing ? "Syncing..." : "Upload & Sync"}
        </button>
      </div>
    </div>
  );
}

export default Admin;