import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

function Info() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const uid = localStorage.getItem('uid');
      
      // Route Protection: Kicks out unauthenticated users
      if (!uid) {
        window.location.href = '/';
        return;
      }
      
      try {
        const docRef = doc(db, "users", uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setUserData(docSnap.data());
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
      setLoading(false);
    };
    
    fetchProfile();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  if (loading) return <div className="glass-container">Loading...</div>;

  return (
    <div className="glass-container">
      <h1>Student Dashboard</h1>
      
      {userData ? (
        <div style={{ textAlign: 'left', marginBottom: '25px' }}>
          <p><strong>Name:</strong> {userData.Name}</p>
          <p><strong>Class:</strong> {userData.class || 'Not assigned'}</p>
          <p><strong>Roll Number:</strong> {userData.roll}</p>
          
          {/* Exam Results Box */}
          <div style={{ 
            marginTop: '20px', 
            padding: '15px', 
            background: 'rgba(255, 255, 255, 0.1)', 
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '10px' 
          }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '1.2rem' }}>Recent Exam Results</h3>
            <p style={{ margin: 0 }}>
              {/* This checks for a 'result' field, falls back to 'score', or shows a default message */}
              {userData.result || userData.score || 'No results published yet.'}
            </p>
          </div>
          
        </div>
      ) : (
        <p>No profile data found.</p>
      )}
      
      {/* THE LOGOUT BUTTON */}
      <button className="logout-btn" onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default Info;