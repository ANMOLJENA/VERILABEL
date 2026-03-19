import React, { useState, useEffect, useRef } from 'react';
import { uploadFile, validateText } from './services/api.service';
import UploadCard from './components/UploadCard';
import ExtractionPanel from './components/ExtractionPanel';
import ValidationPanel from './components/ValidationPanel';
import LoginModal from './components/LoginModal';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000';

/**
 * @typedef {Object} ExtractedData
 * @property {string} extracted_text - The OCR extracted text
 * @property {string} processing_time - Processing time in seconds
 * @property {string} model_name - OCR model used
 * @property {number} [pages_processed] - Number of pages processed (PDF only)
 */

/**
 * @typedef {Object} ValidationResult
 * @property {string} drug_name - Extracted drug name
 * @property {string} strength - Drug strength
 * @property {string} batch_number - Batch number
 * @property {string} expiry_date - Expiry date
 * @property {string} manufacturer - Manufacturer name
 * @property {string} risk_level - Risk level (LOW/MEDIUM/HIGH)
 * @property {number} confidence_score - Confidence score (0-100)
 * @property {string[]} missing_fields - List of missing fields
 */

function HomePage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [extractedData, setExtractedData] = useState(null);
  const [validationResult, setValidationResult] = useState(null);
  const [validationError, setValidationError] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressStatus, setProgressStatus] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isApiOnline, setIsApiOnline] = useState(false);
  const [lastExtractionTime, setLastExtractionTime] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  
  const fileInputRef = useRef(null);
  const progressTimerRef = useRef(null);
  const healthTimerRef = useRef(null);

  // Progress estimation config
  const PROGRESS_ESTIMATES = {
    image: 12, // seconds
    pdf: 30 // seconds per page
  };

  // Initialize theme and health check
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    setIsDarkMode(savedTheme !== 'light');
    
    // Start health check polling
    checkApiHealth();
    healthTimerRef.current = setInterval(checkApiHealth, 10000);
    
    return () => {
      if (healthTimerRef.current) {
        clearInterval(healthTimerRef.current);
      }
    };
  }, []);

  // Check API health
  const checkApiHealth = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      setIsApiOnline(response.ok);
    } catch {
      setIsApiOnline(false);
    }
  };

  // Toggle theme
  const toggleTheme = () => {
    const newTheme = isDarkMode ? 'light' : 'dark';
    setIsDarkMode(!isDarkMode);
    localStorage.setItem('theme', newTheme);
    
    if (newTheme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  };

  // Handle file selection
  const handleFileSelect = (file) => {
    setSelectedFile(file);
    setExtractedData(null);
    setValidationResult(null);
    setValidationError('');
    setIsValidating(false);
    setProgress(0);
    setProgressStatus('');
  };

  // Handle file input change
  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file && isValidFileType(file)) {
      handleFileSelect(file);
    }
  };

  // Validate file type
  const isValidFileType = (file) => {
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/bmp', 'image/tiff', 'application/pdf'];
    return validTypes.includes(file.type);
  };

  // Start progress tracking
  const startProgress = (file) => {
    const isPdf = file.type === 'application/pdf';
    const estimatedTime = isPdf ? PROGRESS_ESTIMATES.pdf : PROGRESS_ESTIMATES.image;
    
    setProgressStatus('Extracting...');
    
    let elapsed = 0;
    const interval = 100; // Update every 100ms
    
    progressTimerRef.current = setInterval(() => {
      elapsed += interval;
      const progress = Math.min((elapsed / (estimatedTime * 1000)) * 100, 95);
      setProgress(progress);
      
      const remaining = Math.max(estimatedTime - Math.floor(elapsed / 1000), 0);
      
      // Hold at 95% with pulsing animation if taking longer than estimated
      if (progress >= 95) {
        setProgressStatus('Extracting... ~' + remaining + 's remaining');
        // Add pulsing class to progress bar
        const progressBar = document.querySelector('.progress-fill');
        if (progressBar) {
          progressBar.classList.add('pulsing');
        }
      }
    }, interval);
  };

  // Stop progress tracking
  const stopProgress = (success) => {
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
    }
    
    setProgress(100);
    
    if (success) {
      setProgressStatus('✓ Extraction complete');
      setLastExtractionTime(new Date().toLocaleTimeString());
    } else {
      setProgressStatus('Extraction failed');
      // Turn progress bar red
      const progressBar = document.querySelector('.progress-fill');
      if (progressBar) {
        progressBar.style.backgroundColor = 'var(--accent-red)';
      }
    }
    
    // Hide progress bar after 1.5 seconds
    setTimeout(() => {
      setProgress(0);
      setProgressStatus('');
      const progressBar = document.querySelector('.progress-fill');
      if (progressBar) {
        progressBar.classList.remove('pulsing');
        progressBar.style.backgroundColor = '';
      }
    }, 1500);
  };

  // Handle file extraction
  const handleExtract = async () => {
    if (!selectedFile) return;
    
    setIsExtracting(true);
    startProgress(selectedFile);
    
    try {
      const response = await uploadFile(selectedFile);
      
      if (response.success === false) {
        throw new Error(response.error || 'Extraction failed');
      }
      
      setExtractedData(response.data);
      stopProgress(true);
      
      // Automatically run validation after successful extraction
      if (response.data?.extracted_text) {
        setIsValidating(true);
        setValidationError('');
        try {
          const validationResponse = await validateText(response.data.extracted_text);
          if (validationResponse.success !== false) {
            setValidationResult(validationResponse.data || validationResponse);
          } else {
            setValidationError(validationResponse.error || 'Validation failed');
          }
        } catch (validationError) {
          console.error('Validation failed:', validationError);
          setValidationError(validationError.message || 'Validation failed');
        } finally {
          setIsValidating(false);
        }
      }
    } catch (error) {
      console.error('Extraction error:', error);
      stopProgress(false);
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <>
      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />

      <div style={{ display: 'flex', minHeight: '100vh',
        background: 'var(--vl-bg)', color: 'var(--vl-text)' }}>

        {/* Main content - full width */}
        <div style={{ flex: 1, display: 'flex',
          flexDirection: 'column' }}>

          {/* Top Header Bar */}
          <header style={{
            height: '80px',
            background: 'var(--vl-surface)',
            borderBottom: '1px solid var(--vl-border)',
            boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingLeft: '32px',
            paddingRight: '32px',
            gap: '12px',
            position: 'sticky',
            top: 0,
            zIndex: 50,
          }}>
            {/* Logo on the left */}
            <img
              src="/logo.png"
              alt="VeriLabel"
              style={{ height: '56px' }}
            />
            
            {/* Buttons on the right */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="vl-btn-ghost" style={{ color: 'var(--vl-blue)', borderColor: 'var(--vl-border)' }}>My Records</button>
              <button
                className="vl-btn-ghost"
                onClick={() => setShowLogin(true)}
                style={{ color: 'var(--vl-blue)', borderColor: 'var(--vl-border)' }}
              >
                Login
              </button>
            </div>
          </header>

          {/* Page content */}
          <main style={{ padding: '32px', flex: 1 }}>

            {/* Mission Statement Box */}
            <div style={{
              background: 'var(--vl-gradient)',
              borderRadius: '16px',
              padding: '32px',
              marginBottom: '32px',
              boxShadow: '0 8px 32px rgba(30,58,95,0.15)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Background pattern */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(135deg, rgba(59,130,246,0.05) 0%, rgba(0,200,150,0.05) 100%)',
                pointerEvents: 'none'
              }} />
              
              <div style={{ position: 'relative', zIndex: 1 }}>
                <h2 style={{
                  fontSize: '24px',
                  fontWeight: 700,
                  color: 'white',
                  margin: '0 0 16px 0',
                  lineHeight: '1.3',
                  textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                  Every year, counterfeit and mislabeled medicines claim over 500,000 lives globally.
                </h2>
                
                <p style={{
                  fontSize: '16px',
                  fontWeight: 500,
                  color: 'rgba(255,255,255,0.95)',
                  margin: '0 0 16px 0',
                  lineHeight: '1.6'
                }}>
                  Despite billions spent on manufacturing compliance, final check rests on a hospital pharmacist managing 200 shipments a week—manually reviewing labels under fluorescent lighting after a 12-hour shift.
                </p>
                
                <p style={{
                  fontSize: '16px',
                  fontWeight: 500,
                  color: 'rgba(255,255,255,0.95)',
                  margin: '0 0 16px 0',
                  lineHeight: '1.6'
                }}>
                  They miss things. People die.
                </p>
                
                <div style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  color: 'white',
                  margin: '0',
                  lineHeight: '1.4',
                  textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                  Our mission is to eliminate human error in the last line of defense, replacing clipboard with intelligent, automated verification.
                </div>
              </div>
            </div>

            {/* Page title */}
            <div style={{ marginBottom: '28px' }}>
              <h1 style={{ fontSize: '26px', fontWeight: 700,
                color: 'var(--vl-blue)', margin: 0 }}>
                Label Verification
              </h1>
              <p style={{ color: 'var(--vl-muted)', marginTop: '4px',
                fontSize: '14px' }}>
                Upload a pharmaceutical label to extract and verify its contents.
              </p>
            </div>

            {/* Upload + Extraction row */}
            <div style={{ display: 'flex', gap: '24px',
              alignItems: 'flex-start', marginBottom: '24px' }}>

              <div style={{ flex: '0 0 55%' }}>
                <UploadCard
                  selectedFile={selectedFile}
                  dragOver={dragOver}
                  isExtracting={isExtracting}
                  fileInputRef={fileInputRef}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onFileInputChange={handleFileInputChange}
                  onExtract={handleExtract}
                />
              </div>

              <div style={{ flex: '0 0 calc(45% - 24px)' }}>
                <ExtractionPanel
                  extractedData={extractedData}
                  isExtracting={isExtracting}
                  progress={progress}
                  progressStatus={progressStatus}
                />
              </div>
            </div>

            {/* Validation Panel — full width, only when data exists */}
            {extractedData && (
              <ValidationPanel
                validationResult={validationResult}
                validationError={validationError}
                extractedData={extractedData}
                isValidating={isValidating}
              />
            )}

            {/* Why Trust Us Section */}
            <div style={{
              background: 'var(--vl-gradient)',
              borderRadius: '16px',
              padding: '32px',
              marginTop: '32px',
              boxShadow: '0 8px 32px rgba(30,58,95,0.15)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Background pattern */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(135deg, rgba(59,130,246,0.05) 0%, rgba(0,200,150,0.05) 100%)',
                pointerEvents: 'none'
              }} />
              
              <div style={{ position: 'relative', zIndex: 1 }}>
                <h2 style={{
                  fontSize: '24px',
                  fontWeight: 700,
                  color: 'white',
                  margin: '0 0 16px 0',
                  lineHeight: '1.3',
                  textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                  Why Trust Us?
                </h2>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '24px',
                  margin: '24px 0'
                }}>
                  <div>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: 700,
                      color: 'white',
                      margin: '0 0 12px 0',
                      lineHeight: '1.4',
                      textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                      Tamper-Proof Security
                    </h3>
                    <p style={{
                      fontSize: '14px',
                      fontWeight: 500,
                      color: 'rgba(255,255,255,0.9)',
                      margin: 0,
                      lineHeight: '1.6'
                    }}>
                      If a single character is edited, our cryptographic seal breaks instantly. Every verification is permanently recorded and unchangeable.
                    </p>
                  </div>
                  
                  <div>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: 700,
                      color: 'white',
                      margin: '0 0 12px 0',
                      lineHeight: '1.4',
                      textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                      Bank-Grade Encryption
                    </h3>
                    <p style={{
                      fontSize: '14px',
                      fontWeight: 500,
                      color: 'rgba(255,255,255,0.9)',
                      margin: 0,
                      lineHeight: '1.6'
                    }}>
                      SHA-256 encrypted seals—the same standard trusted by banks and governments worldwide for securing critical data.
                    </p>
                  </div>
                  
                  <div>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: 700,
                      color: 'white',
                      margin: '0 0 12px 0',
                      lineHeight: '1.4',
                      textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                      Full Audit Trail
                    </h3>
                    <p style={{
                      fontSize: '14px',
                      fontWeight: 500,
                      color: 'rgba(255,255,255,0.9)',
                      margin: 0,
                      lineHeight: '1.6'
                    }}>
                      Every check creates legally defensible evidence. Data remains identical in regulatory audits or court proceedings even months later.
                    </p>
                  </div>
                </div>
                
                <div style={{
                  marginTop: '24px',
                  padding: '20px',
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.2)'
                }}>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: 700,
                    color: 'white',
                    margin: '0 0 12px 0',
                    textAlign: 'center',
                    textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}>
                    Most systems allow results to be altered quietly, turning a failed check into a pass without a trace.
                  </div>
                  <div style={{
                    fontSize: '18px',
                    fontWeight: 700,
                    color: '#00c896',
                    margin: '0',
                    textAlign: 'center',
                    textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}>
                    VeriLabel is different.
                  </div>
                </div>
                
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '16px',
                  marginTop: '24px',
                  flexWrap: 'wrap'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    background: 'rgba(255,255,255,0.15)',
                    borderRadius: '20px',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: 'white'
                  }}>
                    🔒 SHA-256 Encrypted
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    background: 'rgba(255,255,255,0.15)',
                    borderRadius: '20px',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: 'white'
                  }}>
                    🛡️ Tamper-Evident Records
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    background: 'rgba(255,255,255,0.15)',
                    borderRadius: '20px',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: 'white'
                  }}>
                    📋 Full Audit Trail
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileInputChange}
        accept="image/*,.pdf"
        style={{ display: 'none' }}
      />
    </>
  );
}

export default HomePage;
