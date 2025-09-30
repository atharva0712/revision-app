# Revision App

This project is a full-stack application designed to help users revise and study topics by leveraging AI to generate learning materials like flashcards and quizzes from uploaded documents and web content.

## Project Structure

The project is a monorepo-style repository containing three distinct packages:

-   `backend/`: A Node.js (Express) and TypeScript API that handles user authentication, data persistence, and the core AI-powered content generation services.
-   `dashboard-app/`: A React (Vite) and TypeScript single-page application that provides the main user interface for the platform.
-   `extension/`: A browser extension for capturing content from web pages.

## Getting Started

### Prerequisites

-   Node.js (v18 or later)
-   npm (v9 or later)
-   MongoDB instance (local or cloud)

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd revision-app
    ```

2.  **Backend Setup:**
    ```bash
    cd backend
    npm install
    ```
    -   Create a `.env` file by copying the example: `cp .env.example .env`
    -   Fill in the required values in your new `.env` file (MongoDB URI, JWT Secret, etc.).
    -   Run the backend server:
        ```bash
        npm run dev
        ```
    -   The API will be running on the port specified in your `.env` file (default: 3001).

3.  **Frontend (Dashboard) Setup:**
    ```bash
    cd ../dashboard-app
    npm install
    ```
    -   Create a `.env` file by copying the example: `cp .env.example .env`
    -   Ensure the `VITE_API_URL` in your `.env` file points to the correct backend address.
    -   Run the development server:
        ```bash
        npm run dev
        ```
    -   The dashboard will be accessible at `http://localhost:5173`.

4.  **Browser Extension Setup:**
    -   Navigate to the `extension` directory.
    -   Follow the instructions in `INSTALLATION.md` to load the extension in your browser.
