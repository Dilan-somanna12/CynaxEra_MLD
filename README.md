# ![CynuxEra Logo](assets/icons/Icon-48.png) CynuxEra Malicious Link Detector

A powerful Chrome extension that scans and detects malicious, phishing, or suspicious links in real-time using hybrid threat intelligence and custom heuristics. Stay safe while browsing with comprehensive security analysis from multiple sources.

![CynaxEra Logo](assets/icons/Icon-128.png)

## ✨ Features

### 🔍 **Real-Time Link Scanning**
- **Automatic Detection**: Scans all links on web pages automatically
- **Manual URL Scanning**: Paste any URL for instant security analysis
- **Background Processing**: Non-intrusive scanning without affecting browsing speed

### 🧠 **Multi-Layer Threat Detection**
- **Custom Heuristics**: Advanced rule-based scoring system
- **VirusTotal Integration**: Real-time analysis from 70+ security vendors
- **Shodan Intelligence**: Network infrastructure and vulnerability analysis
- **Google Safe Browsing**: Protection against known malicious sites

### 📊 **Comprehensive Security Analysis**

#### **VirusTotal Results**
- Malicious detection count from security vendors
- Suspicious activity indicators
- Reputation scores and security tags
- Detailed engine analysis results

#### **Shodan Network Intelligence**
- IP address information and geolocation
- Organization and ISP details
- Open ports and service detection
- Vulnerability assessment
- Network infrastructure analysis

#### **Custom Threat Scoring**
- IP-based domain detection
- Suspicious TLD identification
- Phishing keyword analysis
- URL encoding pattern detection
- HTTP vs HTTPS security assessment

### 🎨 **Modern User Interface**
- **Responsive Design**: Works perfectly on all devices
- **Dark/Light Mode**: Automatic theme detection with manual toggle
- **Real-Time Updates**: Live scan results and status updates
- **Visual Indicators**: Color-coded security status cards
- **Professional Layout**: Clean, modern interface design

### 📈 **Advanced Features**
- **Scan History**: Complete log of all scanned URLs
- **Filtering & Sorting**: Organize results by status, date, or score
- **Statistics Dashboard**: Overview of scan results and trends
- **Export Capabilities**: Save scan results for analysis
- **Rate Limiting**: Smart API usage management

## 🚀 Installation

### Method 1: Chrome Web Store (Recommended)
1. Visit the Chrome Web Store
2. Search for "CynaxEra Malicious Link Detector"
3. Click "Add to Chrome"
4. Confirm the installation

### Method 2: Manual Installation (Developer Mode)
1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension folder
5. The extension will be installed and ready to use

## 📖 Usage Guide

### 🔧 **Getting Started**
1. **Install the Extension**: Follow the installation instructions above
2. **Configure API Keys**: Set up your VirusTotal and Shodan API keys (optional)
3. **Start Browsing**: The extension will automatically scan links on web pages

### 🎯 **Manual URL Scanning**
1. Click the CynaxEra icon in your Chrome toolbar
2. Paste any URL in the input field
3. Click "Scan" to analyze the link
4. View comprehensive security results

### 📋 **Viewing Scan History**
1. Open the extension popup
2. Click "View History" to see all previous scans
3. Filter results by status (Safe, Suspicious, Malicious)
4. Sort by date, score, or URL
5. View detailed analysis for each scan

### 🌙 **Theme Customization**
- **Automatic**: Follows your system theme preference
- **Manual Toggle**: Click the theme button to switch between light/dark modes
- **Persistent**: Your theme preference is saved across sessions

## 🔧 Configuration

### API Keys Setup (Optional)

