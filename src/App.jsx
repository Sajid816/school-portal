import { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { auth, db } from './firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

import Home from './pages/Home';
import Administration from './pages/Administration';
import Education from './pages/Education';
import TeacherDashboard from './pages/TeacherDashboard';
import Admissions from './pages/Admissions';
import Gallery from './pages/Gallery';
import Contact from './pages/Contact';
import Results from './pages/Results';
import Admin from './pages/Admin';
import Faculty from './pages/Faculty'; 

function Navbar() {
  const location = useLocation();
  const [authData, setAuthData] = useState({ uid: localStorage.getItem('uid'), role: localStorage.getItem('role') });
  
  const [showLogin, setShowLogin] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const loginRef = useRef(null);

  useEffect(() => {
    const handleStorageChange = () => setAuthData({ uid: localStorage.getItem('uid'), role: localStorage.getItem('role') });
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (loginRef.current && !loginRef.current.contains(event.target)) {
        setShowLogin(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [loginRef]);

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
        localStorage.setItem('name', data.fullName || "Admin");
        window.location.reload();
      } else {
        setError("Admin profile not found.");
      }
    } catch (err) { 
      setError('Invalid email or password.'); 
    } finally { 
      setIsLoading(false); 
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/'; 
  };

  return (
    <nav className="top-ribbon" style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', flex: 1, justifyContent: 'center' }}>
        <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Home</Link>
        <Link to="/administration" className={location.pathname === '/administration' ? 'active' : ''}>Administration</Link>
        <Link to="/faculty" className={location.pathname === '/faculty' ? 'active' : ''}>Teachers</Link>
        <Link to="/education" className={location.pathname === '/education' ? 'active' : ''}>Education</Link>
        <Link to="/gallery" className={location.pathname === '/gallery' ? 'active' : ''}>Gallery</Link>
        <Link to="/contact" className={location.pathname === '/contact' ? 'active' : ''}>Contact</Link>
        
        {authData.uid && authData.role === 'admin' && <Link to="/admin" className={location.pathname === '/admin' ? 'active' : ''}>Admin Panel</Link>}
      </div>

      <div style={{ position: 'relative' }} ref={loginRef}>
        {authData.uid ? (
          <button onClick={handleLogout} style={{ color: '#d9534f', fontWeight: 'bold', cursor: 'pointer', border: 'none', background: 'transparent' }}>Logout</button>
        ) : (
          <button 
            onClick={() => setShowLogin(!showLogin)} 
            className="liquid-btn" 
            style={{ fontSize: '0.9rem', padding: '8px 20px', background: showLogin ? 'rgba(255,255,255,0.8)' : '' }}
          >
            Admin Login
          </button>
        )}

        {showLogin && !authData.uid && (
          <div className="glass-notice-box" style={{ position: 'absolute', top: '50px', right: '0', width: '300px', padding: '25px', zIndex: 1000, boxShadow: '0 10px 40px rgba(0,0,0,0.3)' }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '1.2rem', color: '#111' }}>System Access</h3>
            {error && <p style={{ color: '#d9534f', fontWeight: 'bold', fontSize: '0.85rem', margin: '0 0 10px 0' }}>{error}</p>}
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input type="email" name="email" placeholder="Email Address" className="glass-input" style={{ margin: 0, padding: '10px' }} required />
              <input type="password" name="password" placeholder="Password" className="glass-input" style={{ margin: 0, padding: '10px' }} required />
              <button type="submit" className="login-btn" style={{ margin: '10px 0 0 0', padding: '10px' }} disabled={isLoading}>
                {isLoading ? "Authenticating..." : "Sign In"}
              </button>
            </form>
          </div>
        )}
      </div>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/administration" element={<Administration />} />
        <Route path="/faculty" element={<Faculty />} />
        <Route path="/education" element={<Education />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/admin" element={<Admin />} />
        
        {/* Hidden Routes */}
        <Route path="/teacher" element={<TeacherDashboard />} />
        <Route path="/admissions" element={<Admissions />} />
        <Route path="/results" element={<Results />} />
      </Routes>
    </Router>
  );
}

export default App;