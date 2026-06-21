import { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

function Home() {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const savedUid = localStorage.getItem('uid');
    const savedRole = localStorage.getItem('role');
    if (savedUid && savedRole) {
      setIsLoggedIn(true);
      setUserRole(savedRole);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const userCredential = await signInWithEmailAndPassword(auth, e.target.email.value, e.target.password.value);
      const docSnap = await getDoc(doc(db, "users", userCredential.user.uid));
      if (docSnap.exists()) {
        const role = docSnap.data().role;
        localStorage.setItem('uid', userCredential.user.uid);
        localStorage.setItem('role', role);
        setIsLoggedIn(true);
        setUserRole(role);
      }
    } catch (err) {
      setError('Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="home-container">
      <div className="news-ticker">
        <marquee>Latest: Admission for 2026 is now open! | Exam schedules have been updated.</marquee>
      </div>

      {!isLoggedIn ? (
        <div className="login-wrapper">
          <div className="login-card">
            <h1>Portal Login</h1>
            {error && <p style={{ color: '#d9534f', fontWeight: 'bold' }}>{error}</p>}
            <form onSubmit={handleLogin}>
              <input type="email" name="email" placeholder="Email" className="glass-input" required />
              <input type="password" name="password" placeholder="Password" className="glass-input" required />
              <button type="submit" className="login-btn" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Log In"}
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="dashboard-view" style={{ textAlign: 'center', padding: '20px' }}>
          <h1>Welcome, {userRole}!</h1>
          <img src="/school-building.jpg" alt="School" style={{ width: '100%', maxWidth: '600px', borderRadius: '8px' }} />
          <div className="updates-section">
            <h3>Recent Notices</h3>
            <ul>
              <li>Library hours extended for finals week.</li>
              <li>Annual sports day registrations are open.</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;