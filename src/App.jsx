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
import Admin from './pages/Admin'; // Imported the new Admin page

function Navbar() {
  const location = useLocation();
  const uid = localStorage.getItem('uid');
  const role = localStorage.getItem('role');

  
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
      
      {/* Student Links */}
      {uid && role === 'student' && (
        <>
          <Link to="/results" className={location.pathname === '/results' ? 'active' : ''}>My Results</Link>
          <Link to="/info" className={location.pathname === '/info' ? 'active' : ''}>My Info</Link>
        </>
      )}

      {/* Teacher Links */}
      {uid && role === 'teacher' && (
        <Link to="/teachers" className={location.pathname === '/teachers' ? 'active' : ''}>Teacher Dashboard</Link>
      )}

      {/* Admin Links */}
      {uid && role === 'admin' && (
        <Link to="/admin" className={location.pathname === '/admin' ? 'active' : ''}>Admin Panel</Link>
      )}

      {/* Logout */}
      {uid && (
        <button onClick={handleLogout} style={{ color: '#d9534f', marginLeft: '15px', fontWeight: 'bold', cursor: 'pointer', border: 'none', background: 'transparent' }}>Logout</button>
      )}
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
        
        {/* The Admin Route */}
        <Route path="/admin" element={
          localStorage.getItem('role') === 'admin' ? <Admin /> : <div style={{ color: 'white', padding: '50px' }}><h1>Access Denied</h1></div>
        } />
      </Routes>
    </Router>
  );
}

export default App;