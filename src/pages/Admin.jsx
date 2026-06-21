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
    <div style={{ padding: '40px', color: 'white' }}>
      <h1>Admin Panel</h1>
      
      <div className="glass-notice-box" style={{ color: '#333', marginBottom: '40px' }}>
        <h3>Bulk Upload</h3>
        <p>Ensure your CSV has columns: <b>email, fullName, role, studentId, class, section</b></p>
        <input type="file" accept=".csv" onChange={(e) => setFile(e.target.files[0])} style={{ color: '#000' }} />
        <button onClick={processCSV} className="login-btn">Upload & Sync</button>
      </div>

      <div className="glass-notice-box" style={{ color: '#333', padding: '20px' }}>
        <h3>Active Students</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '2px solid #ccc' }}>
              <th>Name</th><th>Student ID</th><th>Class</th><th>Section</th><th>Email</th><th>Action</th>
            </tr>
          </thead>
          <tbody>
            {students.map(s => (
              <tr key={s.id} style={{ borderBottom: '1px solid #eee' }}>
                <td>{s.fullName}</td>
                <td>{s.studentId}</td>
                <td>{s.class}</td>
                <td>{s.section}</td>
                <td>{s.email}</td>
                <td>
                  <button onClick={() => deleteStudent(s.email)} className="delete-btn">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Admin;