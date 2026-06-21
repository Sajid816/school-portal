import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { db } from '../firebase';
import { doc, writeBatch, collection, getDocs, deleteDoc } from 'firebase/firestore';

function Admin() {
  const [students, setStudents] = useState([]);
  const [file, setFile] = useState(null);

  // Fetch all students on load
  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    const querySnapshot = await getDocs(collection(db, "users"));
    const list = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setStudents(list);
  };

  const deleteStudent = async (email) => {
    if (window.confirm("Delete this student permanently?")) {
      await deleteDoc(doc(db, "users", email));
      fetchStudents(); // Refresh the list
    }
  };

  const handleFileUpload = (e) => setFile(e.target.files[0]);

  const processCSV = () => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const batch = writeBatch(db);
        results.data.forEach(row => {
          if (row.email) batch.set(doc(db, "users", row.email), row);
        });
        await batch.commit();
        alert("Sync complete!");
        fetchStudents(); // Refresh UI
      }
    });
  };

  return (
    <div style={{ padding: '40px', color: 'white' }}>
      <h1>Admin Panel</h1>
      
      {/* Upload Section */}
      <div className="glass-notice-box" style={{ color: '#333', marginBottom: '40px' }}>
        <h3>Bulk Upload</h3>
        <input type="file" accept=".csv" onChange={handleFileUpload} />
        <button onClick={processCSV} className="login-btn">Upload & Sync</button>
      </div>

      {/* Student List Table */}
      <div className="glass-notice-box" style={{ color: '#333', padding: '20px' }}>
        <h3>Active Students</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '2px solid #ccc' }}>
              <th>Name</th><th>Class</th><th>Email</th><th>Action</th>
            </tr>
          </thead>
          <tbody>
            {students.map(s => (
              <tr key={s.id} style={{ borderBottom: '1px solid #eee' }}>
                <td>{s.fullName}</td><td>{s.class}</td><td>{s.email}</td>
                <td><button onClick={() => deleteStudent(s.email)} style={{ color: 'red' }}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Admin;