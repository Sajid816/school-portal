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
      {/* News Ticker - Visible to everyone */}
      <div className="news-ticker">
        <marquee>Latest: Admission for 2026 is now open! | Exam schedules have been updated.</marquee>
      </div>

      {!isLoggedIn ? (
        // Login View
        <div className="login-wrapper">
          <div className="login-card">
            <h1>Portal Login</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleLogin}>
              <input type="email" name="email" placeholder="Email" required />
              <input type="password" name="password" placeholder="Password" required />
              <button type="submit" disabled={isLoading}>{isLoading ? "Logging in..." : "Log In"}</button>
            </form>
          </div>
        </div>
      ) : (
        // Post-Login View
        <div className="dashboard-view">
          <h1>Welcome, {userRole}!</h1>
          <img src="/school-building.jpg" alt="School" className="school-img" />
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