const GOOGLE_API_KEY = 'YOUR_GOOGLE_SAFE_BROWSING_API_KEY';
const API_URL = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${GOOGLE_API_KEY}`;

export async function checkUrlSafeBrowsing(url) {
  const body = {
    client: {
      clientId: 'cynaxera-malicious-link-detector',
      clientVersion: '1.0.0'
    },
    threatInfo: {
      threatTypes: [
        'MALWARE',
        'SOCIAL_ENGINEERING',
        'UNWANTED_SOFTWARE',
        'POTENTIALLY_HARMFUL_APPLICATION'
      ],
      platformTypes: ['ANY_PLATFORM'],
      threatEntryTypes: ['URL'],
      threatEntries: [
        { url }
      ]
    }
  };

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
  if (!response.ok) throw new Error('Google Safe Browsing check failed');
  const data = await response.json();
  // If matches found, URL is unsafe
  return data && data.matches && data.matches.length > 0 ? 1 : 0;
}
