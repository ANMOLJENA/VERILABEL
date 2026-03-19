import React, { useState } from 'react';
import { Copy, Upload, Check } from 'lucide-react';

export default function ExtractionPanel({
  extractedData,
  isExtracting,
  progress,
  progressStatus
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (extractedData?.extracted_text) {
      try {
        await navigator.clipboard.writeText(extractedData.extracted_text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy text:', err);
      }
    }
  };

  // State A: Extracting
  if (isExtracting) {
    return (
      <div className="vl-card" style={{ padding: '32px' }}>
        <h2 style={{ 
          fontSize: '20px', 
          fontWeight: 700, 
          color: 'var(--vl-blue)', 
          marginBottom: '24px' 
        }}>
          Extracting Data...
        </h2>
        
        {/* Progress bar */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{
            height: '6px',
            borderRadius: '999px',
            background: 'var(--vl-border)',
            overflow: 'hidden',
            position: 'relative'
          }}>
            <div style={{
              height: '100%',
              width: `${progress}%`,
              background: 'var(--vl-gradient)',
              borderRadius: '999px',
              transition: 'width 0.3s ease',
              boxShadow: '0 0 8px rgba(0,200,150,0.4)'
            }} />
          </div>
        </div>
        
        <div style={{ fontSize: '14px', color: 'var(--vl-text)' }}>
          {progress}% complete
        </div>
        <div style={{ fontSize: '12px', color: 'var(--vl-muted)', marginTop: '4px' }}>
          {progressStatus}
        </div>

        {/* Animated shimmer lines */}
        <div style={{ marginTop: '24px' }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              style={{
                height: '12px',
                borderRadius: '6px',
                background: 'linear-gradient(90deg, var(--vl-border) 25%, rgba(0,200,150,0.1) 50%, var(--vl-border) 75%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s infinite',
                marginBottom: '8px',
                width: `${Math.random() * 40 + 60}%`
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  // State B: Extracted
  if (extractedData) {
    return (
      <div className="vl-card" style={{ padding: '32px' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '16px' 
        }}>
          <h2 style={{ 
            fontSize: '20px', 
            fontWeight: 700, 
            color: 'var(--vl-blue)', 
            margin: 0 
          }}>
            Extracted Text
          </h2>
          <button
            onClick={handleCopy}
            className="vl-btn-ghost"
            style={{ padding: '6px 12px', fontSize: '12px' }}
          >
            {copied ? (
              <>
                <Check size={14} />
                Copied!
              </>
            ) : (
              <>
                <Copy size={14} />
                Copy Text
              </>
            )}
          </button>
        </div>

        {/* Metadata */}
        <div style={{
          fontSize: '11px',
          color: 'var(--vl-muted)',
          fontFamily: 'monospace',
          marginBottom: '16px',
          padding: '8px 12px',
          background: 'var(--vl-bg)',
          borderRadius: '6px'
        }}>
          Model: ocr.space • Time: 2.3s • Engine: ocr.space
        </div>

        {/* Text area */}
        <div style={{
          maxHeight: '280px',
          overflowY: 'auto',
          background: '#f8fafc',
          borderRadius: '8px',
          padding: '16px',
          fontFamily: 'monospace',
          fontSize: '13px',
          lineHeight: '1.6',
          color: 'var(--vl-text)',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word'
        }}>
          {extractedData.extracted_text}
        </div>
      </div>
    );
  }

  // State C: Empty
  return (
    <div className="vl-card" style={{ padding: '32px' }}>
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        minHeight: '200px',
        textAlign: 'center'
      }}>
        <Upload size={48} style={{ color: 'var(--vl-muted)', marginBottom: '16px' }} />
        <div style={{ 
          fontSize: '16px', 
          fontWeight: 600, 
          color: 'var(--vl-text)',
          marginBottom: '8px'
        }}>
          Extracted text will appear here
        </div>
        <div style={{ 
          fontSize: '14px', 
          color: 'var(--vl-muted)' 
        }}>
          Upload a file and click Extract to begin
        </div>
      </div>
    </div>
  );
}
