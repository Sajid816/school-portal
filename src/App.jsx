import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Education from './pages/Education';
import Teachers from './pages/Teachers';
import Admissions from './pages/Admissions';
import Gallery from './pages/Gallery';
import Contact from './pages/Contact';
import Results from './pages/Results';
import Info from './pages/info';
import Admin from './pages/Admin';

function Navbar() {
  const location = useLocation();
  const [auth, setAuth] = useState({ uid: localStorage.getItem('uid'), role: localStorage.getItem('role') });

  // Listens for storage changes to update navbar instantly
  useEffect(() => {
    const handleStorageChange = () => setAuth({ uid: localStorage.getItem('uid'), role: localStorage.getItem('role') });
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/'; 
  };

  return (
    <nav className="top-ribbon">
      <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Home</Link>
      <Link to="/about" className={location.pathname === '/about' ? 'active' : ''}>About</Link>
      <Link to="/education" className={location.pathname === '/education' ? 'active' : ''}>Education</Link>
      <Link to="/admissions" className={location.pathname === '/admissions' ? 'active' : ''}>Admissions</Link>
      <Link to="/gallery" className={location.pathname === '/gallery' ? 'active' : ''}>Gallery</Link>
      <Link to="/contact" className={location.pathname === '/contact' ? 'active' : ''}>Contact</Link>
      
      {auth.uid && auth.role === 'student' && (
        <>
          <Link to="/results" className={location.pathname === '/results' ? 'active' : ''}>My Results</Link>
          <Link to="/info" className={location.pathname === '/info' ? 'active' : ''}>My Info</Link>
        </>
      )}

      {auth.uid && auth.role === 'teacher' && <Link to="/teachers" className={location.pathname === '/teachers' ? 'active' : ''}>Teacher Dashboard</Link>}
      {auth.uid && auth.role === 'admin' && <Link to="/admin" className={location.pathname === '/admin' ? 'active' : ''}>Admin Panel</Link>}
      {auth.uid && <button onClick={handleLogout} style={{ color: '#d9534f', marginLeft: '15px', fontWeight: 'bold', cursor: 'pointer', border: 'none', background: 'transparent' }}>Logout</button>}
    </nav>
  );
}

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/education" element={<Education />} />
        <Route path="/teachers" element={<Teachers />} />
        <Route path="/admissions" element={<Admissions />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/results" element={<Results />} />
        <Route path="/info" element={<Info />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Router>
  );
}

export default App;