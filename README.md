# Prompt Lab 🧪

A comprehensive web application for creating, managing, and evaluating AI prompts. Test multiple prompts side-by-side, track quality metrics, and analyze results with an intuitive dashboard.

**Status:** ✅ Production Ready | **Version:** 1.0.0

---

## 🎯 Overview

Prompt Lab is a full-stack web application that allows users to:
- 📚 Browse and manage a library of AI prompts
- ⭐ Save favorite prompts with customization
- 🧪 Run batch experiments by testing multiple prompts simultaneously
- 📊 Evaluate AI responses with automated quality metrics
- 📈 View comprehensive analytics and performance trends
- 🤖 Integrate with AI models (HKBU GenAI API)

### Key Features

✅ **Prompt Management**
- Full CRUD operations on prompt library
- Full-text search and category filtering
- Customizable favorites with personal modifications

✅ **Experiment Runner**
- Test 1-3 prompts in a single experiment
- Side-by-side layout for single prompts
- Real-time progress tracking
- Automated quality evaluation

✅ **Quality Metrics** 
- Overall Quality Score (0-100)
- Clarity, Relevance, Coherence, Completeness dimensions
- Response time tracking
- Token usage analytics

✅ **Analytics Dashboard**
- Multiple visualization types (pie, column, donut, line charts)
- Aggregated statistics and trends
- Category distributions
- Top-performing prompts

✅ **Secure Authentication**
- User registration and login
- JWT token-based authentication
- Password hashing with bcrypt
- Protected API endpoints

✅ **Responsive Design**
- Mobile-first approach
- Adapts seamlessly from mobile to desktop
- Bootstrap 5 grid system
- Modern glassmorphism UI

---

## 🛠 Tech Stack

### Frontend
- **Vue 3** - Reactive UI framework
- **Vue Router 4** - Client-side routing
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **Bootstrap 5** - Responsive CSS framework
- **AMCharts 5** - Advanced data visualizations

### Backend
- **Node.js** - JavaScript runtime
- **Express 5** - Web framework
- **MongoDB** - Document database
- **JWT** - Token-based authentication
- **Bcrypt** - Password hashing

### DevTools
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **dotenv** - Environment configuration

---

## 🏛 System Architecture

### 1. Overall Architecture
The system follows a three-tier client-server architecture with clear separation between frontend, backend, and database layers.

| Layer | Technology | Responsibility |
|-------|-----------|-----------------|
| Frontend | Vue 3 + TypeScript + Composition API | UI rendering, state management, user interaction |
| Backend | Node.js + Express | API handling, authentication, business logic |
| Database | MongoDB | Data persistence, indexing, aggregation |
| External | HKBU GenAI API | AI response generation (extended feature) |

### 2. Frontend Architecture
The frontend is organized into three layers:

- **UI Layer**: Vue components (pages: Login, LandingPage, PromptsPage, FavoritesPage, ExperimentsPage, AnalyticsPage; reusable components: cards, modals, charts)
- **State Layer**: Vue Composition API with `reactive()` and `computed()` (appStore.ts manages user, prompts, experiments state)
- **Service Layer**: API abstraction modules (promptsApi.ts, authApi.ts, resultsApi.ts, etc.) that handle HTTP communication

**Data Flow**: User Action → Component → Service Layer → Backend → State Update → UI Re-render

**Responsive Design**: Bootstrap 5 grid system with mobile-first layout and CSS flexbox positioning.

### 3 Backend Architecture
The backend uses a layered request processing pipeline:

```
Request → CORS → JSON Parser → JWT Auth → Route Handler → Database → Response
```

Each layer has a specific responsibility:
- **CORS and JSON parser**: Handle cross-origin requests and body parsing
- **JWT middleware**: Verify authentication tokens for protected routes
- **Route handlers**: Execute controller logic
- **Database operations**: Query and persist data in MongoDB
- **Error handler**: Standardize all error responses with consistent format

---

## 📋 Prerequisites

