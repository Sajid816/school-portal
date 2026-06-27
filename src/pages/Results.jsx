import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

function Results() {
  const [selectedBranch, setSelectedBranch] = useState('kurpar');
  const [selectedClass, setSelectedClass] = useState('Playgroup');
  const [selectedSection, setSelectedSection] = useState('');
  const [sectionsMap, setSectionsMap] = useState({});
  const [activePdf, setActivePdf] = useState('');
  const [loading, setLoading] = useState(false);

  const BRANCHES = [
    { id: 'kurpar', name: 'হলি চাইল্ড একাডেমি, কুরপাড়' },
    { id: 'moktarpara', name: 'হলি চাইল্ড একাডেমি, মোক্তারপাড়া' }
  ];
  const classes = ["Playgroup", "Nursery", "KG", "Class 1", "Class 2", "Class 3", "Class 4", "Class 5"];

  useEffect(() => {
    fetchAdminSectionsConfig();
  }, []);

  const fetchAdminSectionsConfig = async () => {
    try {
      const docSnap = await getDoc(doc(db, "settings", "classSections"));
      if (docSnap.exists()) {
        setSectionsMap(docSnap.data().mapping || {});
      }
    } catch (err) {
      console.error("Error loading sections layout metadata:", err);
    }
  };

  const availableSections = sectionsMap[selectedClass] || [];

  useEffect(() => {
    if (availableSections.length > 0) {
      setSelectedSection(availableSections[0]);
    } else {
      setSelectedSection('');
    }
    setActivePdf('');
  }, [selectedClass, sectionsMap, selectedBranch]);

  const fetchResults = async () => {
    if (!selectedSection) return alert("No active sections mapping found.");
    setLoading(true);
    setActivePdf('');
    
    try {
      // Look up document based on all three parameters
      const docId = `${selectedBranch}_${selectedClass}_${selectedSection}`;
      const docSnap = await getDoc(doc(db, "results", docId));
      
      if (docSnap.exists() && docSnap.data().pdfUrl) {
        setActivePdf(docSnap.data().pdfUrl);
      } else {
        alert(`No results sheet published yet for ${selectedClass} - Section ${selectedSection} at this branch.`);
      }
    } catch (error) {
      console.error("Error fetching results:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px 20px', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', boxSizing: 'border-box' }}>
      <h1>Class Results Portal</h1>
      <p style={{ marginBottom: '20px', color: '#ddd', textAlign: 'center' }}>Select your branch, class, and section to view official transcripts</p>
      
      <div className="glass-notice-box" style={{ color: '#333', padding: '20px', width: '100%', maxWidth: '800px', display: 'flex', gap: '15px', flexWrap: 'wrap', justifyContent: 'center' }}>
        
        <select className="glass-input" style={{ margin: 0, flex: 1, minWidth: '200px' }} value={selectedBranch} onChange={e => setSelectedBranch(e.target.value)}>
          {BRANCHES.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>

        <select className="glass-input" style={{ margin: 0, width: '140px' }} value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
          {classes.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        
        <select 
          className="glass-input" 
          style={{ margin: 0, width: '140px' }} 
          value={selectedSection} 
          onChange={e => setSelectedSection(e.target.value)}
          disabled={availableSections.length === 0}
        >
          {availableSections.length > 0 ? (
            availableSections.map(sec => <option key={sec} value={sec}>Section {sec}</option>)
          ) : (
            <option value="">No Sections</option>
          )}
        </select>

        <button onClick={fetchResults} className="login-btn" style={{ margin: 0, width: '100px' }} disabled={availableSections.length === 0}>
          {loading ? "..." : "View"}
        </button>
      </div>

      {/* SECURE EMBEDDED PDF CANVAS VIEWER FRAME */}
      {activePdf && (
        <div className="glass-notice-box" style={{ color: '#333', padding: '20px', width: '100%', maxWidth: '1000px', marginTop: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '15px', alignItems: 'center', borderBottom: '1px solid #ccc', paddingBottom: '10px', flexWrap: 'wrap', gap: '10px' }}>
            <h3 style={{ margin: 0 }}>Transcript: {selectedClass} - Section {selectedSection}</h3>
            <a href={activePdf} target="_blank" rel="noreferrer" className="liquid-btn" style={{ fontSize: '0.85rem', textDecoration: 'none' }}>
              Open in New Tab ↗
            </a>
          </div>

          <div style={{ width: '100%', height: '70vh', borderRadius: '8px', overflow: 'hidden', border: '1px solid #bbb', background: '#fff' }}>
            <iframe 
              title="Class Result Document View"
              src={activePdf}
              width="100%" 
              height="100%" 
              style={{ border: 'none' }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default Results;