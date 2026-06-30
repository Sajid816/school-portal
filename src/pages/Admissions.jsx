import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

function Admissions() {
  const [uniforms, setUniforms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUniforms = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "uniforms"));
        setUniforms(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error("Error fetching uniforms:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUniforms();
  }, []);

  const maleUniforms = uniforms.filter(u => u.gender === 'male');
  const femaleUniforms = uniforms.filter(u => u.gender === 'female');

  return (
    <div style={{ padding: '40px 20px', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', boxSizing: 'border-box' }}>
      <h1>Admissions</h1>
      <p style={{ marginBottom: '30px', color: '#ddd', textAlign: 'center' }}>Application guidelines and enrollment information</p>

      <div className="glass-notice-box" style={{ color: '#333', padding: '30px', width: '100%', maxWidth: '900px', marginBottom: '40px' }}>
        <h2 style={{ borderBottom: '2px solid #0056b3', paddingBottom: '8px', margin: '0 0 20px 0', color: '#111' }}>
          Official School Uniforms
        </h2>
        
        {loading ? (
          <p>Loading uniform data...</p>
        ) : uniforms.length === 0 ? (
          <p style={{ fontStyle: 'italic', color: '#777' }}>Uniform details will be updated shortly.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
            
            {/* Male Uniforms Column */}
            <div>
              <h3 style={{ color: '#0056b3', marginBottom: '15px' }}>Male Uniform</h3>
              {maleUniforms.length === 0 ? (
                <p style={{ color: '#777', fontStyle: 'italic', fontSize: '0.9rem' }}>No images available.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {maleUniforms.map(img => (
                    <div key={img.id} style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid #ccc', background: '#fff' }}>
                      <img src={img.url} alt={img.title} style={{ width: '100%', height: 'auto', display: 'block' }} />
                      {img.title && <p style={{ padding: '10px', margin: 0, textAlign: 'center', fontWeight: 'bold', fontSize: '0.9rem' }}>{img.title}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Female Uniforms Column */}
            <div>
              <h3 style={{ color: '#0056b3', marginBottom: '15px' }}>Female Uniform</h3>
              {femaleUniforms.length === 0 ? (
                <p style={{ color: '#777', fontStyle: 'italic', fontSize: '0.9rem' }}>No images available.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {femaleUniforms.map(img => (
                    <div key={img.id} style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid #ccc', background: '#fff' }}>
                      <img src={img.url} alt={img.title} style={{ width: '100%', height: 'auto', display: 'block' }} />
                      {img.title && <p style={{ padding: '10px', margin: 0, textAlign: 'center', fontWeight: 'bold', fontSize: '0.9rem' }}>{img.title}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}
      </div>

    </div>
  );
}

export default Admissions;