Before you begin, ensure you have installed:
- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (local or Atlas) - [Setup Guide](https://www.mongodb.com/docs/manual/installation/)
- **npm** or **yarn** - Package manager

---

## 🚀 Quick Start

### 1. Clone & Install Dependencies

```bash
# Navigate to project directory
cd prompt-lab

# Install all dependencies
npm install
```

### 2. Environment Configuration

Create a `.env` file in the project root:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_NAME=prompt-lab

# JWT Configuration
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRATION=7d

# Server Port
PORT=4000

# AI Model Configuration (HKBU GenAI API)
VITE_CUSTOM_API_KEY=your-api-key-here
VITE_CUSTOM_BASE_URL=https://genai.hkbu.edu.hk/api/v0/rest
VITE_CUSTOM_MODEL=gpt-5-mini
VITE_CUSTOM_API_VERSION=2024-12-01-preview

# Frontend API URL
VITE_API_BASE_URL=http://localhost:4000
```

### 3. Start Development Servers

**Terminal 1 - Backend Server:**
```bash
npm run dev:server
# Output: Auth API running on http://localhost:4000
```

**Terminal 2 - Frontend Dev Server:**
```bash
npm run dev
# Output: VITE v7.x.x ready in xxx ms
#         ➜  Local:   http://localhost:5173/
```

### 4. Access the Application

Open your browser and navigate to:
```
http://localhost:5173
```

---

## 📚 Usage Guide

### First Time Setup

1. **Create Account**
   - Click "Register" on the login page
   - Enter email and password (min 6 characters)
   - Account is created and you're automatically logged in

2. **Browse Prompts**
   - Navigate to "Prompt Library"
   - Search by keyword or filter by category
   - Click on any prompt to see details

3. **Save Favorites**
   - Click the heart icon on any prompt
   - Customize title, category, or content in "Your Favorites"
   - Edit or remove favorites anytime

4. **Run Experiments**
   - Select 1-3 prompts to test
   - Click "Test Prompts" to run experiment
   - Watch real-time progress as AI processes each prompt
   - View detailed quality metrics for each response

5. **View Analytics**
   - Go to "Analytics" dashboard
   - See overall statistics, trends, and visualizations
   - Drill down into specific experiments or prompts

---

## 🏗 Project Structure

```
prompt-lab/
├── public/                          # Static assets
│   └── robots.txt
├── scripts/                         # Utility scripts
│   ├── import-prompts.js           # Bulk prompt import
│   └── transform-prompts.js        # Data transformation
├── server/                          # Backend
│   ├── index.js                    # Express server + API routes
│   └── db.js                       # MongoDB connection
├── src/                            # Frontend
│   ├── components/                 # Reusable Vue components
│   │   ├── AnalyticsMetricCard.vue
│   │   ├── ProjectCompletedDonutCard.vue
│   │   ├── QualityScoreTrendCard.vue
│   │   ├── ResponseTimeByPromptCard.vue
│   │   ├── PromptRankingsCard.vue
│   │   └── [10+ more components]
│   ├── pages/                      # Full-page components
│   │   ├── LoginPage.vue
│   │   ├── LandingPage.vue
│   │   ├── PromptsPage.vue
│   │   ├── FavoritesPage.vue
│   │   ├── ExperimentRunnerPage.vue
│   │   ├── ExperimentsPage.vue
│   │   └── AnalyticsPage.vue
│   ├── router/                     # Vue Router config
│   │   └── index.ts
│   ├── stores/                     # Global state management
│   │   └── appStore.ts
│   ├── lib/                        # API services & utilities
│   │   ├── authApi.ts              # Authentication
│   │   ├── aiApi.ts                # AI model integration
│   │   ├── promptsApi.ts           # Prompt CRUD
│   │   ├── favoritesApi.ts         # Favorites CRUD
│   │   ├── experimentsApi.ts       # Experiment CRUD
│   │   ├── resultsApi.ts           # Results & analytics
│   │   ├── evaluationMetrics.ts    # Quality evaluation
│   │   └── mockData.ts             # Sample data
│   ├── App.vue                     # Root component
│   ├── main.ts                     # Application entry point
│   └── styles/                     # Global & component CSS
├── prompts/                        # Prompt data (JSON)
│   ├── chatgpt_prompts.json
│   └── chatgpt_prompts_transformed.json
├── package.json
├── vite.config.ts
├── tsconfig.json
├── eslint.config.js
└── .env.example
```

---

## 📡 API Documentation

### Authentication Endpoints

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response: { token, user: { id, email } }
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response: { token, user: { id, email } }
```

#### Get User by Email
```http
GET /api/auth/user?email=user@example.com

Response: { user: { id, email } }
```

### Prompt Endpoints

#### Get All Prompts
```http
GET /api/prompts?category=technology&search=AI&limit=12&offset=0

Response: { prompts: [...], total: 100, limit: 12, offset: 0 }
```

#### Get Single Prompt
```http
GET /api/prompts/{promptId}

Response: { promptId, title, promptText, category, createdAt, createdBy }
```

#### Create Prompt (Authenticated)
```http
POST /api/prompts
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Prompt Title",
  "promptText": "Prompt content here...",
  "category": "technology"
}

Response: { message, prompt: {...} }
```

#### Update Prompt
```http
PATCH /api/prompts/{promptId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Updated Title",
  "promptText": "Updated content...",
  "category": "learning"
}

Response: { prompt: {...} }
```

### Favorites Endpoints

#### Get User Favorites (Authenticated)
```http
GET /api/favorites
Authorization: Bearer {token}

Response: { 
  favorites: [
    {
      _id, userId, sourcePromptId,
      customTitle, customCategory, customPromptText,
      title, category, promptText,
      createdAt, updatedAt
    }
  ]
}
```

#### Save/Update Favorite (Authenticated)
```http
POST /api/favorites
Authorization: Bearer {token}
Content-Type: application/json

{
  "sourcePromptId": 123,
  "customTitle": "My Custom Title",
  "customCategory": "writing",
  "customPromptText": "Custom prompt content..."
}

Response: { message, favorite: {...} }
```

#### Delete Favorite (Authenticated)
```http
DELETE /api/favorites/{sourcePromptId}
Authorization: Bearer {token}

Response: { message: "Favorite removed successfully." }
```

### Experiment Endpoints

#### Create Experiment (Authenticated)
```http
POST /api/experiments
Authorization: Bearer {token}
Content-Type: application/json

{
  "prompts": [1, 2, 3],
  "summary": {
    "status": "completed",
    "avgQualityScore": 85,
    "avgResponseTimeMs": 1200,
    "totalTokens": 5000,
    "promptScores": [
      { "promptId": 1, "overallQuality": 88 }
    ]
  }
}

Response: { message, experiment: {...} }
```

#### Get All Experiments (Authenticated)
```http
GET /api/experiments
Authorization: Bearer {token}

Response: { experiments: [...] }
```

#### Get Experiment Details (Authenticated)
```http
GET /api/experiments/{experimentId}
Authorization: Bearer {token}

Response: { experiment: {...} }
```

### Results Endpoints

#### Save Batch Results (Authenticated)
```http
POST /api/results/batch
Authorization: Bearer {token}
Content-Type: application/json

{
  "experimentId": "507f1f77bcf86cd799439011",
  "promptResults": [
    {
      "promptId": 1,
      "category": "technology",
      "aiResponse": "Response text...",
      "overallQuality": 85,
      "responseTimeMs": 1200,
      "clarity": 90,
      "relevance": 88,
      "coherence": 85,
      "completeness": 80,
      "tokensUsed": 1500
    }
  ]
}

Response: { message, insertedCount }
```

#### Get Results Summary (Authenticated)
```http
GET /api/results/summary
Authorization: Bearer {token}

Response: {
  experimentsRun: 5,
  avgQualityScore: 82,
  avgResponseTimeMs: 1150,
  promptsEvaluated: 12,
  passRate: 78.5,
  topCategories: [...]
}
```

#### Get Prompt Summary (Authenticated)
```http
GET /api/results/prompt-summary
Authorization: Bearer {token}

Response: {
  prompts: [
    { promptId, avgQualityScore, testCount, lastTestedAt }
  ]
}
```

#### Get Results by Experiment (Authenticated)
```http
GET /api/results/by-experiment?experimentId=507f1f77bcf86cd799439011
Authorization: Bearer {token}

Response: { results: [...] }
```

---

## 🗄 Database Schema

### Collections Overview

#### `users`
```javascript
{
  _id: ObjectId,
  email: String (unique),
  passwordHash: String,
}
```

#### `prompt_library`
```javascript
{
  _id: ObjectId,
  promptId: Number (unique),
  title: String,
  promptText: String,
  category: String,
  createdAt: ISODate,
  createdBy: String,
}
```

#### `favorite_prompts`
```javascript
{
  _id: ObjectId,
  userId: String,
  sourcePromptId: Number,
  customTitle: String (nullable),
  customCategory: String (nullable),
  customPromptText: String (nullable),
  createdAt: ISODate,
  updatedAt: ISODate,
}
// Unique composite index: (userId, sourcePromptId)
```

#### `experiments`
```javascript
{
  _id: ObjectId,
  userId: String,
  prompts: [Number],
  status: String, // "draft" | "completed"
  avgQualityScore: Number (nullable),
  avgResponseTimeMs: Number (nullable),
  totalTokens: Number,
  promptScores: [{ promptId, overallQuality }],
  createdAt: ISODate,
}
```

#### `results`
```javascript
{
  _id: ObjectId,
  userId: String,
  experimentId: String,
  promptId: Number,
  category: String,
  aiResponse: String,
  overallQuality: Number (0-100),
  responseTimeMs: Number,
  clarity: Number (0-100),
  relevance: Number (0-100),
  coherence: Number (0-100),
  completeness: Number (0-100),
  tokensUsed: Number,
  createdAt: ISODate,
}
```

### Indexes
```javascript
users:           { email: 1 } unique
prompts:         { promptId: 1 } unique
                 { category: 1 }
                 { title, promptText: "text" }
experiments:     { userId: 1, createdAt: -1 }
results:         { userId: 1, experimentId: 1 }
                 { userId: 1, promptId: 1, createdAt: -1 }
favorites:       { userId: 1, sourcePromptId: 1 } unique
                 { userId: 1, updatedAt: -1 }
```

---

## 🔐 Authentication

### How It Works

1. **User Registration**
   - Email is validated (format check)
   - Password is hashed with bcrypt (10 salt rounds)
   - User document created in MongoDB
   - JWT token issued (7-day expiration)

2. **User Login**
   - Email lookup in users collection
   - Password verified against stored hash
   - JWT token issued on success
   - Token stored in browser localStorage

3. **Protected Requests**
   - All protected endpoints require `Authorization: Bearer {token}` header
   - Server validates token signature and expiration
   - User context extracted from token payload
   - Request proceeds if valid, returns 401 if invalid

4. **Token Details**
   - Algorithm: HS256 (HMAC with SHA-256)
   - Payload: `{ id: userId, email: userEmail }`
   - Expiration: 7 days from issuance
   - Secret: Configured via `JWT_SECRET` env var

### Security Features

✅ Bcrypt password hashing (constant-time comparison)  
✅ Email normalization (prevents case-sensitivity vulnerabilities)  
✅ Secure token storage (localStorage in frontend)  
✅ Token validation on every protected endpoint  
✅ User ownership checks (users can only access their own data)  
✅ Input validation on all forms  
✅ CORS configured for cross-origin requests  

---

## 🧪 Testing

### Manual Testing Checklist

```markdown
## Authentication
- [ ] Register with new email
- [ ] Register with invalid email format
- [ ] Register with existing email (should reject)
- [ ] Login with correct credentials
- [ ] Login with wrong password
- [ ] Verify token in localStorage
- [ ] Logout clears token and user state

## Prompt Management
- [ ] View all prompts with pagination
- [ ] Search prompts by title/content
- [ ] Filter prompts by category
- [ ] Create new prompt
- [ ] Update prompt details
- [ ] View single prompt details

## Favorites
- [ ] Add prompt to favorites
- [ ] Edit favorite with custom title/category/content
- [ ] Remove from favorites
- [ ] View favorites page
- [ ] Select multiple favorites for testing

## Experiments
- [ ] Create experiment with 1 prompt
- [ ] Create experiment with 2 prompts
- [ ] Create experiment with 3 prompts
- [ ] View experiment details
- [ ] See real-time progress during execution
- [ ] View results with all metrics

## Analytics
- [ ] View summary statistics
- [ ] Check chart visualizations
- [ ] View quality trends
- [ ] See category distribution
- [ ] Check prompt rankings

## Responsive Design
- [ ] Test on mobile (< 576px)
- [ ] Test on tablet (576px - 992px)
- [ ] Test on desktop (> 992px)
- [ ] Verify all layouts adapt properly
```

### Running Tests

```bash
# Lint code
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 📦 Build & Deployment

### Build for Production

```bash
npm run build
```

Output files will be in the `dist/` directory.

### Environment Variables for Production

```env
# Production MongoDB (e.g., MongoDB Atlas)
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/

# Secure JWT Secret
JWT_SECRET=your-long-random-secret-key-min-32-chars

# Production API URL
VITE_API_BASE_URL=https://your-domain.com
```

### Deployment Options

- **Frontend:** Vercel, Netlify, or any static host
- **Backend:** Heroku, Railway, or your own VPS
- **Database:** MongoDB Atlas (cloud) or self-hosted

---

## 🐛 Troubleshooting

### Common Issues

**MongoDB Connection Error**
```
Fix: Ensure MONGODB_URI is correct and MongoDB is running
     For local: mongodb://localhost:27017
     For Atlas: mongodb+srv://user:pwd@cluster.mongodb.net/
```

**JWT Token Verification Failed**
```
Fix: Verify JWT_SECRET matches between .env and app
     Clear localStorage and re-login
     Check token expiration (default 7 days)
```

**CORS Errors**
```
Fix: Backend CORS is configured for http://localhost:5173
     Update in server/index.js for production domain
     Ensure Authorization header is included in requests
```

**Port Already in Use**
```
Fix: Change PORT in .env (default 4000)
     Or kill process: lsof -ti:4000 | xargs kill -9
```

**Module Not Found**
```
Fix: Delete node_modules and reinstall: rm -rf node_modules && npm install
     Clear Vite cache: rm -rf .vite
```

---

## 📚 Additional Resources

- [Vue 3 Documentation](https://vuejs.org/)
- [Express.js Guide](https://expressjs.com/)
- [MongoDB Manual](https://docs.mongodb.com/manual/)
- [JWT.io](https://jwt.io/) - JWT overview and tools
- [Bootstrap 5 Docs](https://getbootstrap.com/docs/5.0/)

---

## 📄 Course Information

**Course:** COMP7270 Web and Mobile Programming  
**Institution:** Hong Kong Baptist University  
**Semester:** Spring 2026  
**Project Type:** Group Project  

---

## 📝 License

This project is created for educational purposes as part of COMP7270 coursework at Hong Kong Baptist University.

---

## 👥 Contributing

This is a course project. For modifications or improvements:

1. Create feature branches: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -m "Add your feature"`
3. Push to branch: `git push origin feature/your-feature`
4. Submit pull request

---

## 📞 Support

For questions or issues:
- Check the [PROJECT_REVIEW.md](PROJECT_REVIEW.md) for detailed implementation guide
- Review code comments in source files
- Check console for error messages and logs

---

**Happy prompting! 🚀**

Last Updated: April 8, 2026
