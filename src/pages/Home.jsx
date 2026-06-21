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
    try {
      const userCredential = await signInWithEmailAndPassword(auth, e.target.email.value, e.target.password.value);
      const docSnap = await getDoc(doc(db, "users", userCredential.user.uid));
      if (docSnap.exists()) {
        const data = docSnap.data();
        localStorage.setItem('uid', userCredential.user.uid);
        localStorage.setItem('role', data.role);
        localStorage.setItem('name', data.fullName); // Assuming your Firestore field is 'fullName'
        setUserData({ loggedIn: true, role: data.role, name: data.fullName });
      }
    } catch { setError('Invalid email or password.'); } finally { setIsLoading(false); }
  };

  return (
    <div className="home-container">
      <div className="news-ticker"><marquee>Latest: Admission for 2026 is now open!</marquee></div>

      {!userData.loggedIn ? (
        <div className="login-wrapper"><div className="login-card">
          <h1>Portal Login</h1>
          {error && <p style={{color:'red'}}>{error}</p>}
          <form onSubmit={handleLogin}>
            <input type="email" name="email" placeholder="Email" className="glass-input" required />
            <input type="password" name="password" placeholder="Password" className="glass-input" required />
            <button type="submit" className="login-btn">Log In</button>
          </form>
        </div></div>
      ) : (
        <div className="dashboard-view" style={{textAlign:'center', padding:'20px'}}>
          <h1>Welcome, {userData.name}!</h1>
          <img src="/school-building.jpg" alt="School" style={{maxWidth:'600px', borderRadius:'8px'}} />
          <div className="glass-notice-box">
            <h3>Recent Notices</h3>
            <ul><li>Library hours extended.</li><li>Sports day open.</li></ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;