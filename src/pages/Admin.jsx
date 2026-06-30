import { useState, useEffect } from 'react';
import { db, secondaryAuth } from '../firebase';
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, collection, getDocs, deleteDoc, setDoc, getDoc, addDoc } from 'firebase/firestore';

function Admin() {
  const [galleryImages, setGalleryImages] = useState([]);
  const [newsImages, setNewsImages] = useState([]);
  const [uniformImages, setUniformImages] = useState([]);
  const [currentTicker, setCurrentTicker] = useState('');
  const [isUpdatingTicker, setIsUpdatingTicker] = useState(false);
  
  const [sectionsMap, setSectionsMap] = useState({});
  const [sectionsLoading, setSectionsLoading] = useState(true);
  const [configSelectedClass, setConfigSelectedClass] = useState('Playgroup');

  const [imageUrl, setImageUrl] = useState('');
  const [contentTitle, setContentTitle] = useState('');
  
  const [teacherEmail, setTeacherEmail] = useState('');
  const [teacherPhone, setTeacherPhone] = useState('');
  const [uniformGender, setUniformGender] = useState('male');

  const [destination, setDestination] = useState('news');
  const [targetBranch, setTargetBranch] = useState('kurpar');
  const [targetClass, setTargetClass] = useState('Playgroup');
  const [targetSection, setTargetSection] = useState('');
  const [isUploadingContent, setIsUploadingContent] = useState(false);

  const [staffName, setStaffName] = useState('');
  const [staffEmailReg, setStaffEmailReg] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [staffRole, setStaffRole] = useState('teacher');
  const [isCreatingStaff, setIsCreatingStaff] = useState(false);

  const BRANCHES = [
    { id: 'kurpar', name: 'হলি চাইল্ড একাডেমি, কুরপাড়' },
    { id: 'moktarpara', name: 'হলি চাইল্ড একাডেমি, মোক্তারপাড়া' }
  ];

  const classes = ["Playgroup", "Nursery", "KG", "Class 1", "Class 2", "Class 3", "Class 4", "Class 5"];
  const AVAILABLE_SECTIONS = ["A", "B", "C", "D", "E"];

  useEffect(() => { 
    fetchCurrentTicker();
    fetchGallery();
    fetchNews();
    fetchUniforms();
    fetchSectionsConfig();
  }, []);

  useEffect(() => {
    const activeSections = sectionsMap[targetClass] || [];
    setTargetSection(activeSections.length > 0 ? activeSections[0] : '');
  }, [targetClass, sectionsMap]);

  const fetchCurrentTicker = async () => {
    try {
      const docSnap = await getDoc(doc(db, "settings", "ticker"));
      if (docSnap.exists()) setCurrentTicker(docSnap.data().message || '');
    } catch (err) { console.error(err); }
  };

  const fetchGallery = async () => {
    const querySnapshot = await getDocs(collection(db, "gallery"));
    setGalleryImages(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const fetchNews = async () => {
    const querySnapshot = await getDocs(collection(db, "news"));
    setNewsImages(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const fetchUniforms = async () => {
    const querySnapshot = await getDocs(collection(db, "uniforms"));
    setUniformImages(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const fetchSectionsConfig = async () => {
    try {
      const docSnap = await getDoc(doc(db, "settings", "classSections"));
      if (docSnap.exists()) setSectionsMap(docSnap.data().mapping || {});
    } catch (err) { console.error(err); } 
    finally { setSectionsLoading(false); }
  };

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    setIsCreatingStaff(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, staffEmailReg.trim(), staffPassword);
      await setDoc(doc(db, "users", userCredential.user.uid), {
        fullName: staffName.trim(),
        email: staffEmailReg.trim(),
        role: staffRole,
        createdAt: new Date().toISOString()
      });
      await signOut(secondaryAuth);
      alert(`Created ${staffRole} account for ${staffName}!`);
      setStaffName(''); setStaffEmailReg(''); setStaffPassword('');
    } catch (error) { alert(error.message); } finally { setIsCreatingStaff(false); }
  };

  const handleContentUpload = async (e) => {
    e.preventDefault();
    if (!imageUrl) return alert("Provide image URL.");
    if (destination === 'teachers' && !targetSection) return alert("Activate sections first.");

    setIsUploadingContent(true);
    try {
      if (destination === 'gallery') await addDoc(collection(db, "gallery"), { url: imageUrl, caption: contentTitle, uploadedAt: new Date().toISOString() });
      else if (destination === 'news') await addDoc(collection(db, "news"), { url: imageUrl, title: contentTitle, uploadedAt: new Date().toISOString() });
      else if (destination === 'uniforms') await addDoc(collection(db, "uniforms"), { url: imageUrl, title: contentTitle, gender: uniformGender, uploadedAt: new Date().toISOString() });
      else if (destination === 'teachers') {
        const teacherDocId = `${targetBranch}_${targetClass}_${targetSection}`;
        await setDoc(doc(db, "teachers", teacherDocId), { 
          teacherName: contentTitle, photoUrl: imageUrl, branch: targetBranch, class: targetClass, section: targetSection, 
          email: teacherEmail.trim(), phone: teacherPhone.trim(), lastUpdated: new Date().toISOString() 
        });
      }
      alert(`Saved to ${destination}!`);
      setImageUrl(''); setContentTitle(''); setTeacherEmail(''); setTeacherPhone('');
      fetchGallery(); fetchNews(); fetchUniforms();
    } catch (error) { alert("Failed to link data."); } finally { setIsUploadingContent(false); }
  };

  const handleDeleteImage = async (id, collectionName) => {
    if (window.confirm("Delete permanently?")) {
      await deleteDoc(doc(db, collectionName, id));
      fetchGallery(); fetchNews(); fetchUniforms();
    }
  };

  return (
    <div style={{ padding: '40px 20px', width: '100%', boxSizing: 'border-box' }}>
      <h1 style={{ textAlign: 'center' }}>Admin Control Workspace</h1>
      
      {/* 1. Staff Generator */}
      <div className="glass-notice-box" style={{ maxWidth: '900px', margin: '0 auto 20px auto', padding: '30px' }}>
        <h3>Create Staff Accounts</h3>
        <form onSubmit={handleCreateStaff} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {/* ... Keep your existing Staff Form fields here ... */}
            <button type="submit" className="login-btn" disabled={isCreatingStaff}>Create Account</button>
        </form>
      </div>

      {/* 2. Content Manager */}
      <div className="glass-notice-box" style={{ maxWidth: '900px', margin: '0 auto', padding: '30px' }}>
        <h3>Website Content Manager</h3>
        {/* ... Keep your existing Content Manager Form fields here ... */}
      </div>
    </div>
  );
}

export default Admin;