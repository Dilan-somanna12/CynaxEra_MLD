// Listen for messages from content scripts
import { getCustomThreatScore } from './utils/threatScore.js';
import * as virustotal from './api/virustotal.js';
import * as gsb from './api/googleSafeBrowsing.js';
import { getShodanInfo } from './api/shodan.js';

function isIPDomain(url) {
  try {
    const { hostname } = new URL(url);
    return /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname) ? hostname : null;
  } catch {
    return null;
  }
}

// Helper to resolve a domain to its IP using Shodan's DNS API, with Google DNS fallback
async function getIpForUrl(url) {
  try {
    const { hostname } = new URL(url);
    // If already an IP, return it
    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)) return hostname;
    const SHODAN_API_KEY = 'A7g7MWwsZpTIQ4ProxBrBipuEPTSpanG'; // Use your actual key
    // Try Shodan DNS resolve first
    let res = await fetch(`https://api.shodan.io/dns/resolve?hostnames=${hostname}&key=${SHODAN_API_KEY}`);
    let data = await res.json();
    if (data[hostname]) {
      console.log('Resolved IP using Shodan:', data[hostname]);
      return data[hostname];
    }
    // Fallback: Google DNS over HTTPS
    res = await fetch(`https://dns.google/resolve?name=${hostname}&type=A`);
    data = await res.json();
    if (data && data.Answer && data.Answer.length > 0) {
      // Find the first A record
      const answer = data.Answer.find(a => a.type === 1); // type 1 = A
      if (answer && answer.data) {
        console.log('Resolved IP using Google DNS:', answer.data);
        return answer.data;
      }
    }
    console.warn('Could not resolve IP for', hostname, 'using Shodan or Google DNS');
  } catch (e) {
    console.warn('DNS resolve error for', url, e);
  }
  return null;
}

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.type === 'PAGE_URL' && typeof message.url === 'string') {
    const url = message.url;
    const customScore = getCustomThreatScore(url);
    let virusTotalResult = { flagged: 0, message: 'VirusTotal scan not available' };
    try {
      virusTotalResult = await virustotal.getDetailedScanInfo(url);
    } catch (e) {
      console.warn('VirusTotal error for', url, e);
      virusTotalResult = { flagged: 0, message: `VirusTotal error: ${e.message}` };
    }
    let safeBrowsingFlag = 0;
    let shodanInfo = null;
    // Always resolve to IP
    let ip = isIPDomain(url);
    if (!ip) {
      ip = await getIpForUrl(url);
    }
    if (ip) {
      try {
        shodanInfo = await getShodanInfo(ip);
      } catch (e) {
        console.warn('Shodan error for', ip, e);
      }
    }
    const finalScore = customScore + virusTotalResult.flagged * 3 + safeBrowsingFlag * 3;
    let status = '✅ Safe';
    if (finalScore >= 7) status = '❌ Malicious';
    else if (finalScore >= 3) status = '⚠️ Suspicious';
    const result = { 
      url, 
      customScore, 
      virusTotalResult, 
      safeBrowsingFlag, 
      finalScore, 
      status, 
      shodanInfo, 
      scannedAt: Date.now() 
    };
    // Append to scanResults array in storage
    chrome.storage.local.get(['scanResults'], (data) => {
      const prev = Array.isArray(data.scanResults) ? data.scanResults : [];
      const updated = [result, ...prev];
      chrome.storage.local.set({ scanResults: updated });
    });
  }
  if (message.type === 'PAGE_LINKS' && Array.isArray(message.links)) {
    console.log('Received links from content script:', message.links);
    const results = [];
    for (const url of message.links) {
      const customScore = getCustomThreatScore(url);
      let virusTotalResult = { flagged: 0, message: 'VirusTotal scan not available' };
      try {
        virusTotalResult = await virustotal.getDetailedScanInfo(url);
      } catch (e) {
        console.warn('VirusTotal error for', url, e);
        virusTotalResult = { flagged: 0, message: `VirusTotal error: ${e.message}` };
      }
      let safeBrowsingFlag = 0;
      let shodanInfo = null;
      // Always resolve to IP
      let ip = isIPDomain(url);
      if (!ip) {
        ip = await getIpForUrl(url);
      }
      if (ip) {
        try {
          shodanInfo = await getShodanInfo(ip);
        } catch (e) {
          console.warn('Shodan error for', ip, e);
        }
      }
      const finalScore = customScore + virusTotalResult.flagged * 3 + safeBrowsingFlag * 3;
      let status = '✅ Safe';
      if (finalScore >= 7) status = '❌ Malicious';
      else if (finalScore >= 3) status = '⚠️ Suspicious';
      const result = { 
        url, 
        customScore, 
        virusTotalResult, 
        safeBrowsingFlag, 
        finalScore, 
        status, 
        shodanInfo 
      };
      results.push(result);
      console.log(result);
    }
    // Store results for popup UI
    chrome.storage.local.set({ scanResults: results });
  }
});
