import React, { useEffect, useState } from 'react';
import './Popup.css';

function setHtmlTheme(theme) {
  if (theme) {
    document.documentElement.setAttribute('data-theme', theme);
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
}

const StatusIcon = ({ status }) => {
  if (status === 'malicious') {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{verticalAlign:'middle'}}>
        <circle cx="12" cy="12" r="10" fill="#EF4444"/>
        <path d="M8 8l8 8M16 8l-8 8" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    );
  }
  if (status === 'suspicious') {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{verticalAlign:'middle'}}>
        <circle cx="12" cy="12" r="10" fill="#F59E0B"/>
        <path d="M12 7v5" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="12" cy="16" r="1" fill="#fff"/>
      </svg>
    );
  }
  // safe
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{verticalAlign:'middle'}}>
      <circle cx="12" cy="12" r="10" fill="#10B981"/>
      <path d="M8 13l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
};

// Shodan Info Card Component
const ShodanCard = ({ title, value, icon, color = "#1976D2", bgColor = "rgba(25, 118, 210, 0.1)" }) => (
  <div style={{
    background: bgColor,
    border: `1px solid ${color}20`,
    borderRadius: '12px',
    padding: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    minHeight: '60px',
    transition: 'all 0.2s ease',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  }}>
    <div style={{
      background: color,
      borderRadius: '8px',
      padding: '0.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: '32px',
      height: '32px'
    }}>
      {icon}
    </div>
    <div style={{ flex: 1 }}>
      <div style={{
        fontSize: '0.75rem',
        fontWeight: '600',
        color: color,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        marginBottom: '0.25rem'
      }}>
        {title}
      </div>
      <div style={{
        fontSize: '0.9rem',
        fontWeight: '500',
        color: 'var(--color-text-primary)',
        fontFamily: 'var(--font-main)'
      }}>
        {value}
      </div>
    </div>
  </div>
);

// Shodan Tags Card Component
const ShodanTagsCard = ({ title, tags, icon, color = "#1976D2", bgColor = "rgba(25, 118, 210, 0.1)" }) => (
  <div style={{
    background: bgColor,
    border: `1px solid ${color}20`,
    borderRadius: '12px',
    padding: '1rem',
    minHeight: '60px',
    transition: 'all 0.2s ease',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  }}>
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      marginBottom: '0.75rem'
    }}>
      <div style={{
        background: color,
        borderRadius: '8px',
        padding: '0.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: '32px',
        height: '32px'
      }}>
        {icon}
      </div>
      <div style={{
        fontSize: '0.75rem',
        fontWeight: '600',
        color: color,
        textTransform: 'uppercase',
        letterSpacing: '0.05em'
      }}>
        {title}
      </div>
    </div>
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: '0.5rem'
    }}>
      {tags.map((tag, idx) => (
        <span key={idx} style={{
          background: `${color}15`,
          color: color,
          padding: '0.375rem 0.75rem',
          borderRadius: '20px',
          fontSize: '0.8rem',
          fontWeight: '500',
          border: `1px solid ${color}30`,
          fontFamily: 'var(--font-main)'
        }}>
          {tag}
        </span>
      ))}
    </div>
  </div>
);

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

function formatDate(timestamp) {
  if (!timestamp) return 'Unknown';
  const date = new Date(timestamp);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
}