#### VirusTotal API Key
1. Visit [VirusTotal](https://www.virustotal.com/gui/join-us)
2. Create a free account
3. Get your API key from the account settings
4. Update the key in `api/virustotal.js`

#### Shodan API Key
1. Visit [Shodan](https://account.shodan.io/register)
2. Create a free account
3. Get your API key from the account dashboard
4. Update the key in `api/shodan.js`

### Rate Limits
- **VirusTotal**: 500 requests per day (free tier)
- **Shodan**: 1 request per second (free tier)
- **Google Safe Browsing**: 10,000 requests per day (free tier)

## 🏗️ Technical Architecture

### 📁 Project Structure
```
malicious-link-detector/
├── manifest.json              # Extension configuration
├── background.js              # Service worker for API calls
├── content.js                 # Content script for link extraction
├── popup/                     # User interface
│   ├── src/
│   │   ├── Popup.jsx         # Main popup component
│   │   ├── history.jsx       # History page component
│   │   └── Popup.css         # Styling
│   ├── index.html            # Popup entry point
│   └── history.html          # History page entry point
├── api/                       # API integrations
│   ├── virustotal.js         # VirusTotal API client
│   ├── shodan.js             # Shodan API client
│   └── googleSafeBrowsing.js # Google Safe Browsing API
├── utils/                     # Utility functions
│   └── threatScore.js        # Custom threat scoring logic
└── assets/                    # Icons and resources
    └── icons/
```

### 🔧 **Core Components**

#### **Background Script (`background.js`)**
- Handles API calls to VirusTotal, Shodan, and Google Safe Browsing
- Manages scan result storage and retrieval
- Coordinates between content script and popup

#### **Content Script (`content.js`)**
- Extracts all links from web pages
- Sends link data to background script for analysis
- Provides real-time link scanning

#### **Popup Interface (`popup/`)**
- Modern React-based user interface
- Displays scan results and statistics
- Provides manual URL scanning functionality
- Shows detailed security analysis

### 🧠 **Threat Detection Logic**

#### **Custom Scoring System**
```javascript
finalScore = customScore + virusTotalFlag * 3 + safeBrowsingFlag * 3
```

**Custom Score Factors:**
- IP-based domain: +2 points
- Suspicious TLD: +2 points
- Phishing keywords: +1 per word
- Long URLs: +1 point
- HTTP protocol: +2 points
- Encoded patterns: +1 point
- Too many subdomains: +1 point

**Final Score Classification:**
- **0-2**: ✅ Safe
- **3-6**: ⚠️ Suspicious
- **7+**: ❌ Malicious

## 🛡️ Security Features

### **Privacy Protection**
- All scanning is done locally and through secure APIs
- No personal data is collected or transmitted
- Scan results are stored locally in your browser
- API keys are stored securely in extension storage

### **API Security**
- Secure API key handling
- Rate limiting to prevent abuse
- Error handling for failed requests
- Fallback mechanisms for offline operation

### **Data Protection**
- Local storage only - no external data transmission
- Encrypted storage for sensitive information
- Automatic cleanup of old scan data
- User control over data retention

## 🎯 **Use Cases**

### **Personal Security**
- Protect against phishing attacks
- Avoid malicious websites
- Verify link safety before clicking
- Monitor browsing security

### **Business Applications**
- Secure corporate browsing
- Protect against data breaches
- Monitor employee web activity
- Compliance with security policies

### **Educational Purposes**
- Learn about web security threats
- Understand phishing techniques
- Study network infrastructure
- Research cybersecurity trends

## 🔄 **Development**

### **Prerequisites**
- Node.js (v14 or higher)
- npm or yarn package manager
- Chrome browser for testing

### **Setup Development Environment**
```bash
# Clone the repository
git clone https://github.com/your-username/cynaxera-malicious-link-detector.git
cd malicious-link-detector

# Install dependencies
cd popup
npm install

# Build the extension
npm run build

# Load in Chrome
# 1. Open chrome://extensions/
# 2. Enable Developer mode
# 3. Click "Load unpacked"
# 4. Select the project folder
```

### **Building for Production**
```bash
# Build optimized version
npm run build

# The built files will be in popup/dist/
```

## 🤝 **Contributing**

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** and test thoroughly
4. **Commit your changes**: `git commit -m 'Add amazing feature'`
5. **Push to the branch**: `git push origin feature/amazing-feature`
6. **Open a Pull Request**

### **Development Guidelines**
- Follow the existing code style
- Add comments for complex logic
- Test thoroughly before submitting
- Update documentation as needed
- Ensure all features work in both light and dark modes

## 📝 **Changelog**

### **Version 1.0.0** (Current)
- ✅ Initial release
- ✅ Real-time link scanning
- ✅ VirusTotal integration
- ✅ Shodan network intelligence
- ✅ Modern responsive UI
- ✅ Dark/light theme support
- ✅ Scan history and filtering
- ✅ Comprehensive security analysis

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 **Acknowledgments**

- **VirusTotal**: For providing comprehensive URL analysis
- **Shodan**: For network intelligence and vulnerability data
- **Google Safe Browsing**: For phishing and malware protection
- **React**: For the modern user interface framework
- **Chrome Extensions API**: For the extension platform

## 📞 **Support**

### **Getting Help**
- **Documentation**: Check this README for usage instructions
- **Issues**: Report bugs or request features on GitHub
- **Discussions**: Join community discussions for help and ideas

### **Common Issues**

#### **Extension Not Working**
1. Check if the extension is enabled in Chrome
2. Verify API keys are correctly configured
3. Check browser console for error messages
4. Ensure you have an active internet connection

#### **API Rate Limits**
- VirusTotal: 500 requests per day (free tier)
- Shodan: 1 request per second (free tier)
- Consider upgrading to paid plans for higher limits

#### **Scan Results Not Showing**
1. Check if the URL is valid and accessible
2. Verify API keys are working
3. Check browser console for error messages
4. Try refreshing the page and scanning again

## 🌟 **Star History**

If you find this project helpful, please consider giving it a ⭐ on GitHub!

---

**Made with ❤️ by CynaxEra**

*Protecting users from malicious links, one scan at a time.* 
