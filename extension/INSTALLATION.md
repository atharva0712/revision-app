# Learning Content Extractor - Chrome Extension Installation Guide

## Prerequisites

1. **Backend Server**: Make sure the backend server is running on `http://localhost:3000`
   ```bash
   cd backend
   npm run dev
   ```

2. **Built Extension**: The extension must be built (this should already be done)
   ```bash
   cd extension
   npm run build
   ```

## Installation Steps

1. **Open Chrome Extensions Page**
   - Open Google Chrome
   - Go to `chrome://extensions/`
   - Or click the three dots menu → More Tools → Extensions

2. **Enable Developer Mode**
   - Toggle the "Developer mode" switch in the top-right corner

3. **Load the Extension**
   - Click "Load unpacked"
   - Navigate to and select the `extension/dist` folder
   - The extension should now appear in your extensions list

4. **Pin the Extension (Optional)**
   - Click the puzzle piece icon in the Chrome toolbar
   - Find "Learning Content Extractor" and click the pin icon

## How to Use

1. **First Time Setup**
   - Click the extension icon in your Chrome toolbar
   - Register a new account or login with existing credentials
   - The extension will connect to the backend at `http://localhost:3000`

2. **Extract Content from Web Pages**
   - Navigate to any web page with substantial content
   - Click the extension icon
   - Click "Scan Page" to extract content and generate learning topics
   - The extension will automatically:
     - Extract text content from the current page
     - Send it to the backend for AI-powered topic analysis
     - Display generated learning topics
     - Save the extraction to your recent scans

3. **View Your Dashboard**
   - Click "Dashboard" in the extension popup to open the full dashboard
   - This will open a new tab with your complete learning management interface

4. **Recent Scans**
   - The extension remembers your recent content extractions
   - Use the "Load" button on recent scans to quickly revisit previous extractions

## Features

- **Smart Content Extraction**: Intelligently extracts main content from web pages
- **AI-Powered Topic Generation**: Uses OpenAI to generate relevant learning topics
- **Context Menu Integration**: Right-click on pages for quick content extraction
- **Visual Indicators**: Shows a floating indicator when extension is active
- **Recent History**: Keeps track of your last 5 content extractions
- **Secure Authentication**: JWT-based authentication with the backend
- **Cross-Browser Permissions**: Designed to work across all domains

## Troubleshooting

1. **Extension not loading**: Make sure you selected the `dist` folder, not the root extension folder
2. **Cannot connect to backend**: Verify the backend is running on `http://localhost:3000`
3. **Content extraction fails**: Check browser console for errors, ensure content script permissions
4. **Authentication issues**: Try logging out and back in, check token storage

## File Structure

The built extension includes:
- `manifest.json` - Extension configuration
- `index.html` - Popup interface
- `background.js` - Service worker for background operations
- `content.js` - Content script for web page interaction
- `icons/` - Extension icons
- `assets/` - Built React application files

## Development

To make changes to the extension:
1. Edit files in the `src/` directory
2. Run `npm run build` to rebuild
3. Click "Reload" on the extension in `chrome://extensions/`

The extension supports hot reloading during development for the popup interface, but background script changes require manual reload.