import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Administration from './pages/Administration';
import Education from './pages/Education';
import TeacherDashboard from './pages/TeacherDashboard';
import Admissions from './pages/Admissions';
import Gallery from './pages/Gallery';
import Contact from './pages/Contact';
import Results from './pages/Results';
import Admin from './pages/Admin';
import Faculty from './pages/Faculty'; // Public directory page

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
      <Link to="/administration" className={location.pathname === '/administration' ? 'active' : ''}>Administration</Link>
      <Link to="/faculty" className={location.pathname === '/faculty' ? 'active' : ''}>Teachers</Link>
      <Link to="/education" className={location.pathname === '/education' ? 'active' : ''}>Education</Link>
      <Link to="/admissions" className={location.pathname === '/admissions' ? 'active' : ''}>Admissions</Link>
      <Link to="/gallery" className={location.pathname === '/gallery' ? 'active' : ''}>Gallery</Link>
      <Link to="/contact" className={location.pathname === '/contact' ? 'active' : ''}>Contact</Link>
      <Link to="/results" className={location.pathname === '/results' ? 'active' : ''}>Results</Link>

      {auth.uid && auth.role === 'teacher' && <Link to="/teacher" className={location.pathname === '/teacher' ? 'active' : ''}>Teacher Dashboard</Link>}
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
        <Route path="/administration" element={<Administration />} />
        <Route path="/faculty" element={<Faculty />} />
        <Route path="/education" element={<Education />} />
        <Route path="/teacher" element={<TeacherDashboard />} />
        <Route path="/admissions" element={<Admissions />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/results" element={<Results />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Router>
  );
}

export default App;