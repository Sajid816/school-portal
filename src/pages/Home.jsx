import { useState, useEffect } from 'react';
import { auth, db } from '../firebase'; // Added db import
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore'; // Added Firestore imports

function Home() {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Checks if user is already logged in when the page loads
  useEffect(() => {
    const savedUid = localStorage.getItem('uid');
    const savedRole = localStorage.getItem('role');
    
    if (savedUid && savedRole) {
      if (savedRole === 'student') window.location.href = '/info';
      if (savedRole === 'teacher') window.location.href = '/teachers';
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const email = e.target.email.value.trim();
    const password = e.target.password.value;

    try {
      // 1. Authenticate user credentials
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      // 2. Fetch the user's true role from the database
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const realRole = docSnap.data().role; 

        // 3. Save the authoritative data to local storage
        localStorage.setItem('uid', uid);
        localStorage.setItem('role', realRole);
        
        // 4. Redirect automatically based on database role
        if (realRole === 'student') {
          window.location.href = '/info';
        } else if (realRole === 'teacher') {
          window.location.href = '/teachers';
        } else {
          setError("Account role not recognized in database.");
        }
      } else {
        // If they authenticated but have no database entry
        setError("No database profile found for this user.");
      }
      
    } catch (err) {
      console.error("Login Error:", err);
      setError('Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <h1>Portal Login</h1>
        <p>Enter your credentials to access your dashboard.</p>
        
        {error && <p style={{ color: '#d9534f', fontWeight: 'bold' }}>{error}</p>}

        <form onSubmit={handleLogin} style={{ textAlign: 'left' }}>
          <label>Email Address</label>
          <input type="email" name="email" className="glass-input" required />

          <label>Password</label>
          <input type="password" name="password" className="glass-input" required />

          <button type="submit" className="login-btn" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Log In"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Home;