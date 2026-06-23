import { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';

function Home() {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState('');
  const [name, setName] = useState('');
  const [tickerMessage, setTickerMessage] = useState('Loading announcements...');

  // Real-time listener for the news ticker
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "settings", "ticker"), (docSnap) => {
      if (docSnap.exists()) {
        setTickerMessage(docSnap.data().message || '');
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const uid = localStorage.getItem('uid');
    if (uid) {
      setIsLoggedIn(true);
      setRole(localStorage.getItem('role'));
      setName(localStorage.getItem('name'));
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, e.target.email.value, e.target.password.value);
      const uid = userCredential.user.uid;
      const docSnap = await getDoc(doc(db, "users", uid));
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        localStorage.setItem('uid', uid);
        localStorage.setItem('role', data.role);
        localStorage.setItem('name', data.fullName || "Staff");
        window.location.reload();
      } else {
        setError("Staff profile not found.");
      }
    } catch (err) { 
      setError('Invalid email or password.'); 
    } finally { 
      setIsLoading(false); 
    }
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Moving News Ticker */}
      <div className="news-ticker" style={{ overflow: 'hidden', whiteSpace: 'nowrap', width: '100%' }}>
        <marquee behavior="scroll" direction="left" scrollamount="6" style={{ fontWeight: 'bold' }}>
          {tickerMessage}
        </marquee>
      </div>

      <div className="home-container" style={{ textAlign: 'center', padding: '20px' }}>
        {!isLoggedIn ? (
          <div className="login-card" style={{ maxWidth: '400px', margin: 'auto', marginTop: '5vh' }}>
            <h1>Staff Login</h1>
            <p style={{ marginBottom: '20px', color: '#555' }}>Restricted access for Teachers and Administrators.</p>
            {error && <p style={{ color: '#d9534f', fontWeight: 'bold' }}>{error}</p>}
            <form onSubmit={handleLogin}>
              <input type="email" name="email" placeholder="Email" className="glass-input" required />
              <input type="password" name="password" placeholder="Password" className="glass-input" required />
              <button type="submit" className="login-btn" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Log In"}
              </button>
            </form>
          </div>
        ) : (
          <div className="dashboard-view" style={{ marginTop: '5vh' }}>
            <h1>Welcome, {name}!</h1>
            <p>You are logged in as a <strong>{role}</strong>.</p>
            <p>Use the navigation menu above to access your tools.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;