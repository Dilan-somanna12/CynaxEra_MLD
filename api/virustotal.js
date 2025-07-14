const VIRUSTOTAL_API_KEY = 'dd0e34417b7a7662d917f85a0ffa70349e0d11090c28a5e287a58c4e4d97a009';
const BASE_URL = 'https://www.virustotal.com/api/v3/urls';

// Rate limiting - VirusTotal allows 500 requests per day
let requestCount = 0;
const MAX_REQUESTS_PER_DAY = 500;
const REQUESTS_KEY = 'virustotal_requests';

// Load request count from storage
async function loadRequestCount() {
  if (window.chrome && chrome.storage && chrome.storage.local) {
    return new Promise((resolve) => {
      chrome.storage.local.get([REQUESTS_KEY], (result) => {
        const data = result[REQUESTS_KEY] || { count: 0, date: new Date().toDateString() };
        // Reset count if it's a new day
        if (data.date !== new Date().toDateString()) {
          data.count = 0;
          data.date = new Date().toDateString();
        }
        requestCount = data.count;
        resolve(data);
      });
    });
  }
  return { count: 0, date: new Date().toDateString() };
}

// Save request count to storage
async function saveRequestCount() {
  if (window.chrome && chrome.storage && chrome.storage.local) {
    const data = { count: requestCount, date: new Date().toDateString() };
    chrome.storage.local.set({ [REQUESTS_KEY]: data });
  }
}

// Helper to base64-url encode a URL (as required by VirusTotal)
function base64UrlEncode(str) {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Check if we can make a request (rate limiting)
async function canMakeRequest() {
  await loadRequestCount();
  return requestCount < MAX_REQUESTS_PER_DAY;
}

// Increment request count
async function incrementRequestCount() {
  requestCount++;
  await saveRequestCount();
}

// Submit a URL for scanning
export async function scanUrl(url) {
  if (!await canMakeRequest()) {
    throw new Error('VirusTotal daily limit reached (500 requests/day)');
  }

  try {
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'x-apikey': VIRUSTOTAL_API_KEY,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `url=${encodeURIComponent(url)}`
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('VirusTotal rate limit exceeded. Please try again later.');
      } else if (response.status === 401) {
        throw new Error('VirusTotal API key invalid or expired.');
      } else {
        throw new Error(`VirusTotal scan failed: ${response.status} ${response.statusText}`);
      }
    }

    await incrementRequestCount();
    const data = await response.json();
    return data.data.id; // scan ID
  } catch (error) {
    console.error('VirusTotal scan error:', error);
    throw error;
  }
}

// Fetch scan result by scan ID (or encoded URL)
export async function getScanResult(url) {
  if (!await canMakeRequest()) {
    throw new Error('VirusTotal daily limit reached (500 requests/day)');
  }

  try {
    const encoded = base64UrlEncode(url);
    const response = await fetch(`${BASE_URL}/${encoded}`, {
      headers: {
        'x-apikey': VIRUSTOTAL_API_KEY
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        // URL not found in VirusTotal database
        return {
          flagged: 0,
          total: 0,
          malicious: 0,
          suspicious: 0,
          harmless: 0,
          undetected: 0,
          status: 'not_found',
          message: 'URL not found in VirusTotal database'
        };
      } else if (response.status === 429) {
        throw new Error('VirusTotal rate limit exceeded. Please try again later.');
      } else if (response.status === 401) {
        throw new Error('VirusTotal API key invalid or expired.');
      } else {
        throw new Error(`VirusTotal result fetch failed: ${response.status} ${response.statusText}`);
      }
    }

    await incrementRequestCount();
    const data = await response.json();
    
    // Extract detailed statistics
    const stats = data.data.attributes.last_analysis_stats;
    const total = (stats.malicious || 0) + (stats.suspicious || 0) + (stats.harmless || 0) + (stats.undetected || 0);
    const flagged = (stats.malicious || 0) + (stats.suspicious || 0);
    
    // Get detailed results from engines
    const analysis = data.data.attributes.last_analysis_results || {};
    const engineResults = Object.entries(analysis).map(([engine, result]) => ({
      engine,
      category: result.category,
      result: result.result
    }));

    return {
      flagged: flagged > 0 ? 1 : 0, // Legacy compatibility
      total,
      malicious: stats.malicious || 0,
      suspicious: stats.suspicious || 0,
      harmless: stats.harmless || 0,
      undetected: stats.undetected || 0,
      status: flagged > 0 ? 'flagged' : 'clean',
      message: flagged > 0 ? `${flagged} security vendors flagged this URL` : 'No security vendors flagged this URL',
      engineResults,
      scanDate: data.data.attributes.last_analysis_date,
      firstSeen: data.data.attributes.first_submission_date,
      lastSeen: data.data.attributes.last_submission_date,
      reputation: data.data.attributes.reputation || 0,
      tags: data.data.attributes.tags || [],
      categories: data.data.attributes.categories || {}
    };
  } catch (error) {
    console.error('VirusTotal result fetch error:', error);
    throw error;
  }
}

// Get remaining requests for the day
export async function getRemainingRequests() {
  await loadRequestCount();
  return Math.max(0, MAX_REQUESTS_PER_DAY - requestCount);
}

// Get detailed scan information for display
export async function getDetailedScanInfo(url) {
  try {
    const result = await getScanResult(url);
    
    // If URL not found, try to submit it for scanning
    if (result.status === 'not_found') {
      try {
        await scanUrl(url);
        return {
          ...result,
          message: 'URL submitted for scanning. Results will be available shortly.',
          status: 'submitted'
        };
      } catch (scanError) {
        return {
          ...result,
          message: `URL not found and could not be submitted: ${scanError.message}`,
          status: 'error'
        };
      }
    }
    
    return result;
  } catch (error) {
    return {
      flagged: 0,
      total: 0,
      malicious: 0,
      suspicious: 0,
      harmless: 0,
      undetected: 0,
      status: 'error',
      message: `VirusTotal error: ${error.message}`,
      engineResults: []
    };
  }
}
