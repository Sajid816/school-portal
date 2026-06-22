function Administration() {
  return (
    <div style={{ padding: '40px', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h1>School Administration</h1>
      
      {/* 1. Governing Body Container */}
      <div className="glass-container" style={{ color: '#333', marginBottom: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h2>1. Governing Body</h2>
        <h3 style={{ borderBottom: '1px solid #ccc', paddingBottom: '10px', width: '100%', textAlign: 'center' }}>
          Managing Directors (MDs)
        </h3>
        <ul style={{ padding: 0, listStylePosition: 'inside', fontSize: '1.1rem', textAlign: 'center', lineHeight: '2' }}>
          <li style={{ listStyleType: 'none' }}>Harisur Rahman</li>
          <li style={{ listStyleType: 'none' }}>Md. Abul Khair Talukdar</li>
          <li style={{ listStyleType: 'none' }}>Monoara Begum</li>
        </ul>
      </div>

      {/* 2. Administrative Body Container */}
      <div className="glass-container" style={{ color: '#333', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h2>2. Administrative Body</h2>
        
        {/* Principal Section Centered */}
        <div style={{ textAlign: 'center', marginBottom: '30px', width: '100%' }}>
          <h3 style={{ color: '#d9534f', fontSize: '1.5rem', marginBottom: '5px' }}>Principal</h3>
          <p style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: 0 }}>Monoara Begum</p>
        </div>

        {/* Vice Principals Heading Centered */}
        <h3 style={{ borderBottom: '1px solid #ccc', paddingBottom: '10px', textAlign: 'center', width: '100%' }}>
          Vice Principals
        </h3>
        
        {/* Branch Columns - Balanced Styling */}
        <div style={{ display: 'flex', justifyContent: 'space-around', width: '100%', marginTop: '20px', gap: '20px' }}>
          
          {/* Mukterpara Branch */}
          <div style={{ flex: 1, textAlign: 'center' }}>
            <h4 style={{ color: '#555', fontSize: '1.2rem', marginBottom: '10px', fontWeight: 'normal' }}>
              Mukterpara Branch
            </h4>
            <ul style={{ padding: 0, listStyleType: 'none', fontSize: '1.1rem', fontWeight: 'bold', lineHeight: '1.8' }}>
              <li>Shahina</li>
              <li>Zannat</li>
            </ul>
          </div>
          
          {/* Kurpar Branch */}
          <div style={{ flex: 1, textAlign: 'center' }}>
            <h4 style={{ color: '#555', fontSize: '1.2rem', marginBottom: '10px', fontWeight: 'normal' }}>
              Kurpar Branch
            </h4>
            <ul style={{ padding: 0, listStyleType: 'none', fontSize: '1.1rem', fontWeight: 'bold', lineHeight: '1.8' }}>
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