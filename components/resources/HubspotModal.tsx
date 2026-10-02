'use client';
import { useEffect, useState } from 'react';

export default function HubspotModal({ isOpen, onClose, portalId, formId }) {
  
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true); 

      const script = document.createElement('script');
      script.src = 'https://js.hsforms.net/forms/v2.js';
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => {
        if (window.hbspt) {
          window.hbspt.forms.create({
            portalId: portalId,
            formId: formId,
            target: '#hubspot-form-wrapper',
            // Hubspot Ready
            onFormReady: () => {
              setIsLoading(false);
            },
            css: `
              .hs-form, .hs-form label, .hs-form .hs-richtext {
                color: #ffffff !important;
                font-family: inherit !important;
              }
              .hs-form .hs-input {
                background-color: #222222 !important;
                border: 1px solid #444444 !important;
                color: #ffffff !important;
              }
              .hs-form .hs-button {
                background-color: #E55B32 !important;
                border-color: #E55B32 !important;
                color: #ffffff !important;
                border-radius: 4px !important;
                font-weight: bold !important;
                width: 100% !important;
                transition: background-color 0.3s ease !important;
              }
              .hs-form .hs-button:hover {
                background-color: #c44722 !important;
                border-color: #c44722 !important;
              }
            `
          });
        }
      };

      return () => {
        document.body.removeChild(script);
      }
    }
  }, [isOpen, portalId, formId]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      zIndex: 9999, padding: '20px', backdropFilter: 'blur(6px)'
    }}>
      <div style={{
        background: '#140f0c',
        padding: '40px 30px',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '500px',
        position: 'relative',
        maxHeight: '90vh',
        overflowY: 'auto',
        border: '1px solid #333',
        minHeight: '300px'
      }}>
        <button 
          onClick={onClose}
          style={{
            position: 'absolute', top: '15px', right: '15px',
            background: 'transparent', border: 'none',
            fontSize: '28px', cursor: 'pointer', color: '#ffffff',
            lineHeight: 1, zIndex: 10
          }}
          aria-label="Cerrar modal"
        >
          &times;
        </button>
        
        {/* Preloader */}
        {isLoading && (
          <div style={{ 
            display: 'flex', justifyContent: 'center', alignItems: 'center', 
            height: '100%', position: 'absolute', inset: 0 
          }}>
            <div style={{
              width: '40px', height: '40px',
              border: '4px solid #333', borderTop: '4px solid #E55B32',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            <style>{`
              @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            `}</style>
          </div>
        )}

        {/* Hide OnLoad form */}
        <div 
          id="hubspot-form-wrapper" 
          style={{ 
            opacity: isLoading ? 0 : 1, 
            transition: 'opacity 0.4s ease' 
          }}
        ></div>
      </div>
    </div>
  );
}