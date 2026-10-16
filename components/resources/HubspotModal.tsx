'use client';
import { useEffect, useState } from 'react';

declare global {
  interface Window {
    hbspt: any;
  }
}

interface HubspotModalProps {
  isOpen: boolean;
  onClose: () => void;
  portalId: string;
  formId: string;
}

export default function HubspotModal({ isOpen, onClose, portalId, formId }:HubspotModalProps) {
  
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
            target: '#hubspot-form-target',
            cssClass: 'hs-contact-form',
            css: `
              .hs-form-wrapper .hs-form fieldset {
                max-width: 100% !important;
              }

              .hs-form-wrapper .hs-form .hs-form-field label {
                color: #ffffff;
                font-size: 0.75rem;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                margin-bottom: 0.375rem;
                display: block;
              }

              .hs-form-wrapper .hs-form input[type="text"],
              .hs-form-wrapper .hs-form input[type="email"],
              .hs-form-wrapper .hs-form input[type="tel"],
              .hs-form-wrapper .hs-form textarea {
                width: 100%;
                background: #ffffff;
                border: 1px solid #d1d5db;
                border-radius: 0;
                color: #111111;
                padding: 0.625rem 0.75rem;
                font-size: 0.875rem;
                outline: none;
                transition: border-color 0.2s;
              }

              .hs-form-wrapper .hs-form input:focus,
              .hs-form-wrapper .hs-form textarea:focus {
                border-color: #4760FF;
              }

              .hs-form-wrapper .hs-form textarea {
                min-height: 100px;
                resize: vertical;
              }

              .hs-form-wrapper .hs-form .hs-button {
                background: #111111;
                color: #ffffff;
                border: 2px solid #4760FF;
                padding: 0.625rem 1.5rem;
                font-size: 0.875rem;
                font-weight: 600;
                cursor: pointer;
                border-radius: 0;
                transition: background 0.2s, border-color 0.2s;
                width: 100%;
                margin-top: 0.5rem;
              }

              .hs-form-wrapper .hs-form .hs-button:hover {
                border-image: linear-gradient(90deg, #FACC22, #FB5607, #4760FF, #0DCCFF) 1;
              }

              .hs-form-wrapper .hs-error-msgs label {
                color: #FB5607 !important;
                font-size: 0.75rem !important;
                text-transform: none !important;
                letter-spacing: 0 !important;
              }

              .hs-form-wrapper .submitted-message {
                  color: white;
              }
            `,
            // Hubspot Ready
            onFormReady: () => {
              setIsLoading(false);
            },
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
          id="hubspot-form-target"
          className="hs-form-wrapper"
          style={{ 
            opacity: isLoading ? 0 : 1, 
            transition: 'opacity 0.4s ease' 
          }}
        ></div>
      </div>
    </div>
  );
}