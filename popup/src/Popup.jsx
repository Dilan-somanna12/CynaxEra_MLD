import React, { useState, useEffect } from 'react';
import './Popup.css';

// SVG icons for statuses
const StatusIcon = ({ status }) => {
  if (status === 'malicious') {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" style={{verticalAlign:'middle'}}><circle cx="12" cy="12" r="10" fill="#ff5252"/><path d="M8 8l8 8M16 8l-8 8" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>
    );
  }
  if (status === 'suspicious') {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" style={{verticalAlign:'middle'}}><circle cx="12" cy="12" r="10" fill="#ffb300"/><path d="M12 7v5" stroke="#fff" strokeWidth="2" strokeLinecap="round"/><circle cx="12" cy="16" r="1" fill="#fff"/></svg>
    );
  }
  // safe
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" style={{verticalAlign:'middle'}}><circle cx="12" cy="12" r="10" fill="#4caf50"/><path d="M8 13l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
  );
};

// SVG for scan/search button
const ScanIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{marginRight:6,verticalAlign:'middle'}}><circle cx="11" cy="11" r="7" stroke="#fff" strokeWidth="2"/><path d="M20 20l-3-3" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>
);

function setHtmlTheme(theme) {
  if (theme) {
    document.documentElement.setAttribute('data-theme', theme);
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
}

export default function Popup() {
  const [inputUrl, setInputUrl] = useState('');
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [theme, setTheme] = useState(null); // null = system, 'dark', 'light'

  // Load theme from storage on mount
  useEffect(() => {
    if (window.chrome && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['theme'], (result) => {
        if (result.theme) {
          setTheme(result.theme);
        }
      });
    }
  }, []);

  useEffect(() => {
    setHtmlTheme(theme);
    // Save theme to storage
    if (window.chrome && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ theme: theme });
    }
  }, [theme]);

  // Fetch scan results from chrome.storage.local on mount
  useEffect(() => {
    if (window.chrome && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['scanResults'], (result) => {
        if (result && Array.isArray(result.scanResults) && result.scanResults.length > 0) {
          setLinks([result.scanResults[0]]); // Only show the most recent
        } else {
          setLinks([]);
        }
      });
      // Listen for changes to scanResults
      const listener = (changes, area) => {
        if (area === 'local' && changes.scanResults) {
          const arr = Array.isArray(changes.scanResults.newValue) ? changes.scanResults.newValue : [];
          setLinks(arr.length > 0 ? [arr[0]] : []);
        }
      };
      chrome.storage.onChanged.addListener(listener);
      return () => chrome.storage.onChanged.removeListener(listener);
    }
  }, []);

  const handleScan = (e) => {
    e.preventDefault();
    setError('');
    if (!inputUrl.startsWith('http')) {
      setError('Please enter a valid URL (starting with http or https)');
      return;
    }
    setLoading(true);
    // Simulate scan result (for manual input only)
    setTimeout(() => {
      const newResult = { url: inputUrl, status: 'Safe', score: Math.floor(Math.random() * 10), scannedAt: Date.now() };
      // Save to history in storage
      if (window.chrome && chrome.storage && chrome.storage.local) {
        chrome.storage.local.get(['scanResults'], (result) => {
          const prev = Array.isArray(result.scanResults) ? result.scanResults : [];
          const updated = [newResult, ...prev];
          chrome.storage.local.set({ scanResults: updated }, () => {
            setLinks([newResult]);
            setInputUrl('');
            setLoading(false);
          });
        });
      } else {
        setLinks([newResult]);
        setInputUrl('');
        setLoading(false);
      }
    }, 1000);
  };

  // Helper to get status and icon type
  function getStatusType(link) {
    const score = link.finalScore ?? link.score;
    if (score >= 7) return 'malicious';
    if (score >= 3) return 'suspicious';
    return 'safe';
  }
  function getStatusLabel(link) {
    const score = link.finalScore ?? link.score;
    if (score >= 7) return 'Malicious';
    if (score >= 3) return 'Suspicious';
    return 'Safe';
  }

  return (
    <div className="popup-container modern">
      <div style={{textAlign: 'center', marginBottom: '1rem', position: 'relative'}}>
        <img src="Logo.png" alt="Logo" width={130} height={120} style={{marginBottom: '0.5rem'}} />
        <h2 className="modern-title" style={{margin: 0}}>
          CynaxEra Malicious Link Detector
        </h2>
        <button
          aria-label="Toggle dark mode"
          className="modern-btn"
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            padding: '6px 10px',
            fontSize: '1.1em',
            width: 38,
            height: 38,
            minWidth: 38,
            minHeight: 38,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            boxShadow: 'none'
          }}
          onClick={() => setTheme(theme === 'dark' ? 'light' : theme === 'light' ? null : 'dark')}
        >
          {theme === 'dark' ? '🌙' : theme === 'light' ? '☀️' : '🌓'}
        </button>
      </div>
      <form onSubmit={handleScan} className="scan-form modern-form">
        <input
          type="text"
          placeholder="Paste a URL to scan..."
          value={inputUrl}
          onChange={e => setInputUrl(e.target.value)}
          disabled={loading}
          className="modern-input"
        />
        <button type="submit" disabled={loading} className="modern-btn">
          <ScanIcon />Scan
        </button>
      </form>
      {error && <div className="error modern-error">{error}</div>}
      <div className="links-list modern-list">
        {links.length === 0 ? (
          <div className="empty modern-empty">No links scanned yet.</div>
        ) : (
          links.map((link, idx) => {
            const statusType = getStatusType(link);
            const statusLabel = getStatusLabel(link);
            return (
              <div className={`link-item modern-item modern-${statusType}`} key={idx}>
                {/* VirusTotal Results Section */}
                {link.virusTotalResult && (
                  <>
                    <div className="modern-shodan-section-header" style={{display:'flex',alignItems:'center',gap:8,marginBottom:4,marginTop:2}}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" fill="#FF6B35"/>
                        <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="#fff"/>
                      </svg>
                      <span style={{fontWeight:700,fontSize:'1.08em',letterSpacing:'0.01em'}}>VirusTotal Security Analysis</span>
                    </div>
                    <div className="modern-shodan-section">
                      <div className="modern-shodan-label" style={{display:'flex',alignItems:'center',gap:6}}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                          <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="#FF6B35"/>
                        </svg>
                        Security Results
                      </div>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                        gap: '0.5rem',
                        marginBottom: '0.75rem'
                      }}>
                        <div style={{
                          background: link.virusTotalResult.malicious > 0 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                          color: link.virusTotalResult.malicious > 0 ? '#EF4444' : '#10B981',
                          padding: '0.5rem',
                          borderRadius: '8px',
                          textAlign: 'center',
                          border: `1px solid ${link.virusTotalResult.malicious > 0 ? '#EF4444' : '#10B981'}30`
                        }}>
                          <div style={{fontSize: '1.2rem', fontWeight: 'bold'}}>{link.virusTotalResult.malicious}</div>
                          <div style={{fontSize: '0.75rem'}}>Malicious</div>
                        </div>
                        <div style={{
                          background: link.virusTotalResult.suspicious > 0 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                          color: link.virusTotalResult.suspicious > 0 ? '#F59E0B' : '#10B981',
                          padding: '0.5rem',
                          borderRadius: '8px',
                          textAlign: 'center',
                          border: `1px solid ${link.virusTotalResult.suspicious > 0 ? '#F59E0B' : '#10B981'}30`
                        }}>
                          <div style={{fontSize: '1.2rem', fontWeight: 'bold'}}>{link.virusTotalResult.suspicious}</div>
                          <div style={{fontSize: '0.75rem'}}>Suspicious</div>
                        </div>
                        <div style={{
                          background: 'rgba(16, 185, 129, 0.1)',
                          color: '#10B981',
                          padding: '0.5rem',
                          borderRadius: '8px',
                          textAlign: 'center',
                          border: '1px solid #10B98130'
                        }}>
                          <div style={{fontSize: '1.2rem', fontWeight: 'bold'}}>{link.virusTotalResult.harmless}</div>
                          <div style={{fontSize: '0.75rem'}}>Clean</div>
                        </div>
                        <div style={{
                          background: 'rgba(107, 114, 128, 0.1)',
                          color: '#6B7280',
                          padding: '0.5rem',
                          borderRadius: '8px',
                          textAlign: 'center',
                          border: '1px solid #6B728030'
                        }}>
                          <div style={{fontSize: '1.2rem', fontWeight: 'bold'}}>{link.virusTotalResult.total}</div>
                          <div style={{fontSize: '0.75rem'}}>Total</div>
                        </div>
                      </div>
                      <div style={{
                        fontSize: '0.85rem',
                        color: 'var(--color-text-secondary)',
                        marginBottom: '0.5rem'
                      }}>
                        {link.virusTotalResult.message}
                      </div>
                      {link.virusTotalResult.reputation !== undefined && (
                        <div style={{
                          fontSize: '0.85rem',
                          color: 'var(--color-text-secondary)',
                          marginBottom: '0.5rem'
                        }}>
                          Reputation Score: {link.virusTotalResult.reputation}
                        </div>
                      )}
                      {link.virusTotalResult.tags && link.virusTotalResult.tags.length > 0 && (
                        <div style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '0.25rem',
                          marginTop: '0.5rem'
                        }}>
                          {link.virusTotalResult.tags.map((tag, idx) => (
                            <span key={idx} style={{
                              background: 'rgba(255, 107, 53, 0.1)',
                              color: '#FF6B35',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '12px',
                              fontSize: '0.75rem',
                              fontWeight: '500'
                            }}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* Shodan/IP info section */}
                {link.shodanInfo && (
                  <>
                    <div className="modern-shodan-section-header" style={{display:'flex',alignItems:'center',gap:8,marginBottom:4,marginTop:2}}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="#C74AF2"/><path d="M8 12a4 4 0 1 1 8 0 4 4 0 0 1-8 0z" fill="#fff"/></svg>
                      <span style={{fontWeight:700,fontSize:'1.08em',letterSpacing:'0.01em'}}>Shodan Network Intelligence</span>
                    </div>
                    <div className="modern-shodan-section">
                    <div className="modern-shodan-label" style={{display:'flex',alignItems:'center',gap:6}}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="2" y="6" width="20" height="12" rx="3" fill="#9A40E1"/><rect x="7" y="10" width="10" height="4" rx="2" fill="#fff"/></svg>
                      IP Info
                    </div>
                    {link.shodanInfo.ip && (
                      <div className="modern-shodan-ip">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{verticalAlign:'middle',marginRight:4}}><circle cx="12" cy="12" r="10" fill="#1976d2"/><path d="M8 12a4 4 0 1 1 8 0 4 4 0 0 1-8 0z" fill="#fff"/></svg>
                        <span>IP: {link.shodanInfo.ip}</span>
                      </div>
                    )}
                    {link.shodanInfo.resolver && (
                      <div className="modern-shodan-resolver">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" style={{verticalAlign:'middle',marginRight:4}}><path d="M12 2v20M2 12h20" stroke="#C74AF2" strokeWidth="2" strokeLinecap="round"/></svg>
                        <span>Resolver: {link.shodanInfo.resolver}</span>
                      </div>
                    )}
                    {link.shodanInfo.hostnames && link.shodanInfo.hostnames.length > 0 && (
                      <div className="modern-shodan-hostnames">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" style={{verticalAlign:'middle',marginRight:4}}><circle cx="12" cy="12" r="10" stroke="#FF4E8E" strokeWidth="2"/><path d="M8 12h8M12 8v8" stroke="#FF4E8E" strokeWidth="2"/></svg>
                        Hostnames: {link.shodanInfo.hostnames.join(', ')}
                      </div>
                    )}
                    {link.shodanInfo.tags && link.shodanInfo.tags.length > 0 && (
                      <div className="modern-shodan-tags">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" style={{verticalAlign:'middle',marginRight:4}}><rect x="4" y="4" width="16" height="16" rx="4" fill="#FF4E8E"/></svg>
                        Tags: {link.shodanInfo.tags.join(', ')}
                      </div>
                    )}
                    {link.shodanInfo.country && (
                      <div className="modern-shodan-country">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" style={{verticalAlign:'middle',marginRight:4}}><path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z" fill="#4caf50"/></svg>
                        Country: {link.shodanInfo.country}
                      </div>
                    )}
                    {link.shodanInfo.city && (
                      <div className="modern-shodan-city">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" style={{verticalAlign:'middle',marginRight:4}}><rect x="4" y="10" width="16" height="10" rx="2" fill="#1976d2"/><rect x="8" y="6" width="8" height="4" rx="1" fill="#9A40E1"/></svg>
                        City: {link.shodanInfo.city}
                      </div>
                    )}
                    {link.shodanInfo.org && (
                      <div className="modern-shodan-org">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" style={{verticalAlign:'middle',marginRight:4}}><circle cx="12" cy="8" r="4" fill="#FF4E8E"/><rect x="6" y="14" width="12" height="6" rx="3" fill="#C74AF2"/></svg>
                        Org: {link.shodanInfo.org}
                      </div>
                    )}
                    {link.shodanInfo.isp && (
                      <div className="modern-shodan-isp">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" style={{verticalAlign:'middle',marginRight:4}}><rect x="2" y="6" width="20" height="12" rx="3" fill="#FF4E8E"/><rect x="7" y="10" width="10" height="4" rx="2" fill="#fff"/></svg>
                        ISP: {link.shodanInfo.isp}
                      </div>
                    )}
                    {link.shodanInfo.lastUpdate && (
                      <div className="modern-shodan-lastupdate">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" style={{verticalAlign:'middle',marginRight:4}}><circle cx="12" cy="12" r="10" stroke="#1976d2" strokeWidth="2"/><path d="M12 6v6l4 2" stroke="#1976d2" strokeWidth="2" strokeLinecap="round"/></svg>
                        Last Update: {new Date(link.shodanInfo.lastUpdate).toLocaleString()}
                      </div>
                    )}
                    {link.shodanInfo.openPorts && link.shodanInfo.openPorts.length > 0 && (
                      <div className="modern-shodan-ports">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" style={{verticalAlign:'middle',marginRight:4}}><rect x="4" y="8" width="16" height="8" rx="2" fill="#4caf50"/><rect x="10" y="10" width="4" height="4" rx="1" fill="#fff"/></svg>
                        <span className="modern-shodan-ports-label">Open Ports:</span> {link.shodanInfo.openPorts.join(', ')}
                      </div>
                    )}
                    {link.shodanInfo.vulns && (
                      <div className="modern-shodan-vulns">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" style={{verticalAlign:'middle',marginRight:4}}><circle cx="12" cy="12" r="10" fill="#d32f2f"/><path d="M8 8l8 8M16 8l-8 8" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>
                        Vulns: {Object.keys(link.shodanInfo.vulns).join(', ')}
                      </div>
                    )}
                  </div>
                  </>
                )}
                {/* URL */}
                <div className="modern-row">
                  <StatusIcon status={statusType} />
                  <span className="link-url modern-url">{link.url}</span>
                </div>
                {/* Status & Score */}
                <div className="link-status modern-status">
                  <StatusIcon status={statusType} />
                  <span className="status-label" style={{marginLeft:6}}>{statusLabel}</span>
                  <span className="status-score" style={{marginLeft:10}}>Score: {link.finalScore ?? link.score}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
      <button className="modern-btn" style={{marginTop:12}} onClick={() => window.open('history.html', '_blank')}>View History</button>
    </div>
  );
} 