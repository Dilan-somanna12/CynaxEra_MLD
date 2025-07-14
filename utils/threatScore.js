// List of suspicious TLDs
const suspiciousTLDs = [
  '.tk', '.xyz', '.top', '.club', '.info', '.work', '.support', '.loan', '.gq', '.ml', '.cf', '.ga'
];

// List of phishing keywords
const phishingKeywords = [
  'login', 'verify', 'update', 'secure', 'account', 'bank', 'paypal', 'signin', 'password', 'confirm', 'security', 'webscr', 'ebay', 'appleid', 'reset', 'unlock', 'limited', 'urgent', 'alert', 'suspend', 'validate'
];

function isIPDomain(url) {
  try {
    const { hostname } = new URL(url);
    return /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname);
  } catch {
    return false;
  }
}

function hasSuspiciousTLD(url) {
  try {
    const { hostname } = new URL(url);
    return suspiciousTLDs.some(tld => hostname.endsWith(tld));
  } catch {
    return false;
  }
}

function countPhishingKeywords(url) {
  const lower = url.toLowerCase();
  return phishingKeywords.reduce((count, word) => lower.includes(word) ? count + 1 : count, 0);
}

function isLong(url) {
  return url.length > 100 ? 1 : 0;
}

function isHttp(url) {
  return url.startsWith('http://') ? 1 : 0;
}

function hasEncodedPatterns(url) {
  return /%[0-9a-fA-F]{2}/.test(url) ? 1 : 0;
}

function tooManySubdomains(url) {
  try {
    const { hostname } = new URL(url);
    return hostname.split('.').length > 4 ? 1 : 0;
  } catch {
    return 0;
  }
}

function getCustomThreatScore(url) {
  let score = 0;
  score += isIPDomain(url) ? 2 : 0;
  score += hasSuspiciousTLD(url) ? 2 : 0;
  score += countPhishingKeywords(url);
  score += isLong(url);
  score += isHttp(url) ? 2 : 0;
  score += hasEncodedPatterns(url);
  score += tooManySubdomains(url);
  return score;
}

export { getCustomThreatScore };
