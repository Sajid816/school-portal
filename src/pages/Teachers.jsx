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
      // 1. Tell Firebase we want to search the "users" folder
      const usersRef = collection(db, "users");
      
      // 2. Create a search query: "Find the document where the roll field equals the input"
      // We check both string and number types to prevent errors if you manually typed it in Firebase
      const qString = query(usersRef, where("roll", "==", rollInput));
      const qNumber = query(usersRef, where("roll", "==", Number(rollInput)));
      
      // 3. Execute the search
      let querySnapshot = await getDocs(qString);
      
      // If it didn't find a string, try searching for a number
      if (querySnapshot.empty) {
        querySnapshot = await getDocs(qNumber);
      }

      // 4. If nothing is found at all, stop and show an error
      if (querySnapshot.empty) {
        setMessage(`❌ No student found with Roll Number: ${rollInput}`);
        setIsLoading(false);
        return;
      }

      // 5. If found, grab the exact document ID (the hidden UID)
      const studentDoc = querySnapshot.docs[0]; 
      const studentRef = doc(db, "users", studentDoc.id);

      // 6. Update that specific student's result
      // We update both "result" and "score" just in case you used either in your info.jsx
      await updateDoc(studentRef, { result: resultInput, score: resultInput });
      
      setMessage(`✅ Successfully updated results for Roll Number: ${rollInput}`);
      e.target.reset(); // Clears the form

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
    <div className="glass-container">
      <h1>Teacher Dashboard</h1>
      <p>Update student records by searching their Roll Number.</p>
      
      <form onSubmit={handleUpdate} style={{ textAlign: 'left' }}>
        <label>Student Roll Number</label>
        <input name="roll" type="text" className="glass-input" required placeholder="e.g., 10" />
        
        <label>New Exam Result</label>
        <input name="result" type="text" className="glass-input" required placeholder="e.g., Math: 95, English: 88" />
        
        <button type="submit" className="login-btn" disabled={isLoading}>
          {isLoading ? "Searching & Updating..." : "Update Results"}
        </button>
      </form>

      {message && <p style={{ fontWeight: 'bold', marginTop: '15px' }}>{message}</p>}

      <button className="logout-btn" onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default Teachers;