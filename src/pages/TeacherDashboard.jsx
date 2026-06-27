import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

function TeacherDashboard() {
  const [pdfUrl, setPdfUrl] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('kurpar');
  const [selectedClass, setSelectedClass] = useState('Playgroup');
  const [selectedSection, setSelectedSection] = useState('');
  const [sectionsMap, setSectionsMap] = useState({});
  const [isUploading, setIsUploading] = useState(false);

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
      console.error("Error reading class mappings:", err);
    }
  };

  const availableSections = sectionsMap[selectedClass] || [];

  useEffect(() => {
    if (availableSections.length > 0) {
      setSelectedSection(availableSections[0]);
    } else {
      setSelectedSection('');
    }
  }, [selectedClass, sectionsMap]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!pdfUrl.trim()) return alert("Please provide a valid PDF link.");
    if (!selectedSection) return alert("The Admin has not activated any sections for this class yet.");
    
    setIsUploading(true);

    try {
      // Document ID now includes the branch for strict separation
      const docId = `${selectedBranch}_${selectedClass}_${selectedSection}`;
      const docRef = doc(db, "results", docId);
      
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const confirmOverwrite = window.confirm(
          `Results for ${selectedClass} - Section ${selectedSection} at this branch already exist. Overwrite them?`
        );
        if (!confirmOverwrite) {
          setIsUploading(false);
          return;
        }
      }

      await setDoc(docRef, {
        branch: selectedBranch,
        class: selectedClass,
        section: selectedSection,
        lastUpdated: new Date().toISOString(),
        pdfUrl: pdfUrl.trim()
      });
      
      alert(`Published results sheet link for ${selectedClass} - Section ${selectedSection}`);
      setPdfUrl('');
    } catch (error) {
      console.error(error);
      alert("Error saving result configuration link to database.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div style={{ padding: '40px', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h1>Teacher Dashboard</h1>
      
      <div className="glass-notice-box" style={{ color: '#333', padding: '30px', width: '100%', maxWidth: '700px' }}>
        <h3>Link Class Results Sheet</h3>
        <p style={{ fontSize: '0.85rem', color: '#555', marginBottom: '20px' }}>
          Paste a direct PDF URL or viewable sharing link (Google Drive, OneDrive, etc.) containing the section results.
        </p>
        
        <form onSubmit={handleUpload}>
          <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
            
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
                <option value="">No Active Sec</option>
              )}
            </select>
          </div>

          {availableSections.length === 0 && (
            <p style={{ color: '#d9534f', fontSize: '0.85rem', marginBottom: '15px', fontWeight: 'bold' }}>
              ⚠️ Notice: Admin needs to activate sections for {selectedClass} before you can publish.
            </p>
          )}

          <input 
            type="text" 
            className="glass-input"
            style={{ marginBottom: '20px', width: '100%', boxSizing: 'border-box' }}
            placeholder="Paste PDF link or shared file link here..."
            value={pdfUrl}
            onChange={e => setPdfUrl(e.target.value)}
            disabled={availableSections.length === 0}
            required
          />
          
          <button type="submit" className="login-btn" style={{ margin: 0 }} disabled={isUploading || availableSections.length === 0}>
            {isUploading ? "Publishing..." : "Publish Results Link"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default TeacherDashboard;