import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

function Administration() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const [selectedRole, setSelectedRole] = useState('Principal');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contact: '',
    imageUrl: '',
    message: ''
  });

  const ROLES = ['Principal', 'Vice Principal', 'Headmaster', 'Assistant Headmaster'];

  useEffect(() => {
    fetchAdministrationData();
    if (localStorage.getItem('role') === 'admin') {
      setIsAdmin(true);
    }
  }, []);

  useEffect(() => {
    if (profiles[selectedRole]) {
      setFormData(profiles[selectedRole]);
    } else {
      setFormData({ name: '', email: '', contact: '', imageUrl: '', message: '' });
    }
  }, [selectedRole, profiles]);

  const fetchAdministrationData = async () => {
    setLoading(true);
    try {
      const docSnap = await getDoc(doc(db, "settings", "administrationData"));
      if (docSnap.exists()) {
        setProfiles(docSnap.data().roles || {});
      }
    } catch (err) {
      console.error("Error loading administration data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    const updatedProfiles = {
      ...profiles,
      [selectedRole]: {
        name: formData.name.trim(),
        email: formData.email.trim(),
        contact: formData.contact.trim(),
        imageUrl: formData.imageUrl.trim(),
        message: (formData.message || '').trim()
      }
    };

    try {
      await setDoc(doc(db, "settings", "administrationData"), { roles: updatedProfiles });
      setProfiles(updatedProfiles);
      alert(`${selectedRole} profile updated successfully!`);
    } catch (error) {
      console.error(error);
      alert("Failed to update record.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', color: 'white', textAlign: 'center' }}>Loading Administrative Profiles...</div>;
  }

  return (
    <div style={{ padding: '40px', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h1>School Administration</h1>
      <p style={{ marginBottom: '30px', color: '#ddd' }}>Meet the management team steering our institution</p>

      {/* ADMIN EDIT PANEL */}
      {isAdmin && (
        <div className="glass-notice-box" style={{ color: '#333', padding: '30px', width: '100%', maxWidth: '900px', marginBottom: '40px' }}>
          <h3>Edit Administration Profiles</h3>
          <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Select Designation</label>
                <select className="glass-input" style={{ margin: 0, width: '100%' }} value={selectedRole} onChange={e => setSelectedRole(e.target.value)}>
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div style={{ flex: 2, minWidth: '200px' }}>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Full Name</label>
                <input type="text" className="glass-input" style={{ margin: 0, width: '100%' }} value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Email Address</label>
                <input type="email" className="glass-input" style={{ margin: 0, width: '100%' }} value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required />
              </div>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Contact Number</label>
                <input type="text" className="glass-input" style={{ margin: 0, width: '100%' }} value={formData.contact} onChange={e => setFormData({ ...formData, contact: e.target.value })} required />
              </div>
            </div>

            <div>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Direct Image URL</label>
              <input type="text" className="glass-input" style={{ margin: 0, width: '100%' }} value={formData.imageUrl} onChange={e => setFormData({ ...formData, imageUrl: e.target.value })} required />
            </div>

            <div>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Official Message (Optional)</label>
              <textarea className="glass-input" style={{ margin: 0, width: '100%', minHeight: '80px', padding: '10px' }} value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })} />
            </div>

            <button type="submit" className="login-btn" style={{ margin: 0, alignSelf: 'flex-end', width: 'auto' }} disabled={isSaving}>
              {isSaving ? "Saving..." : `Update ${selectedRole}`}
            </button>
          </form>
        </div>
      )}

      {/* PUBLIC VIEW */}
      <div style={{ width: '100%', maxWidth: '900px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
        {ROLES.map(role => {
          const profile = profiles[role];
          if (!profile || !profile.name) return null;

          return (
            <div key={role} className="glass-notice-box" style={{ color: '#333', padding: '35px', display: 'flex', gap: '30px', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ width: '220px', height: '280px', borderRadius: '12px', overflow: 'hidden', background: '#f0f0f0', border: '1px solid #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {profile.imageUrl ? <img src={profile.imageUrl} alt={role} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <span style={{ color: '#999' }}>No Photo</span>}
              </div>

              <div style={{ flex: 1, minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ textTransform: 'uppercase', fontSize: '0.85rem', fontWeight: 'bold', color: '#0056b3' }}>{role}</span>
                <h2 style={{ margin: 0, borderBottom: '2px solid #0056b3', paddingBottom: '5px', display: 'inline-block' }}>{profile.name}</h2>
                
                {/* Clean conditional text parsing: prevents white boxes when empty */}
                {profile.message && (
                  <p style={{ fontStyle: 'italic', color: '#555', margin: '10px 0', lineHeight: '1.6', fontSize: '0.95rem', whiteSpace: 'pre-line' }}>
                    "{profile.message}"
                  </p>
                )}

                <div style={{ marginTop: '10px', fontSize: '0.9rem', color: '#444' }}>
                  <div><b>📧 Email:</b> <a href={`mailto:${profile.email}`} style={{ color: '#0056b3' }}>{profile.email}</a></div>
                  <div><b>📞 Contact:</b> {profile.contact}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Administration;