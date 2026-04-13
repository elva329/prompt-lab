

# Prompt Lab 🧪

Prompt Lab is a web application for creating, managing, and evaluating AI prompts. Test multiple prompts, track quality metrics, and analyze results with a simple dashboard.

---

Live Demo: https://prompt-lab-test.vercel.app/ 

---

## Features

- Manage a library of AI prompts (CRUD)
- Run experiments to compare prompts
- Automated quality metrics (clarity, relevance, coherence, completeness)
- Analytics dashboard
- User authentication (JWT)
- Responsive design (mobile & desktop)

---

## Tech Stack

- **Frontend:** Vue 3, TypeScript, Bootstrap 5
- **Backend:** Node.js, Express, MongoDB
- **Other:** Vite, JWT, dotenv

---

## Prerequisites

- Node.js v16+
- npm or yarn
- MongoDB (local or Atlas)

---

## Installation

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd prompt-lab
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```

---

## Environment Setup

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Edit `.env` and set your MongoDB URI and JWT secret.

---

## Running the App

1. **Start backend server:**
   ```bash
   npm run dev:server
   ```
2. **Start frontend dev server:**
   ```bash
   npm run dev
   ```
3. Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Database Setup (MongoDB Atlas)

1. Go to `prompts/prompt_library.json`.
2. In MongoDB Atlas, use "Add Data" → "Import JSON or CSV".
3. Set collection name to `prompt_library` and import.
4. Create empty collections (`users`, `results`, `experiments`, `favorite_prompts`) manually in Atlas for verification/testing.

---

## Basic Usage

1. Register a new user account.
2. Browse and search prompts in the library.
3. Add prompts to favorites.
4. Select prompts and run experiments.
5. View analytics dashboard for results.

---

## Project Structure

```
prompt-lab/
├── prompts/                # Prompt data (JSON)
├── server/                 # Backend (Express, MongoDB)
├── src/                    # Frontend (Vue 3)
├── .env.example            # Example environment config
└── package.json
```

---

## Build & Test

```bash
npm run lint      # Lint code
npm run build     # Build for production
npm run preview   # Preview production build
```
