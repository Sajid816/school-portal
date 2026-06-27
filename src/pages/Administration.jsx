import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

function Administration() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // Structural Taxonomies
  const BRANCHES = [
    { id: 'kurpar', name: 'হলি চাইল্ড একাডেমি, কুরপাড়' },
    { id: 'moktarpara', name: 'হলি চাইল্ড একাডেমি, মোক্তারপাড়া' }
  ];
  const ROLES = ['Principal', 'Vice Principal', 'Headmaster', 'Assistant Headmaster'];

  // Admin Uploader States
  const [adminBranch, setAdminBranch] = useState('kurpar');
  const [selectedRole, setSelectedRole] = useState('Principal');
  const [formData, setFormData] = useState({
    name: '', email: '', contact: '', imageUrl: '', message: ''
  });

  // Public Viewer State
  const [publicBranch, setPublicBranch] = useState('kurpar');

  useEffect(() => {
    fetchAdministrationData();
    if (localStorage.getItem('role') === 'admin') {
      setIsAdmin(true);
    }
  }, []);

  // Sync admin form data when they switch branches or roles
  useEffect(() => {
    if (profiles[adminBranch] && profiles[adminBranch][selectedRole]) {
      setFormData(profiles[adminBranch][selectedRole]);
    } else {
      setFormData({ name: '', email: '', contact: '', imageUrl: '', message: '' });
    }
  }, [adminBranch, selectedRole, profiles]);

  const fetchAdministrationData = async () => {
    setLoading(true);
    try {
      const docSnap = await getDoc(doc(db, "settings", "administrationData"));
      if (docSnap.exists()) {
        setProfiles(docSnap.data().branches || {});
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
      [adminBranch]: {
        ...(profiles[adminBranch] || {}),
        [selectedRole]: {
          name: formData.name.trim(),
          email: formData.email.trim(),
          contact: formData.contact.trim(),
          imageUrl: formData.imageUrl.trim(),
          message: (formData.message || '').trim()
        }
      }
    };

    try {
      await setDoc(doc(db, "settings", "administrationData"), { branches: updatedProfiles });
      setProfiles(updatedProfiles);
      alert(`${selectedRole} for ${BRANCHES.find(b => b.id === adminBranch).name} updated successfully!`);
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

  const activePublicProfiles = profiles[publicBranch] || {};

  return (
    <div style={{ padding: '40px 20px', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', boxSizing: 'border-box' }}>
      <h1>School Administration</h1>
      <p style={{ marginBottom: '30px', color: '#ddd', textAlign: 'center' }}>Meet the management team steering our institution</p>

      {/* ADMIN EDIT PANEL */}
      {isAdmin && (
        <div className="glass-notice-box" style={{ color: '#333', padding: '30px', width: '100%', maxWidth: '900px', boxSizing: 'border-box', margin: '0 auto 40px auto' }}>
          <h3>Edit Administration Profiles</h3>
          
          <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Target Branch</label>
                <select className="glass-input" style={{ margin: 0, width: '100%' }} value={adminBranch} onChange={e => setAdminBranch(e.target.value)}>
                  {BRANCHES.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Select Designation</label>
                <select className="glass-input" style={{ margin: 0, width: '100%' }} value={selectedRole} onChange={e => setSelectedRole(e.target.value)}>
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Full Name</label>
              <input type="text" className="glass-input" style={{ margin: 0, width: '100%' }} value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
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
              <textarea className="glass-input" style={{ margin: 0, width: '100%', minHeight: '80px', padding: '10px', resize: 'vertical' }} value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })} />
            </div>

            <button type="submit" className="login-btn" style={{ margin: 0, alignSelf: 'flex-end', width: 'auto' }} disabled={isSaving}>
              {isSaving ? "Saving..." : `Update ${selectedRole}`}
            </button>
          </form>
        </div>
      )}

      {/* PUBLIC VIEWER TABS */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {BRANCHES.map(branch => (
          <button 
            key={branch.id} 
            onClick={() => setPublicBranch(branch.id)}
            className="liquid-btn"
            style={{ 
              background: publicBranch === branch.id ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)',
              color: publicBranch === branch.id ? '#000' : '#fff',
              border: publicBranch === branch.id ? '2px solid #0056b3' : '1px solid rgba(255,255,255,0.5)',
              padding: '10px 20px',
              fontSize: '1rem'
            }}
          >
            {branch.name}
          </button>
        ))}
      </div>

      {/* PUBLIC VIEW CARDS */}
      <div style={{ width: '100%', maxWidth: '900px', display: 'flex', flexDirection: 'column', gap: '30px', alignItems: 'center' }}>
        {ROLES.map(role => {
          const profile = activePublicProfiles[role];
          if (!profile || !profile.name) return null;

          return (
            <div key={role} className="glass-notice-box" style={{ color: '#333', padding: '35px', display: 'flex', gap: '30px', flexWrap: 'wrap', alignItems: 'center', width: '100%', boxSizing: 'border-box', margin: '0' }}>
              <div style={{ width: '220px', height: '280px', borderRadius: '12px', overflow: 'hidden', background: '#f0f0f0', border: '1px solid #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                {profile.imageUrl ? <img src={profile.imageUrl} alt={role} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ color: '#999' }}>No Photo</span>}
              </div>

              <div style={{ flex: 1, minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ textTransform: 'uppercase', fontSize: '0.85rem', fontWeight: 'bold', color: '#0056b3' }}>{role}</span>
                <h2 style={{ margin: 0, borderBottom: '2px solid #0056b3', paddingBottom: '5px', display: 'inline-block', alignSelf: 'flex-start' }}>{profile.name}</h2>
                
                {profile.message && (
                  <p style={{ fontStyle: 'italic', color: '#555', margin: '10px 0', lineHeight: '1.6', fontSize: '0.95rem', whiteSpace: 'pre-line' }}>
                    "{profile.message}"
                  </p>
                )}

                <div style={{ marginTop: '10px', fontSize: '0.9rem', color: '#444' }}>
                  <div><b>📧 Email:</b> <a href={`mailto:${profile.email}`} style={{ color: '#0056b3', textDecoration: 'none' }}>{profile.email}</a></div>
                  <div><b>📞 Contact:</b> {profile.contact}</div>
                </div>
              </div>
            </div>
          );
        })}
        
        {/* Fallback if branch is completely empty */}
        {Object.keys(activePublicProfiles).length === 0 && (
          <p style={{ fontStyle: 'italic', color: '#ccc' }}>No administration profiles have been uploaded for this branch yet.</p>
        )}
      </div>
    </div>
  );
}

export default Administration;