# Revision App

A comprehensive study revision application with browser extension, web dashboard, and backend API integration. Designed to help students organize and optimize their revision process.

## 🏗️ Project Structure

This is a monorepo containing three main components:

```
revision-app/
├── backend/          # Node.js/Express API server
├── dashboard-app/    # React web dashboard
├── extension/        # Chrome browser extension
└── README.md        # This file
```

## 📱 Components

### 🖥️ Dashboard App (`dashboard-app/`)
- **Tech Stack**: React 19, TypeScript, Vite, TailwindCSS
- **Purpose**: Web-based dashboard for managing revision sessions and data
- **Features**: Modern React application with responsive design

### 🔧 Backend (`backend/`)
- **Tech Stack**: Node.js, Express, TypeScript, MongoDB, OpenAI API
- **Purpose**: REST API server providing data and AI-powered features
- **Features**: 
  - PDF parsing and processing
  - AI integration for smart revision suggestions
  - User authentication and data management
  - Rate limiting and security middleware

### 🌐 Browser Extension (`extension/`)
- **Tech Stack**: React, TypeScript, Chrome Extension APIs
- **Purpose**: Browser extension for seamless revision workflow integration
- **Features**: Modern popup interface with content script integration

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or later)
- npm or yarn
- MongoDB (for backend)
- Chrome browser (for extension development)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/revision-app.git
   cd revision-app
   ```

2. **Install dependencies for each component**
   ```bash
   # Backend
   cd backend
   npm install
   cd ..

   # Dashboard App
   cd dashboard-app
   npm install
   cd ..

   # Extension
   cd extension
   npm install
   cd ..
   ```

### Development

#### Backend
```bash
cd backend
# Copy environment variables
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

#### Dashboard App
```bash
cd dashboard-app
npm run dev
```

#### Browser Extension
```bash
cd extension
npm run dev
# For building the extension:
npm run build:extension
# Then load the `dist/` folder as an unpacked extension in Chrome
```

## 🔧 Configuration

### Backend Configuration
Create a `.env` file in the `backend/` directory with:
- MongoDB connection string
- OpenAI API key
- JWT secret
- Other API keys as needed

### Extension Development
- Load the extension in Chrome developer mode
- Point to the `extension/dist/` folder after building

## 📂 Key Files

- `backend/src/server.ts` - Main server entry point
- `dashboard-app/src/App.tsx` - Dashboard main component
- `extension/src/main.tsx` - Extension popup entry point
- `extension/manifest.json` - Extension configuration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🔗 Links

- [Backend Documentation](./backend/README.md)
- [Dashboard Documentation](./dashboard-app/README.md)  
- [Extension Documentation](./extension/README.md)