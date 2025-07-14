const SHODAN_API_KEY = 'A7g7MWwsZpTIQ4ProxBrBipuEPTSpanG';

// Helper to resolve a domain to IP (Shodan DNS, then Google DNS fallback)
async function resolveIp(domainOrIp) {
  // If already an IP, return as is
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(domainOrIp)) return { ip: domainOrIp, resolver: 'direct' };
  // Try Shodan DNS
  let res = await fetch(`https://api.shodan.io/dns/resolve?hostnames=${domainOrIp}&key=${SHODAN_API_KEY}`);
  let data = await res.json();
  if (data[domainOrIp]) return { ip: data[domainOrIp], resolver: 'shodan' };
  // Fallback: Google DNS
  res = await fetch(`https://dns.google/resolve?name=${domainOrIp}&type=A`);
  data = await res.json();
  if (data && data.Answer && data.Answer.length > 0) {
    const answer = data.Answer.find(a => a.type === 1);
    if (answer && answer.data) return { ip: answer.data, resolver: 'google' };
  }
  return { ip: null, resolver: null };
}

// Accepts domain or IP
export async function getShodanInfo(domainOrIp) {
  try {
    const { ip, resolver } = await resolveIp(domainOrIp);
    if (!ip) return { error: 'Could not resolve IP' };
    const hostUrl = `https://api.shodan.io/shodan/host/${ip}?key=${SHODAN_API_KEY}`;
    const reverseDnsUrl = `https://api.shodan.io/dns/reverse?ips=${ip}&key=${SHODAN_API_KEY}`;
    const [hostRes, reverseRes] = await Promise.all([
      fetch(hostUrl),
      fetch(reverseDnsUrl)
    ]);
    const hostData = await hostRes.json();
    const reverseData = await reverseRes.json();
    return {
      ip,
      resolver, // 'shodan', 'google', or 'direct'
      org: hostData.org,
      isp: hostData.isp,
      country: hostData.country_name,
      city: hostData.city,
      tags: hostData.tags,
      openPorts: hostData.ports,
      hostnames: reverseData[ip] || hostData.hostnames || [],
      lastUpdate: hostData.last_update,
      vulns: hostData.vulns,
      raw: hostData
    };
  } catch (err) {
    return { error: 'Shodan API failed' };
  }
} 