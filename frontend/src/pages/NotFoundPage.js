import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFoundPage = () => {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f4f8' }}>
      <div style={{ textAlign: 'center', padding: 40 }}>
        <div style={{ fontSize: 80, marginBottom: 16 }}>🏥</div>
        <h1 style={{ fontSize: 72, fontWeight: 900, color: '#1a73e8', lineHeight: 1 }}>404</h1>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1a202c', margin: '12px 0 8px' }}>Page Not Found</h2>
        <p style={{ color: '#718096', marginBottom: 28 }}>The page you're looking for doesn't exist in the CareTrack MRMS.</p>
        <button className="btn-ct-primary" style={{ padding: '10px 28px', fontSize: 14 }} onClick={() => navigate('/dashboard')}>
          ← Return to Dashboard
        </button>
      </div>
    </div>
  );
};

export default NotFoundPage;
