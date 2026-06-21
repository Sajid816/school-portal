import { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

function Home() {
  const [view, setView] = useState('login'); // 'login' or 'studentLookup'
  const [studentId, setStudentId] = useState('');
  const [studentData, setStudentData] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check login on load
  useEffect(() => {
    if (localStorage.getItem('uid')) setIsLoggedIn(true);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const userCredential = await signInWithEmailAndPassword(auth, e.target.email.value, e.target.password.value);
      const docSnap = await getDoc(doc(db, "users", userCredential.user.uid));
      if (docSnap.exists()) {
        localStorage.setItem('uid', userCredential.user.uid);
        localStorage.setItem('role', docSnap.data().role);
        window.location.reload();
      }
    } catch (err) { setError('Invalid email or password.'); } finally { setIsLoading(false); }
  };

  const handleStudentLookup = async () => {
    try {
      const docSnap = await getDoc(doc(db, "users", studentId));
      if (docSnap.exists()) {
        setStudentData(docSnap.data());
      } else {
        alert("Student ID not found!");
      }
    } catch (err) { alert("Error searching database."); }
  };

  return (
    <div className="home-container" style={{ textAlign: 'center', padding: '20px' }}>
      <div className="nav-tabs" style={{ marginBottom: '20px' }}>
        <button onClick={() => setView('login')}>Teacher/Admin Login</button>
        <button onClick={() => setView('studentLookup')}>Student Result Lookup</button>
      </div>

      {view === 'studentLookup' ? (
        <div className="glass-notice-box" style={{ padding: '20px', maxWidth: '400px', margin: 'auto' }}>
          <h2>Student Result Lookup</h2>
          <input className="glass-input" value={studentId} onChange={(e) => setStudentId(e.target.value)} placeholder="Enter Student ID" />
          <button onClick={handleStudentLookup} className="login-btn">View My Info</button>
          {studentData && (
            <div style={{ marginTop: '20px', textAlign: 'left' }}>
              <p><strong>Name:</strong> {studentData.fullName}</p>
              <p><strong>Result:</strong> {studentData.result || "N/A"}</p>
            </div>
          )}
        </div>
      ) : (
        !isLoggedIn ? (
          <div className="login-card" style={{ maxWidth: '400px', margin: 'auto' }}>
            <h1>Portal Login</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleLogin}>
              <input type="email" name="email" placeholder="Email" className="glass-input" required />
              <input type="password" name="password" placeholder="Password" className="glass-input" required />
              <button type="submit" className="login-btn" disabled={isLoading}>{isLoading ? "Logging in..." : "Log In"}</button>
            </form>
          </div>
        ) : (
          <div className="dashboard-view">
            <h1>Welcome, {localStorage.getItem('role')}!</h1>
            <p>You are logged in.</p>
          </div>
        )
      )}
    </div>
  );
}

export default Home;