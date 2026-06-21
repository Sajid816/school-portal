import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { db } from '../firebase';
import { doc, writeBatch, collection, getDocs, deleteDoc } from 'firebase/firestore';

function Admin() {
  const [students, setStudents] = useState([]);
  const [file, setFile] = useState(null);

  useEffect(() => { fetchStudents(); }, []);

  const fetchStudents = async () => {
    const querySnapshot = await getDocs(collection(db, "users"));
    const list = querySnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(user => user.role === 'student')
      .sort((a, b) => (a.class || "").localeCompare(b.class) || (a.section || "").localeCompare(b.section));
    setStudents(list);
  };

  const deleteStudent = async (email) => {
    if (window.confirm("Delete this student permanently?")) {
      await deleteDoc(doc(db, "users", email));
      fetchStudents();
    }
  };

  const processCSV = () => {
    if (!file) return alert("Please select a file first.");
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const batch = writeBatch(db);
        results.data.forEach(row => {
          if (row.email) {
            batch.set(doc(db, "users", row.email), {
              fullName: row.fullName,
              role: row.role,
              studentId: row.studentId, // Ensure this column exists in CSV
              class: row.class,
              section: row.section,     // Ensure this column exists in CSV
              email: row.email
            });
          }
        });
        await batch.commit();
        alert("Sync complete!");
        fetchStudents();
      }
    });
  };

  return (
  <div style={{ padding: '40px', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
    <h1>Admin Panel</h1>
    
    {/* Bulk Upload Section - Increased width */}
    <div className="glass-notice-box" style={{ color: '#333', marginBottom: '40px', width: '100%', maxWidth: '800px' }}>
      <h3>Bulk Upload</h3>
      <p>Ensure your CSV has columns: <b>email, fullName, role, studentId, class, section</b></p>
      <input type="file" accept=".csv" onChange={(e) => setFile(e.target.files[0])} style={{ color: '#000', marginBottom: '10px' }} />
      <button onClick={processCSV} className="login-btn">Upload & Sync</button>
    </div>

    {/* Student List Table - Increased width and padding */}
    <div className="glass-notice-box" style={{ color: '#333', padding: '30px', width: '100%', maxWidth: '900px' }}>
      <h3>Active Students</h3>
      <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 10px' }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '2px solid #ccc' }}>
            <th style={{ padding: '10px' }}>Name</th>
            <th style={{ padding: '10px' }}>Student ID</th>
            <th style={{ padding: '10px' }}>Class</th>
            <th style={{ padding: '10px' }}>Section</th>
            <th style={{ padding: '10px' }}>Email</th>
            <th style={{ padding: '10px' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {students.map(s => (
            <tr key={s.id} style={{ backgroundColor: 'rgba(255,255,255,0.3)' }}>
              <td style={{ padding: '15px' }}>{s.fullName}</td>
              <td style={{ padding: '15px' }}>{s.studentId}</td>
              <td style={{ padding: '15px' }}>{s.class}</td>
              <td style={{ padding: '15px' }}>{s.section}</td>
              <td style={{ padding: '15px' }}>{s.email}</td>
              <td style={{ padding: '15px' }}>
                <button onClick={() => deleteStudent(s.email)} className="delete-btn">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);
export default Admin;