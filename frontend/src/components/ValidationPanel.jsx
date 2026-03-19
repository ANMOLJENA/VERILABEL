import React from 'react';
import { AlertCircle, Pill, Search, ShieldAlert, ShieldCheck } from 'lucide-react';

const INFO_FIELDS = [
  { key: 'drug_name', label: 'Medicine Name' },
  { key: 'strength', label: 'Strength' },
  { key: 'dosage_form', label: 'Dosage Form' },
  { key: 'batch_number', label: 'Batch Number' },
  { key: 'manufacturing_date', label: 'Manufacturing Date' },
  { key: 'expiry_date', label: 'Expiry Date' },
  { key: 'manufacturer', label: 'Manufacturer' },
  { key: 'marketed_by', label: 'Marketed By' },
  { key: 'license_number', label: 'License Number' },
  { key: 'storage_conditions', label: 'Storage Conditions' },
  { key: 'package_type', label: 'Package Type' },
  { key: 'composition_summary', label: 'Composition Summary' },
];

export default function ValidationPanel({
  validationResult,
  validationError,
  extractedData,
  isValidating
}) {
  if (!extractedData) {
    return null;
  }

  const fields = validationResult || {};
  const riskLevel = fields.risk_level || 'Pending';
  const confidenceScore = fields.confidence_score ?? null;
  const isVerified = validationResult &&
    fields.risk_level?.toLowerCase() !== 'high' &&
    (fields.confidence_score ?? 0) >= 70;

  const statusConfig = validationError
    ? {
        icon: AlertCircle,
        title: 'Validation incomplete',
        description: validationError,
        bg: 'rgba(245, 158, 11, 0.12)',
        border: '#f59e0b',
        text: '#92400e',
      }
    : isValidating
      ? {
          icon: Search,
          title: 'Validating extracted text',
          description: 'Running AI field extraction and compliance checks.',
          bg: 'rgba(59, 130, 246, 0.10)',
          border: '#3b82f6',
          text: '#1d4ed8',
        }
      : isVerified
        ? {
            icon: ShieldCheck,
            title: 'Verification passed',
            description: 'Structured medicine details were extracted successfully.',
            bg: 'rgba(16, 185, 129, 0.12)',
            border: '#10b981',
            text: '#047857',
          }
        : {
            icon: ShieldAlert,
            title: 'Review required',
            description: fields.analysis_summary || 'Some required fields are missing or uncertain.',
            bg: 'rgba(239, 68, 68, 0.10)',
            border: '#ef4444',
            text: '#b91c1c',
          };

  const StatusIcon = statusConfig.icon;

  const renderFieldValue = (value) => {
    if (value === null || value === undefined || value === '') {
      return (
        <span style={{
          color: 'var(--vl-muted)',
          fontStyle: 'italic',
          fontWeight: 500,
        }}>
          Not detected
        </span>
      );
    }

    return value;
  };

  const complianceItems = [
    {
      label: 'Prescription Required',
      value:
        typeof fields.prescription_required === 'boolean'
          ? (fields.prescription_required ? 'Yes' : 'No')
          : 'Not detected',
    },
    {
      label: 'Serialization Present',
      value:
        typeof fields.serialization_present === 'boolean'
          ? (fields.serialization_present ? 'Yes' : 'No')
          : 'Not detected',
    },
    {
      label: 'Format Valid',
      value:
        typeof fields.format_valid === 'boolean'
          ? (fields.format_valid ? 'Yes' : 'No')
          : 'Not detected',
    },
    {
      label: 'Missing Fields',
      value:
        Array.isArray(fields.missing_fields) && fields.missing_fields.length > 0
          ? fields.missing_fields.join(', ')
          : 'None',
    },
  ];

  return (
    <div className="vl-card" style={{ padding: '28px' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) minmax(320px, 0.95fr)',
        gap: '28px',
        alignItems: 'start',
      }}>
        <section>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '18px',
          }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '14px',
              background: 'rgba(59, 130, 246, 0.14)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#2563eb',
            }}>
              <Search size={20} />
            </div>
            <div>
              <h2 style={{
                fontSize: '20px',
                fontWeight: 800,
                color: 'var(--vl-text)',
                margin: 0,
              }}>
                OCR Extracted Text
              </h2>
              <p style={{
                margin: '4px 0 0 0',
                color: 'var(--vl-muted)',
                fontSize: '13px',
              }}>
                Raw text captured from the uploaded label.
              </p>
            </div>
          </div>

          <div style={{
            border: '1px solid var(--vl-border)',
            borderRadius: '18px',
            background: 'linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.9)',
            padding: '18px',
          }}>
            <div style={{
              maxHeight: '360px',
              overflowY: 'auto',
              fontFamily: '"SF Mono", "JetBrains Mono", monospace',
              fontSize: '13px',
              lineHeight: '1.9',
              color: '#1f2937',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              background: '#ffffff',
              border: '1px solid #e6edf5',
              borderRadius: '14px',
              padding: '16px',
            }}>
              {extractedData.extracted_text || 'No text extracted.'}
            </div>

            <div style={{
              marginTop: '14px',
              fontSize: '14px',
              color: 'var(--vl-muted)',
            }}>
              Processing time: {extractedData.processing_time ?? 'N/A'}s
            </div>
          </div>
        </section>

        <section>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '18px',
          }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '14px',
              background: 'rgba(236, 72, 153, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#db2777',
            }}>
              <Pill size={20} />
            </div>
            <div>
              <h2 style={{
                fontSize: '20px',
                fontWeight: 800,
                color: 'var(--vl-text)',
                margin: 0,
              }}>
                Medicine Information
              </h2>
              <p style={{
                margin: '4px 0 0 0',
                color: 'var(--vl-muted)',
                fontSize: '13px',
              }}>
                Structured fields detected from the OCR output.
              </p>
            </div>
          </div>

          <div style={{
            background: statusConfig.bg,
            borderLeft: `4px solid ${statusConfig.border}`,
            color: statusConfig.text,
            borderRadius: '14px',
            padding: '14px 16px',
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-start',
            marginBottom: '16px',
          }}>
            <StatusIcon size={18} style={{ marginTop: '2px', flex: '0 0 auto' }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: '14px' }}>{statusConfig.title}</div>
              <div style={{ fontSize: '13px', marginTop: '3px', opacity: 0.92 }}>
                {statusConfig.description}
              </div>
            </div>
          </div>

          {!validationResult ? (
            <div style={{
              display: 'grid',
              gap: '14px',
            }}>
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div
                  key={item}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e6edf5',
                    borderRadius: '16px',
                    padding: '16px 18px',
                    boxShadow: '0 8px 24px rgba(15, 23, 42, 0.04)',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: '4px',
                    background: 'linear-gradient(180deg, #60a5fa 0%, #38bdf8 100%)',
                  }} />
                  <div style={{
                    height: '10px',
                    width: '110px',
                    borderRadius: '999px',
                    background: '#dbeafe',
                    marginBottom: '12px',
                  }} />
                  <div style={{
                    height: '18px',
                    width: `${50 + (item % 3) * 15}%`,
                    borderRadius: '999px',
                    background: 'linear-gradient(90deg, #eef2ff 25%, #dbeafe 50%, #eef2ff 75%)',
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 1.5s infinite',
                  }} />
                </div>
              ))}
            </div>
          ) : (
            <>
              <div style={{
                display: 'grid',
                gap: '14px',
              }}>
                {INFO_FIELDS.map((field) => (
                  <div
                    key={field.key}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #e6edf5',
                      borderRadius: '16px',
                      padding: '16px 18px',
                      boxShadow: '0 8px 24px rgba(15, 23, 42, 0.04)',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    <div style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: '4px',
                      background: 'linear-gradient(180deg, #60a5fa 0%, #38bdf8 100%)',
                    }} />
                    <div style={{
                      fontSize: '11px',
                      letterSpacing: '0.05em',
                      fontWeight: 800,
                      color: '#4b5563',
                      textTransform: 'uppercase',
                      marginBottom: '8px',
                    }}>
                      {field.label}
                    </div>
                    <div style={{
                      fontSize: '15px',
                      fontWeight: 600,
                      color: 'var(--vl-text)',
                    }}>
                      {renderFieldValue(fields[field.key])}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                gap: '14px',
                marginTop: '16px',
              }}>
                <div style={{
                  background: '#ffffff',
                  border: '1px solid #e6edf5',
                  borderRadius: '16px',
                  padding: '16px 18px',
                }}>
                  <div style={{
                    fontSize: '11px',
                    letterSpacing: '0.05em',
                    fontWeight: 800,
                    color: '#4b5563',
                    textTransform: 'uppercase',
                    marginBottom: '8px',
                  }}>
                    Risk Level
                  </div>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '6px 12px',
                    borderRadius: '999px',
                    background:
                      riskLevel.toLowerCase() === 'low'
                        ? 'rgba(16, 185, 129, 0.12)'
                        : riskLevel.toLowerCase() === 'medium'
                          ? 'rgba(245, 158, 11, 0.14)'
                          : riskLevel.toLowerCase() === 'high'
                            ? 'rgba(239, 68, 68, 0.12)'
                            : 'rgba(59, 130, 246, 0.10)',
                    color:
                      riskLevel.toLowerCase() === 'low'
                        ? '#047857'
                        : riskLevel.toLowerCase() === 'medium'
                          ? '#b45309'
                          : riskLevel.toLowerCase() === 'high'
                            ? '#b91c1c'
                            : '#1d4ed8',
                    fontSize: '12px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                  }}>
                    {riskLevel}
                  </div>
                </div>

                <div style={{
                  background: '#ffffff',
                  border: '1px solid #e6edf5',
                  borderRadius: '16px',
                  padding: '16px 18px',
                }}>
                  <div style={{
                    fontSize: '11px',
                    letterSpacing: '0.05em',
                    fontWeight: 800,
                    color: '#4b5563',
                    textTransform: 'uppercase',
                    marginBottom: '8px',
                  }}>
                    Confidence Score
                  </div>
                  <div style={{
                    fontSize: '22px',
                    fontWeight: 800,
                    color: '#111827',
                  }}>
                    {confidenceScore !== null ? `${confidenceScore}%` : 'Pending'}
                  </div>
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                gap: '14px',
                marginTop: '16px',
              }}>
                {complianceItems.map((item) => (
                  <div
                    key={item.label}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #e6edf5',
                      borderRadius: '16px',
                      padding: '16px 18px',
                    }}
                  >
                    <div style={{
                      fontSize: '11px',
                      letterSpacing: '0.05em',
                      fontWeight: 800,
                      color: '#4b5563',
                      textTransform: 'uppercase',
                      marginBottom: '8px',
                    }}>
                      {item.label}
                    </div>
                    <div style={{
                      fontSize: '15px',
                      fontWeight: 600,
                      color: 'var(--vl-text)',
                      lineHeight: '1.6',
                    }}>
                      {renderFieldValue(item.value)}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
