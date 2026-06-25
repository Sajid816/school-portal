import { useState } from 'react';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

function Teachers() {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsLoading(true);

    const rollInput = e.target.roll.value.trim();
    const resultInput = e.target.result.value.trim();

    try {
      const usersRef = collection(db, "users");
      const qString = query(usersRef, where("roll", "==", rollInput));
      const qNumber = query(usersRef, where("roll", "==", Number(rollInput)));
      
      let querySnapshot = await getDocs(qString);
      if (querySnapshot.empty) {
        querySnapshot = await getDocs(qNumber);
      }

      if (querySnapshot.empty) {
        setMessage(`❌ No student found with Roll Number: ${rollInput}`);
        setIsLoading(false);
        return;
      }

      const studentDoc = querySnapshot.docs[0]; 
      const studentRef = doc(db, "users", studentDoc.id);

      await updateDoc(studentRef, { result: resultInput, score: resultInput });
      
      setMessage(`✅ Successfully updated results for Roll Number: ${rollInput}`);
      e.target.reset();

    } catch (error) {
      console.error("Update Error:", error);
      setMessage("❌ Error updating. Check your database permissions.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  return (
    <div className="glass-container" style={{ margin: 'auto', marginTop: '5vh', padding: '30px', maxWidth: '500px' }}>
      <h1>Teacher Dashboard</h1>
      <p>Update student records by searching their Roll Number.</p>
      
      <form onSubmit={handleUpdate} style={{ textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
        <label style={{ marginBottom: '5px', fontWeight: 'bold' }}>Student Roll Number</label>
        <input name="roll" type="text" className="glass-input" required placeholder="e.g., 10" />
        
        <label style={{ marginBottom: '5px', fontWeight: 'bold', marginTop: '15px' }}>New Exam Result</label>
        <input name="result" type="text" className="glass-input" required placeholder="e.g., Math: 95, English: 88" />
        
        <button type="submit" className="login-btn" style={{ marginTop: '20px' }} disabled={isLoading}>
          {isLoading ? "Searching & Updating..." : "Update Results"}
        </button>
      </form>

      {message && <p style={{ fontWeight: 'bold', marginTop: '15px', color: message.includes('❌') ? '#d9534f' : '#28a745' }}>{message}</p>}

      <button className="delete-btn" style={{ marginTop: '30px', width: '100%' }} onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default Teachers;