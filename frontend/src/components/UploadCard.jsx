import React from 'react';
import { Upload, FileText, Image } from 'lucide-react';

export default function UploadCard({
  selectedFile,
  dragOver,
  isExtracting,
  fileInputRef,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileInputChange,
  onExtract
}) {
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="vl-card" style={{ padding: '32px' }}>
      {/* Title */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ 
          fontSize: '20px', 
          fontWeight: 700, 
          color: 'var(--vl-blue)', 
          margin: '0 0 8px 0' 
        }}>
          Upload Medical Label
        </h2>
        <p style={{ 
          fontSize: '14px', 
          color: 'var(--vl-muted)', 
          margin: 0 
        }}>
          Drag & drop or click to browse your file
        </p>
      </div>

      {/* Upload type buttons */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <button 
          className="vl-btn-ghost"
          onClick={() => fileInputRef.current?.click()}
          style={{ flex: 1, justifyContent: 'center' }}
        >
          <FileText size={16} />
          Upload PDF
        </button>
        <button 
          className="vl-btn-ghost"
          onClick={() => fileInputRef.current?.click()}
          style={{ flex: 1, justifyContent: 'center' }}
        >
          <Image size={16} />
          Upload Image
        </button>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: dragOver 
            ? '1.5px dashed var(--vl-green)' 
            : '1.5px dashed var(--vl-border)',
          borderRadius: '12px',
          height: '180px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          background: dragOver 
            ? 'rgba(0,200,150,0.04)' 
            : 'transparent',
        }}
      >
        {selectedFile ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'var(--vl-success-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px',
            }}>
              <FileText size={24} style={{ color: 'var(--vl-success)' }} />
            </div>
            <div style={{ 
              fontSize: '14px', 
              fontWeight: 600, 
              color: 'var(--vl-text)',
              marginBottom: '4px'
            }}>
              {selectedFile.name}
            </div>
            <div style={{ 
              fontSize: '12px', 
              color: 'var(--vl-muted)' 
            }}>
              {formatFileSize(selectedFile.size)}
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <Upload size={48} style={{ color: 'var(--vl-muted)', marginBottom: '12px' }} />
            <div style={{ 
              fontSize: '14px', 
              color: 'var(--vl-text)', 
              fontWeight: 500 
            }}>
              Drop your file here
            </div>
          </div>
        )}
      </div>

      {/* Extract button */}
      {selectedFile && (
        <button
          className="vl-btn-primary"
          onClick={onExtract}
          disabled={isExtracting}
          style={{ 
            width: '100%', 
            marginTop: '20px',
            justifyContent: 'center',
            padding: '13px'
          }}
        >
          {isExtracting ? (
            <>
              <div style={{
                width: '16px',
                height: '16px',
                border: '2px solid rgba(255,255,255,0.3)',
                borderTop: '2px solid white',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
              Extracting...
            </>
          ) : (
            <>
              Extract Text →
            </>
          )}
        </button>
      )}
    </div>
  );
}
