import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

function Contact() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Master state keeping track of both school branches
  const [branches, setBranches] = useState({
    kurpar: { mobile: '', phone: '', email: '', facebook: '', gmapUrl: '' },
    moktarpara: { mobile: '', phone: '', email: '', facebook: '', gmapUrl: '' }
  });

  // Admin Workspace State tracking the currently selected branch form fields
  const [selectedBranch, setSelectedBranch] = useState('kurpar');
  const [formData, setFormData] = useState({
    mobile: '',
    phone: '',
    email: '',
    facebook: '',
    gmapUrl: ''
  });

  // Permanent structural branch mapping labels
  const BRANCH_KEYS = ['kurpar', 'moktarpara'];
  const BRANCH_LABELS = {
    kurpar: 'হলি চাইল্ড একাডেমি, কুরপাড়, নেত্রকোণা',
    moktarpara: 'হলি চাইল্ড একাডেমি, মোক্তারপাড়া, নেত্রকোণা'
  };

  useEffect(() => {
    fetchContactData();
    if (localStorage.getItem('role') === 'admin') {
      setIsAdmin(true);
    }
  }, []);

  // Sync admin input field form data when switching target branch configuration tracks
  useEffect(() => {
    if (branches[selectedBranch]) {
      setFormData(branches[selectedBranch]);
    } else {
      setFormData({ mobile: '', phone: '', email: '', facebook: '', gmapUrl: '' });
    }
  }, [selectedBranch, branches]);

  const fetchContactData = async () => {
    setLoading(true);
    try {
      const docSnap = await getDoc(doc(db, "settings", "contactData"));
      if (docSnap.exists() && docSnap.data().branches) {
        setBranches(docSnap.data().branches);
      }
    } catch (err) {
      console.error("Error loading contact data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveContact = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    const updatedBranches = {
      ...branches,
      [selectedBranch]: {
        mobile: formData.mobile.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        facebook: formData.facebook.trim(),
        gmapUrl: formData.gmapUrl.trim()
      }
    };

    try {
      await setDoc(doc(db, "settings", "contactData"), { branches: updatedBranches });
      setBranches(updatedBranches);
      alert(`Contact info for branch updated successfully!`);
    } catch (error) {
      alert("Failed to update contact data.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', color: 'white', textAlign: 'center' }}>Loading Contact Information...</div>;
  }

  return (
    <div style={{ padding: '40px', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h1>Contact Us</h1>
      <p style={{ marginBottom: '30px', color: '#ddd' }}>Get in touch with our institutional campus branches</p>

      {/* ADMIN CONTROLS WORKSPACE CONTAINER */}
      {isAdmin && (
        <div className="glass-notice-box" style={{ color: '#333', padding: '30px', width: '100%', maxWidth: '800px', marginBottom: '40px' }}>
          <h3>Edit Branch Contact Fields</h3>
          <p style={{ fontSize: '0.85rem', color: '#555', marginBottom: '15px' }}>
            Select the specific institutional branch tab below to edit or clear its public information panel data.
          </p>
          
          <form onSubmit={handleSaveContact} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Select Target Branch</label>
              <select className="glass-input" style={{ margin: 0, width: '100%' }} value={selectedBranch} onChange={e => setSelectedBranch(e.target.value)}>
                {BRANCH_KEYS.map(key => (
                  <option key={key} value={key}>{BRANCH_LABELS[key]}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Mobile Number</label>
                <input type="text" className="glass-input" style={{ margin: 0, width: '100%' }} value={formData.mobile} onChange={e => setFormData({ ...formData, mobile: e.target.value })} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Telephone Phone</label>
                <input type="text" className="glass-input" style={{ margin: 0, width: '100%' }} value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Official Email</label>
                <input type="email" className="glass-input" style={{ margin: 0, width: '100%' }} value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Facebook Page URL</label>
                <input type="text" className="glass-input" style={{ margin: 0, width: '100%' }} value={formData.facebook} onChange={e => setFormData({ ...formData, facebook: e.target.value })} />
              </div>
            </div>

            <div>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Google Maps Embed Link (src only)</label>
              <input type="text" className="glass-input" style={{ margin: 0, width: '100%' }} placeholder="https://www.google.com/maps/embed?pb=..." value={formData.gmapUrl} onChange={e => setFormData({ ...formData, gmapUrl: e.target.value })} />
            </div>

            <button type="submit" className="login-btn" style={{ margin: 0, width: 'auto', alignSelf: 'flex-end' }} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Branch Info"}
            </button>
          </form>
        </div>
      )}

      {/* PUBLIC DISPLAY - TWO EQUAL LOOKING BRANCH CARDS */}
      <div style={{ width: '100%', maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
        {BRANCH_KEYS.map(key => {
          const info = branches[key];
          
          return (
            <div key={key} className="glass-notice-box" style={{ color: '#333', padding: '35px', display: 'flex', flexWrap: 'wrap', gap: '30px' }}>
              
              {/* Text Metrics Block */}
              <div style={{ flex: 1, minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <h2 style={{ fontSize: '1.4rem', borderBottom: '2px solid #0056b3', paddingBottom: '8px', color: '#111', margin: 0 }}>
                  {BRANCH_LABELS[key]}
                </h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '5px' }}>
                  {info.mobile && <div><b>📱 Mobile:</b> {info.mobile}</div>}
                  {info.phone && <div><b>☎️ Phone:</b> {info.phone}</div>}
                  {info.email && <div><b>📧 Email:</b> <a href={`mailto:${info.email}`} style={{ color: '#0056b3', textDecoration: 'none' }}>{info.email}</a></div>}
                  {info.facebook && <div><b>🌐 Facebook:</b> <a href={info.facebook} target="_blank" rel="noreferrer" style={{ color: '#0056b3', fontWeight: 'bold' }}>Visit Official Page</a></div>}
                  
                  {/* Clean fallback notice message if a brand new branch has zero fields filled out yet */}
                  {!info.mobile && !info.phone && !info.email && !info.facebook && (
                    <p style={{ fontStyle: 'italic', color: '#777', margin: 0 }}>No contact metrics published for this branch yet.</p>
                  )}
                </div>
              </div>

              {/* Map Canvas Frame Block */}
              {info.gmapUrl ? (
                <div style={{ flex: 1, minWidth: '300px', height: '240px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #ccc', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                  <iframe 
                    title={`Map for ${BRANCH_LABELS[key]}`}
                    src={info.gmapUrl} 
                    width="100%" 
                    height="100%" 
                    style={{ border: 0 }} 
                    allowFullScreen="" 
                    loading="lazy"
                  />
                </div>
              ) : (
                <div style={{ flex: 1, minWidth: '300px', height: '240px', borderRadius: '12px', border: '1px dashed #bbb', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.02)' }}>
                  <span style={{ color: '#777', fontStyle: 'italic', fontSize: '0.9rem' }}>No Location Map Embedded</span>
                </div>
              )}

            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Contact;