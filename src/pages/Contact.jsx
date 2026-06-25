import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

function Contact() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [contactInfo, setContactInfo] = useState({
    mobile: '',
    phone: '',
    email: '',
    facebook: '',
    gmapUrl: ''
  });

  useEffect(() => {
    fetchContactData();
    if (localStorage.getItem('role') === 'admin') {
      setIsAdmin(true);
    }
  }, []);

  const fetchContactData = async () => {
    setLoading(true);
    try {
      const docSnap = await getDoc(doc(db, "settings", "contactData"));
      if (docSnap.exists()) {
        setContactInfo(docSnap.data());
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
    try {
      await setDoc(doc(db, "settings", "contactData"), contactInfo);
      alert("Contact information updated successfully!");
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
      <p style={{ marginBottom: '30px', color: '#ddd' }}>Get in touch with our institutional campus layout desk</p>

      {/* ADMIN EDIT CONTACT WORKSPACE */}
      {isAdmin && (
        <div className="glass-notice-box" style={{ color: '#333', padding: '30px', width: '100%', maxWidth: '800px', marginBottom: '40px' }}>
          <h3>Edit Contact Portal Fields</h3>
          <p style={{ fontSize: '0.85rem', color: '#555', marginBottom: '15px' }}>
            Leave fields empty to hide them entirely from the visitor view page. For Google Maps, paste the URL inside the src attribute of the embed code.
          </p>
          <form onSubmit={handleSaveContact} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Mobile Number</label>
                <input type="text" className="glass-input" style={{ margin: 0, width: '100%' }} value={contactInfo.mobile} onChange={e => setContactInfo({ ...contactInfo, mobile: e.target.value })} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Telephone Phone</label>
                <input type="text" className="glass-input" style={{ margin: 0, width: '100%' }} value={contactInfo.phone} onChange={e => setContactInfo({ ...contactInfo, phone: e.target.value })} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Official Email</label>
                <input type="email" className="glass-input" style={{ margin: 0, width: '100%' }} value={contactInfo.email} onChange={e => setContactInfo({ ...contactInfo, email: e.target.value })} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Facebook Page URL</label>
                <input type="text" className="glass-input" style={{ margin: 0, width: '100%' }} value={contactInfo.facebook} onChange={e => setContactInfo({ ...contactInfo, facebook: e.target.value })} />
              </div>
            </div>

            <div>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Google Maps Embed Embed Link (src only)</label>
              <input type="text" className="glass-input" style={{ margin: 0, width: '100%' }} placeholder="https://www.google.com/maps/embed?pb=..." value={contactInfo.gmapUrl} onChange={e => setContactInfo({ ...contactInfo, gmapUrl: e.target.value })} />
            </div>

            <button type="submit" className="login-btn" style={{ margin: 0, width: 'auto', alignSelf: 'flex-end' }} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Contact Info"}
            </button>
          </form>
        </div>
      )}

      {/* PUBLIC CONTROLLER WRAPPER GRID */}
      <div style={{ width: '100%', maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '25px' }}>
        <div className="glass-notice-box" style={{ color: '#333', padding: '30px', display: 'flex', flexWrap: 'wrap', gap: '30px' }}>
          
          {/* Text details column layout block */}
          <div style={{ flex: 1, minWidth: '250px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <h2>Campus Details</h2>
            
            {contactInfo.mobile && <div><b>📱 Mobile:</b> {contactInfo.mobile}</div>}
            {contactInfo.phone && <div><b>☎️ Phone:</b> {contactInfo.phone}</div>}
            {contactInfo.email && <div><b>📧 Email:</b> <a href={`mailto:${contactInfo.email}`} style={{ color: '#0056b3' }}>{contactInfo.email}</a></div>}
            {contactInfo.facebook && <div><b>🌐 Facebook:</b> <a href={contactInfo.facebook} target="_blank" rel="noreferrer" style={{ color: '#0056b3', fontWeight: 'bold' }}>Visit Official Page</a></div>}
            
            {/* Fallback check if admin leaves everything blank */}
            {!contactInfo.mobile && !contactInfo.phone && !contactInfo.email && !contactInfo.facebook && (
              <p style={{ fontStyle: 'italic', color: '#666' }}>No written contact metrics published yet.</p>
            )}
          </div>

          {/* Embedded Google Maps container frame block */}
          {contactInfo.gmapUrl && (
            <div style={{ flex: 1, minWidth: '300px', height: '250px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #ccc' }}>
              <iframe 
                title="School Location Map"
                src={contactInfo.gmapUrl} 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen="" 
                loading="lazy"
              />
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default Contact;