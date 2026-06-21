import { useState } from 'react';
// Combine all your firebase imports into ONE line:
import { db, auth, secondaryAuth } from "../firebase";
// Combine all your firebase/auth imports into ONE line:
import { createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
// Combine all your firebase/firestore imports into ONE line:
import { doc, setDoc } from 'firebase/firestore';
  // ... rest of your code ...


function Admin() {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    const email = e.target.email.value.trim();
    const name = e.target.name.value.trim();
    const role = e.target.role.value;
    const identifier = e.target.identifier.value.trim(); // Roll or Employee ID
    
    // Generate a random 16-character temporary password
    const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);

    try {
      // 1. Create the user on the secondary auth instance (Admin stays logged in)
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, tempPassword);
      const newUid = userCredential.user.uid;

      // 2. Prepare the database profile
      const userProfile = {
        Email: email,
        Name: name,
        role: role,
        [role === 'student' ? 'roll' : 'employeeId']: identifier,
        status: "active"
      };

      // 3. Save the profile to Firestore
      await setDoc(doc(db, "users", newUid), userProfile);

      // 4. Send the password configuration email
      await sendPasswordResetEmail(auth, email);

      setMessage(`✅ Account created. Setup email sent to ${email}.`);
      e.target.reset();

    } catch (error) {
      console.error("Creation Error:", error);
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-container">
      <h1>Admin User Creation</h1>
      
      <form onSubmit={handleCreateUser} style={{ textAlign: 'left' }}>
        <label>Account Role</label>
        <select name="role" className="glass-input" required>
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
        </select>

        <label>Full Name</label>
        <input name="name" type="text" className="glass-input" required />

        <label>Email Address</label>
        <input name="email" type="email" className="glass-input" required />

        <label>Roll Number / Employee ID</label>
        <input name="identifier" type="text" className="glass-input" required />

        <button type="submit" className="login-btn" disabled={isLoading}>
          {isLoading ? "Creating User..." : "Create & Send Email"}
        </button>
      </form>

      {message && <p style={{ fontWeight: 'bold', marginTop: '15px' }}>{message}</p>}
    </div>
  );
}

export default Admin;