# Learning Content Extractor Chrome Extension

A Chrome extension built with React + TypeScript + Vite that extracts learning content from web pages and organizes it into topics.

## Features

- Extract text content from any web page
- Automatically categorize content by type (article, code, reference, etc.)
- Send extracted content to backend for topic analysis
- Clean, modern popup interface
- Word count and metadata tracking

## Development

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Chrome browser for testing

### Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build for development:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build:extension
   ```

### Loading the Extension in Chrome

1. Build the extension:
   ```bash
   npm run build:extension
   ```

2. Open Chrome and go to `chrome://extensions/`

3. Enable "Developer mode" in the top right corner

4. Click "Load unpacked" and select the `dist/` folder from this project

5. The extension should now appear in your extensions list

## Project Structure

```
extension-popup/
├── src/
│   ├── components/
│   │   ├── ScanPage.tsx          # Main scan interface
│   │   ├── TopicsPreview.tsx     # Display extracted topics
│   │   └── TopicItem.tsx         # Individual topic component
│   ├── App.tsx                   # Main app component
│   ├── main.tsx                  # App entry point
│   └── index.css                 # Styles with Tailwind
├── public/
│   ├── background.js             # Extension background script
│   ├── content.js                # Content script for page extraction
│   └── vite.svg                  # Extension icon
├── manifest.json                 # Extension manifest
├── dist/                         # Built extension (after npm run build)
└── package.json
```

## Configuration

The extension currently connects to a backend at `http://localhost:3000/api/extract-topics`. Update the `BACKEND_URL` constant in `src/App.tsx` to point to your backend server.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:extension` - Build and prepare extension for deployment
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Technical Details

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Extension API**: Chrome Extension Manifest V3
- **Content Extraction**: Custom content script with intelligent text selection

## Browser Permissions

The extension requires the following permissions:
- `activeTab` - Access the currently active tab
- `storage` - Store extracted content locally
- `scripting` - Inject content scripts
- Host permission for `http://localhost:3000/*` for backend communication