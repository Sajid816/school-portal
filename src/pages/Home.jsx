import { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

function Home() {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState({ loggedIn: false, role: '', name: '' });

  useEffect(() => {
    const uid = localStorage.getItem('uid');
    const role = localStorage.getItem('role');
    const name = localStorage.getItem('name');
    if (uid) setUserData({ loggedIn: true, role, name });
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;
      
      const docSnap = await getDoc(doc(db, "users", uid));
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        // Use 'fullName' as the field name
        const nameToSave = data.fullName || "User"; 
        
        localStorage.setItem('uid', uid);
        localStorage.setItem('role', data.role);
        localStorage.setItem('name', nameToSave);
        
        // Update state to trigger UI change
        setUserData({ loggedIn: true, role: data.role, name: nameToSave });
        
        // Dispatch custom event so Navbar updates immediately
        window.dispatchEvent(new Event('storage'));
      } else {
        setError("User profile not found.");
        setIsLoading(false);
      }
    } catch (err) {
      console.error(err);
      setError('Invalid email or password.');
      setIsLoading(false);
    }
  };

  return (
    <div className="home-container">
      <div className="news-ticker">
        <marquee>Latest: Admission for 2026 is now open! | Exam schedules have been updated.</marquee>
      </div>

      {!userData.loggedIn ? (
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
          <h1>Welcome, {userData.name}!</h1>
          <img src="/school-building.jpg" alt="School" style={{ maxWidth: '600px', borderRadius: '8px', width: '100%' }} />
          <div className="glass-notice-box">
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