export default function History() {
  const [links, setLinks] = useState([]);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(null);

  // Load theme from storage on mount
  useEffect(() => {
    if (window.chrome && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['theme'], (result) => {
        if (result.theme) {
          setTheme(result.theme);
          setHtmlTheme(result.theme);
        }
      });
    }
  }, []);

  // Theme change handler
  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    setHtmlTheme(newTheme);
    if (window.chrome && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ theme: newTheme });
    }
  };

  useEffect(() => {
    if (window.chrome && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['scanResults'], (result) => {
        if (result && Array.isArray(result.scanResults)) {
          setLinks(result.scanResults);
        }
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  const filteredAndSortedLinks = links
    .filter(link => {
      if (filter === 'all') return true;
      const status = getStatusType(link);
      return status === filter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return (b.timestamp || 0) - (a.timestamp || 0);
        case 'score':
          return (b.finalScore || b.score || 0) - (a.finalScore || a.score || 0);
        case 'url':
          return a.url.localeCompare(b.url);
        default:
          return 0;
      }
    });

  const stats = {
    total: links.length,
    malicious: links.filter(link => getStatusType(link) === 'malicious').length,
    suspicious: links.filter(link => getStatusType(link) === 'suspicious').length,
    safe: links.filter(link => getStatusType(link) === 'safe').length,
  };

  if (loading) {
    return (
      <div className="popup-container modern">
        <div className="loading">Loading scan history...</div>
      </div>
    );
  }

  return (
    <div className="popup-container modern">
      <div style={{textAlign: 'center', marginBottom: '1.5rem', position: 'relative'}}>
        <img src="Logo.png" alt="Logo" width={130} height={128} style={{marginBottom: '1rem'}} />
        <h2 className="modern-title" style={{margin: 0}}>
          Scan History
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
          onClick={() => handleThemeChange(theme === 'dark' ? 'light' : theme === 'light' ? null : 'dark')}
        >
          {theme === 'dark' ? '🌙' : theme === 'light' ? '☀️' : '🌓'}
        </button>
      </div>
      
      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
          color: 'white',
          padding: '1rem',
          borderRadius: '12px',
          textAlign: 'center',
          boxShadow: 'var(--shadow-md)'
        }}>
          <div style={{fontSize: '1.5rem', fontWeight: 'bold'}}>{stats.malicious}</div>
          <div style={{fontSize: '0.8rem', opacity: 0.9}}>Malicious</div>
        </div>
        <div style={{
          background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
          color: 'white',
          padding: '1rem',
          borderRadius: '12px',
          textAlign: 'center',
          boxShadow: 'var(--shadow-md)'
        }}>
          <div style={{fontSize: '1.5rem', fontWeight: 'bold'}}>{stats.suspicious}</div>
          <div style={{fontSize: '0.8rem', opacity: 0.9}}>Suspicious</div>
        </div>
        <div style={{
          background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
          color: 'white',
          padding: '1rem',
          borderRadius: '12px',
          textAlign: 'center',
          boxShadow: 'var(--shadow-md)'
        }}>
          <div style={{fontSize: '1.5rem', fontWeight: 'bold'}}>{stats.safe}</div>
          <div style={{fontSize: '0.8rem', opacity: 0.9}}>Safe</div>
        </div>
        <div style={{
          background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
          color: 'white',
          padding: '1rem',
          borderRadius: '12px',
          textAlign: 'center',
          boxShadow: 'var(--shadow-md)'
        }}>
          <div style={{fontSize: '1.5rem', fontWeight: 'bold'}}>{stats.total}</div>
          <div style={{fontSize: '0.8rem', opacity: 0.9}}>Total</div>
        </div>
      </div>

      {/* Controls */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '1rem',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <button className="modern-btn" onClick={() => window.close()}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to Popup
        </button>
        
        <select 
          value={filter} 
          onChange={(e) => setFilter(e.target.value)}
          style={{
            padding: '0.5rem 1rem',
            border: '2px solid var(--color-border)',
            borderRadius: '8px',
            background: 'var(--color-bg)',
            color: 'var(--color-text-primary)',
            fontFamily: 'var(--font-main)',
            fontSize: '0.9rem'
          }}
        >
          <option value="all">All Results</option>
          <option value="malicious">Malicious</option>
          <option value="suspicious">Suspicious</option>
          <option value="safe">Safe</option>
        </select>
        
        <select 
          value={sortBy} 
          onChange={(e) => setSortBy(e.target.value)}
          style={{
            padding: '0.5rem 1rem',
            border: '2px solid var(--color-border)',
            borderRadius: '8px',
            background: 'var(--color-bg)',
            color: 'var(--color-text-primary)',
            fontFamily: 'var(--font-main)',
            fontSize: '0.9rem'
          }}
        >
          <option value="date">Sort by Date</option>
          <option value="score">Sort by Score</option>
          <option value="url">Sort by URL</option>
        </select>
      </div>

      <div className="links-list modern-list">
        {filteredAndSortedLinks.length === 0 ? (
          <div className="empty modern-empty">
            {filter === 'all' ? 'No scan history yet.' : `No ${filter} results found.`}
          </div>
        ) : (
          filteredAndSortedLinks.map((link, idx) => {
            const statusType = getStatusType(link);
            const statusLabel = getStatusLabel(link);
            return (
              <div className={`link-item modern-item modern-${statusType}`} key={idx}>
                {/* Header with IP and timestamp */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.75rem',
                  flexWrap: 'wrap',
                  gap: '0.5rem'
                }}>
                  {link.shodanInfo && link.shodanInfo.ip && (
                    <div className="modern-shodan-ip">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" fill="#1976d2"/>
                        <path d="M8 12a4 4 0 1 1 8 0 4 4 0 0 1-8 0z" fill="#fff"/>
                      </svg>
                      <span>IP: {link.shodanInfo.ip}</span>
                    </div>
                  )}
                  <div style={{
                    fontSize: '0.75rem',
                    color: 'var(--color-text-secondary)',
                    fontStyle: 'italic'
                  }}>
                    {formatDate(link.timestamp)}
                  </div>
                </div>

                {/* URL and Status */}
                <div className="modern-row">
                  <StatusIcon status={statusType} />
                  <span className="link-url modern-url">{link.url}</span>
                </div>
                
                <div className="link-status modern-status">
                  <StatusIcon status={statusType} />
                  <span className="status-label">{statusLabel}</span>
                  <span className="status-score">Score: {link.finalScore ?? link.score}</span>
                </div>

                {/* Enhanced VirusTotal Information Cards */}
                {link.virusTotalResult && (
                  <div style={{
                    marginTop: '1rem',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '1rem'
                  }}>
                    {/* VirusTotal Status Card */}
                    <ShodanCard
                      title="VirusTotal Status"
                      value={link.virusTotalResult.status === 'flagged' ? 'Flagged' : link.virusTotalResult.status === 'clean' ? 'Clean' : link.virusTotalResult.status}
                      icon={
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" fill="#fff"/>
                          <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="#FF6B35"/>
                        </svg>
                      }
                      color="#FF6B35"
                      bgColor="rgba(255, 107, 53, 0.08)"
                    />

                    {/* Malicious Detections Card */}
                    <ShodanCard
                      title="Malicious Detections"
                      value={`${link.virusTotalResult.malicious} / ${link.virusTotalResult.total}`}
                      icon={
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" fill="#fff"/>
                          <path d="M8 8l8 8M16 8l-8 8" stroke="#EF4444" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                      }
                      color="#EF4444"
                      bgColor="rgba(239, 68, 68, 0.08)"
                    />

                    {/* Suspicious Detections Card */}
                    <ShodanCard
                      title="Suspicious Detections"
                      value={`${link.virusTotalResult.suspicious} / ${link.virusTotalResult.total}`}
                      icon={
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" fill="#fff"/>
                          <path d="M12 7v5" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round"/>
                          <circle cx="12" cy="16" r="1" fill="#F59E0B"/>
                        </svg>
                      }
                      color="#F59E0B"
                      bgColor="rgba(245, 158, 11, 0.08)"
                    />

                    {/* Clean Detections Card */}
                    <ShodanCard
                      title="Clean Detections"
                      value={`${link.virusTotalResult.harmless} / ${link.virusTotalResult.total}`}
                      icon={
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" fill="#fff"/>
                          <path d="M8 13l3 3 5-5" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      }
                      color="#10B981"
                      bgColor="rgba(16, 185, 129, 0.08)"
                    />

                    {/* Reputation Score Card */}
                    {link.virusTotalResult.reputation !== undefined && (
                      <ShodanCard
                        title="Reputation Score"
                        value={link.virusTotalResult.reputation.toString()}
                        icon={
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" fill="#fff"/>
                            <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="#8B5CF6"/>
                          </svg>
                        }
                        color="#8B5CF6"
                        bgColor="rgba(139, 92, 246, 0.08)"
                      />
                    )}

                    {/* VirusTotal Tags Card */}
                    {link.virusTotalResult.tags && link.virusTotalResult.tags.length > 0 && (
                      <ShodanTagsCard
                        title="VirusTotal Tags"
                        tags={link.virusTotalResult.tags}
                        icon={
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 0 1 0 2.828l-7 7a2 2 0 0 1-2.828 0l-7-7A1.994 1.994 0 0 1 3 12V7a4 4 0 0 1 4-4z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        }
                        color="#FF6B35"
                        bgColor="rgba(255, 107, 53, 0.08)"
                      />
                    )}
                  </div>
                )}

                {/* Enhanced Shodan Information Cards */}
                {link.shodanInfo && (
                  <div style={{
                    marginTop: '1rem',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '1rem'
                  }}>
                    {/* IP Address Card */}
                    {link.shodanInfo.ip && (
                      <ShodanCard
                        title="IP Address"
                        value={link.shodanInfo.ip}
                        icon={
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" fill="#fff"/>
                            <path d="M8 12a4 4 0 1 1 8 0 4 4 0 0 1-8 0z" fill="#1976D2"/>
                          </svg>
                        }
                        color="#1976D2"
                        bgColor="rgba(25, 118, 210, 0.08)"
                      />
                    )}

                    {/* Organization Card */}
                    {link.shodanInfo.org && (
                      <ShodanCard
                        title="Organization"
                        value={link.shodanInfo.org}
                        icon={
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M3 21h18M3 7h18M3 3h18M7 21V7M17 21V7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        }
                        color="#10B981"
                        bgColor="rgba(16, 185, 129, 0.08)"
                      />
                    )}

                    {/* Country Card */}
                    {link.shodanInfo.country && (
                      <ShodanCard
                        title="Country"
                        value={link.shodanInfo.country}
                        icon={
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="#fff" strokeWidth="2"/>
                            <circle cx="12" cy="10" r="3" stroke="#fff" strokeWidth="2"/>
                          </svg>
                        }
                        color="#F59E0B"
                        bgColor="rgba(245, 158, 11, 0.08)"
                      />
                    )}

                    {/* City Card */}
                    {link.shodanInfo.city && (
                      <ShodanCard
                        title="City"
                        value={link.shodanInfo.city}
                        icon={
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="#fff" strokeWidth="2"/>
                            <polyline points="9,22 9,12 15,12 15,22" stroke="#fff" strokeWidth="2"/>
                          </svg>
                        }
                        color="#8B5CF6"
                        bgColor="rgba(139, 92, 246, 0.08)"
                      />
                    )}

                    {/* ISP Card */}
                    {link.shodanInfo.isp && (
                      <ShodanCard
                        title="ISP"
                        value={link.shodanInfo.isp}
                        icon={
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M4 6h16M4 10h16M4 14h16M4 18h16" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
                          </svg>
                        }
                        color="#EC4899"
                        bgColor="rgba(236, 72, 153, 0.08)"
                      />
                    )}

                    {/* Open Ports Card */}
                    {link.shodanInfo.openPorts && link.shodanInfo.openPorts.length > 0 && (
                      <ShodanTagsCard
                        title="Open Ports"
                        tags={link.shodanInfo.openPorts}
                        icon={
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        }
                        color="#06B6D4"
                        bgColor="rgba(6, 182, 212, 0.08)"
                      />
                    )}

                    {/* Vulnerabilities Card */}
                    {link.shodanInfo.vulns && Object.keys(link.shodanInfo.vulns).length > 0 && (
                      <ShodanTagsCard
                        title="Vulnerabilities"
                        tags={Object.keys(link.shodanInfo.vulns)}
                        icon={
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        }
                        color="#EF4444"
                        bgColor="rgba(239, 68, 68, 0.08)"
                      />
                    )}

                    {/* Hostnames Card */}
                    {link.shodanInfo.hostnames && link.shodanInfo.hostnames.length > 0 && (
                      <ShodanTagsCard
                        title="Hostnames"
                        tags={link.shodanInfo.hostnames}
                        icon={
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M3 7l9-4 9 4M3 7v10l9 4 9-4V7M3 7l9 4 9-4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        }
                        color="#84CC16"
                        bgColor="rgba(132, 204, 22, 0.08)"
                      />
                    )}

                    {/* Tags Card */}
                    {link.shodanInfo.tags && link.shodanInfo.tags.length > 0 && (
                      <ShodanTagsCard
                        title="Tags"
                        tags={link.shodanInfo.tags}
                        icon={
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 0 1 0 2.828l-7 7a2 2 0 0 1-2.828 0l-7-7A1.994 1.994 0 0 1 3 12V7a4 4 0 0 1 4-4z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        }
                        color="#F97316"
                        bgColor="rgba(249, 115, 22, 0.08)"
                      />
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
} 