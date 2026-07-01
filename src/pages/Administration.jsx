import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

function Administration() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState({ branches: {}, governingBody: {} });
  const [isSaving, setIsSaving] = useState(false);

  // Structural Taxonomies
  const BRANCHES = [
    { id: 'kurpar', name: 'হলি চাইল্ড একাডেমি, কুরপাড়' },
    { id: 'moktarpara', name: 'হলি চাইল্ড একাডেমি, মোক্তারপাড়া' }
  ];
  const PRINCIPAL_ROLES = ['Principal', 'Vice Principal', 'Headmaster', 'Assistant Headmaster'];
  const GOVERNING_ROLES = ['Chairman', 'Managing Director', 'Director'];

  // Admin Uploader States
  const [editMode, setEditMode] = useState('principals'); // 'principals' or 'governing'
  const [adminBranch, setAdminBranch] = useState('kurpar');
  const [selectedRole, setSelectedRole] = useState('Principal');
  const [formData, setFormData] = useState({
    name: '', email: '', contact: '', imageUrl: '', message: ''
  });

  // Public Viewer State
  const [publicViewMode, setPublicViewMode] = useState('governing'); // 'governing' or 'principals'
  const [publicBranch, setPublicBranch] = useState('kurpar');

  useEffect(() => {
    fetchAdministrationData();
    if (localStorage.getItem('role') === 'admin') {
      setIsAdmin(true);
    }
  }, []);

  // Sync admin form data
  useEffect(() => {
    if (editMode === 'principals') {
      if (profiles.branches[adminBranch] && profiles.branches[adminBranch][selectedRole]) {
        setFormData(profiles.branches[adminBranch][selectedRole]);
      } else {
        setFormData({ name: '', email: '', contact: '', imageUrl: '', message: '' });
      }
    } else {
      if (profiles.governingBody[selectedRole]) {
        setFormData(profiles.governingBody[selectedRole]);
      } else {
        setFormData({ name: '', email: '', contact: '', imageUrl: '', message: '' });
      }
    }
  }, [adminBranch, selectedRole, profiles, editMode]);

  // Adjust default role when toggling edit mode
  useEffect(() => {
    if (editMode === 'principals') setSelectedRole(PRINCIPAL_ROLES[0]);
    else setSelectedRole(GOVERNING_ROLES[0]);
  }, [editMode]);

  const fetchAdministrationData = async () => {
    setLoading(true);
    try {
      const docSnap = await getDoc(doc(db, "settings", "administrationData"));
      if (docSnap.exists()) {
        const data = docSnap.data();
        setProfiles({
          branches: data.branches || {},
          governingBody: data.governingBody || {}
        });
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

    let updatedProfiles = { ...profiles };

    if (editMode === 'principals') {
      updatedProfiles.branches = {
        ...profiles.branches,
        [adminBranch]: {
          ...(profiles.branches[adminBranch] || {}),
          [selectedRole]: {
            name: formData.name.trim(),
            email: formData.email.trim(),
            contact: formData.contact.trim(),
            imageUrl: formData.imageUrl.trim(),
            message: (formData.message || '').trim()
          }
        }
      };
    } else {
      updatedProfiles.governingBody = {
        ...profiles.governingBody,
        [selectedRole]: {
          name: formData.name.trim(),
          email: formData.email.trim(),
          contact: formData.contact.trim(),
          imageUrl: formData.imageUrl.trim(),
          message: (formData.message || '').trim()
        }
      };
    }

    try {
      await setDoc(doc(db, "settings", "administrationData"), updatedProfiles);
      setProfiles(updatedProfiles);
      alert(`Profile updated successfully!`);
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

  const activePublicProfiles = publicViewMode === 'principals' 
    ? (profiles.branches[publicBranch] || {}) 
    : profiles.governingBody;

  const currentDisplayRoles = publicViewMode === 'principals' ? PRINCIPAL_ROLES : GOVERNING_ROLES;

  return (
    <div style={{ padding: '40px 20px', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', boxSizing: 'border-box' }}>
      <h1>School Administration</h1>
      <p style={{ marginBottom: '30px', color: '#ddd', textAlign: 'center' }}>Meet the leadership team steering our institution</p>

      {/* ADMIN EDIT PANEL */}
      {isAdmin && (
        <div className="glass-notice-box" style={{ color: '#333', padding: '30px', width: '100%', maxWidth: '900px', boxSizing: 'border-box', margin: '0 auto 40px auto' }}>
          <h3>Edit Administration Profiles</h3>
          
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <button onClick={() => setEditMode('governing')} className="liquid-btn" style={{ background: editMode === 'governing' ? '#0056b3' : '#ddd', color: editMode === 'governing' ? '#fff' : '#333' }}>Governing Body</button>
            <button onClick={() => setEditMode('principals')} className="liquid-btn" style={{ background: editMode === 'principals' ? '#0056b3' : '#ddd', color: editMode === 'principals' ? '#fff' : '#333' }}>Principals & Staff</button>
          </div>

          <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              {editMode === 'principals' && (
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Target Branch</label>
                  <select className="glass-input" style={{ margin: 0, width: '100%' }} value={adminBranch} onChange={e => setAdminBranch(e.target.value)}>
                    {BRANCHES.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
              )}
              <div style={{ flex: 1, minWidth: '200px' }}>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Select Designation</label>
                <select className="glass-input" style={{ margin: 0, width: '100%' }} value={selectedRole} onChange={e => setSelectedRole(e.target.value)}>
                  {(editMode === 'principals' ? PRINCIPAL_ROLES : GOVERNING_ROLES).map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Full Name</label>
              <input type="text" className="glass-input" style={{ margin: 0, width: '100%' }} value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
            </div>

            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Email Address (Optional)</label>
                <input type="email" className="glass-input" style={{ margin: 0, width: '100%' }} value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
              </div>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Contact Number (Optional)</label>
                <input type="text" className="glass-input" style={{ margin: 0, width: '100%' }} value={formData.contact} onChange={e => setFormData({ ...formData, contact: e.target.value })} />
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
              {isSaving ? "Saving..." : `Update Profile`}
            </button>
          </form>
        </div>
      )}

      {/* PUBLIC VIEWER TOGGLES */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button 
          onClick={() => setPublicViewMode('governing')}
          className="liquid-btn"
          style={{ background: publicViewMode === 'governing' ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)', color: publicViewMode === 'governing' ? '#000' : '#fff', padding: '12px 25px', fontSize: '1.1rem', fontWeight: 'bold' }}
        >
          Governing Body
        </button>
        <button 
          onClick={() => setPublicViewMode('principals')}
          className="liquid-btn"
          style={{ background: publicViewMode === 'principals' ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)', color: publicViewMode === 'principals' ? '#000' : '#fff', padding: '12px 25px', fontSize: '1.1rem', fontWeight: 'bold' }}
        >
          Principals & VPs
        </button>
      </div>

      {publicViewMode === 'principals' && (
        <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {BRANCHES.map(branch => (
            <button 
              key={branch.id} 
              onClick={() => setPublicBranch(branch.id)}
              className="liquid-btn"
              style={{ background: publicBranch === branch.id ? '#0056b3' : 'rgba(255,255,255,0.2)', color: '#fff', border: publicBranch === branch.id ? '2px solid #fff' : '1px solid transparent', padding: '8px 16px', fontSize: '0.9rem' }}
            >
              {branch.name}
            </button>
          ))}
        </div>
      )}

      {/* PUBLIC VIEW CARDS */}
      <div style={{ width: '100%', maxWidth: '900px', display: 'flex', flexDirection: 'column', gap: '30px', alignItems: 'center' }}>
        {currentDisplayRoles.map(role => {
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
                  {profile.email && <div><b>📧 Email:</b> <a href={`mailto:${profile.email}`} style={{ color: '#0056b3', textDecoration: 'none' }}>{profile.email}</a></div>}
                  {profile.contact && <div><b>📞 Contact:</b> {profile.contact}</div>}
                </div>
              </div>
            </div>
          );
        })}
        
        {Object.keys(activePublicProfiles).length === 0 && (
          <p style={{ fontStyle: 'italic', color: '#ccc', textAlign: 'center' }}>No administration profiles have been uploaded for this section yet.</p>
        )}
      </div>
    </div>
  );
}

export default Administration;