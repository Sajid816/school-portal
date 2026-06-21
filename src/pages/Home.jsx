import { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

function Home() {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const savedUid = localStorage.getItem('uid');
    const savedRole = localStorage.getItem('role');
    
    if (savedUid && savedRole) {
      if (savedRole === 'student') window.location.href = '/info';
      else if (savedRole === 'teacher') window.location.href = '/teachers';
      else if (savedRole === 'admin') window.location.href = '/admin';
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const email = e.target.email.value.trim();
    const password = e.target.password.value;

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const realRole = docSnap.data().role; 
        localStorage.setItem('uid', uid);
        localStorage.setItem('role', realRole);
        
        if (realRole === 'student') {
          window.location.href = '/info';
        } else if (realRole === 'teacher') {
          window.location.href = '/teachers';
        } else if (realRole === 'admin') {
          window.location.href = '/admin';
        } else {
          setError("Account role not recognized in database.");
        }
      } else {
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