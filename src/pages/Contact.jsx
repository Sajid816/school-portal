import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

function Contact() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Master state keeping track of both school branches
  const [branches, setBranches] = useState({
    kurpar: { mobile: '', phone: '', whatsapp: '', email: '', facebook: '', gmapUrl: '' },
    moktarpara: { mobile: '', phone: '', whatsapp: '', email: '', facebook: '', gmapUrl: '' }
  });

  // Global state for shared links (like YouTube)
  const [globalData, setGlobalData] = useState({
    youtubeUrl: 'https://youtube.com/@holychildacademy4192?si=N0pI8-yVKogULJpy'
  });

  // Admin Workspace State tracking the currently selected branch form fields
  const [selectedBranch, setSelectedBranch] = useState('kurpar');
  const [formData, setFormData] = useState({
    mobile: '',
    phone: '',
    whatsapp: '',
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
      setFormData({
        mobile: branches[selectedBranch].mobile || '',
        phone: branches[selectedBranch].phone || '',
        whatsapp: branches[selectedBranch].whatsapp || '',
        email: branches[selectedBranch].email || '',
        facebook: branches[selectedBranch].facebook || '',
        gmapUrl: branches[selectedBranch].gmapUrl || ''
      });
    } else {
      setFormData({ mobile: '', phone: '', whatsapp: '', email: '', facebook: '', gmapUrl: '' });
    }
  }, [selectedBranch, branches]);

  const fetchContactData = async () => {
    setLoading(true);
    try {
      const docSnap = await getDoc(doc(db, "settings", "contactData"));
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.branches) setBranches(data.branches);
        if (data.global) setGlobalData(data.global);
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
        whatsapp: formData.whatsapp.trim(),
        email: formData.email.trim(),
        facebook: formData.facebook.trim(),
        gmapUrl: formData.gmapUrl.trim()
      }
    };

    try {
      // Save both branch-specific data and global data together
      await setDoc(doc(db, "settings", "contactData"), { 
        branches: updatedBranches,
        global: { youtubeUrl: globalData.youtubeUrl.trim() }
      });
      setBranches(updatedBranches);
      alert(`Contact info updated successfully!`);
    } catch (error) {
      alert("Failed to update contact data.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '40px 20px', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', minHeight: '100vh', boxSizing: 'border-box', backgroundImage: 'url("/pictures/contact.jpg")', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', backgroundAttachment: 'fixed' }}>Loading Contact Information...</div>;
  }

  return (
    <div style={{ padding: '40px 20px', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', minHeight: '100vh', boxSizing: 'border-box', backgroundImage: 'url("/pictures/contact.jpg")', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', backgroundAttachment: 'fixed' }}>
      
      {/* FIXED READABILITY: Title wrapped in a glass box */}
      <div style={{ background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(10px)', padding: '20px 50px', borderRadius: '16px', textAlign: 'center', marginBottom: '40px', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
        <h1 style={{ margin: '0 0 10px 0', color: '#111', fontSize: '2.5rem' }}>Contact Us</h1>
        <p style={{ margin: 0, color: '#444', fontWeight: 'bold', fontSize: '1.1rem' }}>Get in touch with our institutional campus branches</p>
      </div>

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
              <div style={{ flex: 1, minWidth: '150px' }}>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Mobile Number</label>
                <input type="text" className="glass-input" style={{ margin: 0, width: '100%' }} value={formData.mobile} onChange={e => setFormData({ ...formData, mobile: e.target.value })} />
              </div>
              <div style={{ flex: 1, minWidth: '150px' }}>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Telephone Phone</label>
                <input type="text" className="glass-input" style={{ margin: 0, width: '100%' }} value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
              </div>
              <div style={{ flex: 1, minWidth: '150px' }}>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>WhatsApp Number</label>
                <input type="text" className="glass-input" style={{ margin: 0, width: '100%' }} placeholder="e.g. 88017..." value={formData.whatsapp} onChange={e => setFormData({ ...formData, whatsapp: e.target.value })} />
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

            {/* GLOBAL YOUTUBE LINK AREA */}
            <div style={{ marginTop: '10px', paddingTop: '15px', borderTop: '2px solid rgba(0,0,0,0.1)' }}>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px', color: '#d9534f' }}>Global YouTube Channel Link (Applies to all branches)</label>
              <input type="text" className="glass-input" style={{ margin: 0, width: '100%' }} value={globalData.youtubeUrl} onChange={e => setGlobalData({ youtubeUrl: e.target.value })} />
            </div>

            <button type="submit" className="login-btn" style={{ margin: 0, width: 'auto', alignSelf: 'flex-end' }} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Configuration"}
            </button>
          </form>
        </div>
      )}

      {/* GLOBAL YOUTUBE DISPLAY */}
      {globalData.youtubeUrl && (
        <div style={{ width: '100%', maxWidth: '800px', display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
          <a 
            href={globalData.youtubeUrl} 
            target="_blank" 
            rel="noreferrer" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px', 
              background: '#FF0000', 
              color: 'white', 
              padding: '12px 30px', 
              borderRadius: '30px', 
              textDecoration: 'none', 
              fontSize: '1.1rem', 
              fontWeight: 'bold', 
              boxShadow: '0 4px 15px rgba(255,0,0,0.3)',
              transition: 'transform 0.2s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <img src="/pictures/youtube.png" alt="" style={{ width: '24px', height: '24px' }} onError={(e) => e.target.style.display='none'} />
            Visit our Official YouTube Channel
          </a>
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
                  
                  {/* Whatsapp Button */}
                  {info.whatsapp && (
                    <a 
                      href={`https://wa.me/${info.whatsapp.replace(/[^0-9]/g, '')}`} 
                      target="_blank" 
                      rel="noreferrer" 
                      style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '8px', 
                        background: '#25D366', 
                        color: 'white', 
                        padding: '8px 16px', 
                        borderRadius: '20px', 
                        textDecoration: 'none', 
                        fontWeight: 'bold', 
                        width: 'fit-content',
                        marginTop: '10px',
                        boxShadow: '0 2px 8px rgba(37, 211, 102, 0.3)'
                      }}
                    >
                      <img src="/pictures/whatsapp.png" alt="" style={{ width: '20px', height: '20px' }} onError={(e) => e.target.style.display='none'} />
                      Message on WhatsApp
                    </a>
                  )}
                  
                  {/* Clean fallback notice message if a brand new branch has zero fields filled out yet */}
                  {!info.mobile && !info.phone && !info.email && !info.facebook && !info.whatsapp && (
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