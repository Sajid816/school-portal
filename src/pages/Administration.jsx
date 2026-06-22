function Administration() {
  return (
    <div style={{ padding: '40px', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h1>School Administration</h1>
      
      <div className="glass-container" style={{ color: '#333', marginBottom: '30px' }}>
        <h2>1. Governing Body</h2>
        <h3 style={{ borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>Managing Directors (MDs)</h3>
        <ul style={{ textAlign: 'left', fontSize: '1.1rem', listStyleType: 'circle' }}>
          <li>Harisur Rahman</li>
          <li>Md. Abul Khair Talukdar</li>
          <li>Monoara Begum</li>
        </ul>
      </div>

      <div className="glass-container" style={{ color: '#333' }}>
        <h2>2. Administrative Body</h2>
        
        <div style={{ textAlign: 'left', marginBottom: '20px' }}>
          <h3 style={{ color: '#d9534f' }}>Principal</h3>
          <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Monoara Begum</p>
        </div>

        <h3 style={{ borderBottom: '1px solid #ccc', paddingBottom: '10px', textAlign: 'left' }}>Vice Principals</h3>
        <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '20px' }}>
          <div style={{ textAlign: 'left' }}>
            <h4 style={{ color: '#0056b3' }}>Mukterpara Branch</h4>
            <ul>
              <li>Shahina</li>
              <li>Zannat</li>
            </ul>
          </div>
          <div style={{ textAlign: 'left' }}>
            <h4 style={{ color: '#0056b3' }}>Kurpar Branch</h4>
            <ul>
              <li>Nazma</li>
              <li>Tamanna</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Administration;