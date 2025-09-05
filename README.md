# 📝 Todo App

A modern, full-stack todo application built with React, TypeScript, Node.js, and MongoDB. This app provides a complete task management solution with advanced features, beautiful responsive interface, and robust backend API.

## 🌟 Features

### ✨ Core Functionality
- **Task Types**: Support for `one-time` and `daily` tasks
- **Task States**: Four categories - Pending, Active, Completed, Failed
- **Add Todos**: Create new tasks with due dates for one-time tasks
- **Edit Todos**: Inline editing for both pending and active tasks (text and date)
- **Delete Todos**: Remove individual todos or bulk delete completed/failed ones
- **Mark Complete**: Move active tasks to completed state
- **Re-activation**: Re-activate completed or failed tasks with new due dates
- **Auto-navigation**: Automatically switch to pending list after creating new tasks

### 🎨 User Interface
- **iOS Reminders-inspired Design**: Clean, modern interface with rounded cards
- **Responsive Layout**: Desktop sidebar + mobile bottom tabs
- **Heroicons Integration**: Beautiful, consistent iconography
- **Enhanced Calendar**: Custom date/time picker with today highlighting and timezone handling
- **Improved Navigation**: Clear hover states and selected indicators for better UX
- **Smooth Animations**: CSS transitions and hover effects with scale animations
- **Real-time Updates**: Instant UI updates with React Query
- **Proper Scrolling**: Long lists scroll naturally without layout breaking

### 📊 Task Management
- **Pending Tasks**: Created but not yet active (fully editable - text and date, deletable)
- **Active Tasks**: Ongoing tasks (fully editable - text and date, can be completed or failed)
- **Completed Tasks**: Read-only list with re-activation and bulk delete
- **Failed Tasks**: Read-only list with re-activation and bulk delete
- **Due Dates**: Enhanced calendar picker with today highlighting and proper timezone handling
- **Timestamps**: Display creation, activation, completion, and failure dates
- **Duplicate Prevention**: Active tasks cannot be duplicated by content
- **Smart Editing**: Click on task text to edit inline with save/cancel options

### 🔧 Technical Features
- **TypeScript**: Full type safety across frontend and backend
- **React Query (TanStack Query)**: Efficient data fetching and caching
- **Error Handling**: Comprehensive error management with user feedback
- **Input Validation**: Client and server-side validation
- **Rate Limiting**: API protection against abuse
- **Testing**: 100% test coverage with Jest and React Testing Library (270 tests passing)
- **Responsive Design**: Mobile-first approach with desktop enhancements
- **Custom CSS**: Tailwind CSS + custom styles for enhanced UI
- **API Documentation**: Complete Swagger/OpenAPI documentation at `/api/docs`
- **Timezone Handling**: Proper local time handling without UTC conversion issues
- **Design System**: Reusable components with consistent styling and behavior
- **Centralized Actions**: Task actions centralized in custom hooks for better maintainability
- **Custom Icons**: Optimized SVG icon system with size variants
- **Performance Optimization**: Memoized components and efficient state management

## 🖥️ Screenshots

### Desktop View
- Left sidebar with navigation and statistics
- Main content area with task lists
- Clean, organized layout with four task categories
- Inline editing with smooth transitions
- Timestamp display for all tasks

### Mobile View
- Top bar with current list title
- Bottom tab navigation for easy switching
- Floating action button for adding tasks
- Touch-friendly interface optimized for one-handed use

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- pnpm (recommended) or npm

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd todo-app
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd backend
   pnpm install

   # Install frontend dependencies
   cd ../frontend
   pnpm install
   ```

3. **Environment Setup**
   
   Create `backend/.env` file:
   ```env
   PORT=5001
   NODE_ENV=development
   MONGO_URI=mongodb://localhost:27017/todo-app
   ```

4. **Start the application**
   
   **Backend (Terminal 1):**
   ```bash
   cd backend
   pnpm dev
   ```
   
   **Frontend (Terminal 2):**
   ```bash
   cd frontend
   pnpm dev
   ```

5. **Access the app**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5001
   - API Documentation: http://localhost:5001/api/docs

## 🏗️ Project Structure

```
todo-app/
├── frontend/                 # React TypeScript frontend
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── services/        # API services
│   │   ├── utils/           # Utility functions
│   │   └── test/            # Test utilities
│   ├── public/              # Static assets
│   └── package.json
├── backend/                 # Node.js TypeScript backend
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Custom middleware
│   │   ├── models/          # Mongoose models
│   │   ├── routes/          # API routes
│   │   └── test/            # Test setup and utilities
│   └── package.json
└── README.md
```

## 🎯 How to Use

### Adding a Todo
1. Click the "Add Task" button or floating action button
2. Select task type (one-time or daily)
3. For one-time tasks, set a due date using the calendar picker
4. Enter your task description
5. Click "Add Task" to create

### Task States
- **Pending**: Newly created tasks waiting to be activated
- **Active**: Currently working on these tasks
- **Completed**: Successfully finished tasks
- **Failed**: Tasks that weren't completed on time

### Managing Tasks
- **Activate**: Move pending tasks to active state
- **Complete**: Mark active tasks as completed
- **Re-activate**: Bring completed/failed tasks back to active
- **Edit**: Both pending and active tasks can be edited inline (click on text)
- **Delete**: Remove individual tasks or bulk delete completed/failed

### Navigation
- **Desktop**: Use the left sidebar to switch between task categories
- **Mobile**: Use the bottom tab bar to navigate between lists
- **Statistics**: View task counts and timezone information in the sidebar

### Viewing Timestamps
- **Created**: When the task was first created
- **Activated**: When the task was moved to active state
- **Completed**: When the task was marked as complete
- **Failed**: When the task was marked as failed

## 🔌 API Endpoints

### Todos
- `GET /api/todos` - Get all todos grouped by state
- `GET /api/todos/:id` - Get single todo by ID
- `POST /api/todos` - Create new todo
- `PUT /api/todos/:id` - Update todo (text only for active tasks)
- `PATCH /api/todos/:id/activate` - Activate pending todo
- `PATCH /api/todos/:id/complete` - Complete active todo
- `PATCH /api/todos/:id/fail` - Mark active todo as failed
- `PATCH /api/todos/:id/reactivate` - Re-activate completed/failed todo
- `DELETE /api/todos/:id` - Delete single todo
- `DELETE /api/todos/completed` - Delete all completed todos
- `DELETE /api/todos/failed` - Delete all failed todos

### Utility
- `GET /` - API information
- `GET /health` - Health check endpoint

### API Documentation
- `GET /api/docs` - Interactive Swagger UI documentation
- `GET /api/docs/json` - OpenAPI JSON specification
- `GET /api/docs/overview` - API overview and features

## 🧪 Testing

### Frontend Tests
```bash
cd frontend
pnpm test              # Run all tests
pnpm test:coverage     # Run with coverage
pnpm test:watch        # Watch mode
```

### Backend Tests
```bash
cd backend
pnpm test              # Run all tests
pnpm test:coverage     # Run with coverage
pnpm test:watch        # Watch mode
```

### Test Coverage
- **Frontend**: 100% coverage with React Testing Library (270 tests passing)
- **Backend**: Comprehensive Jest test suite with MongoDB Memory Server

## 🛠️ Development

### Available Scripts

**Frontend:**
- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build
- `pnpm test` - Run tests
- `pnpm lint` - Run ESLint

**Backend:**
- `pnpm dev` - Start development server with hot reload
- `pnpm build` - Build TypeScript to JavaScript
- `pnpm start` - Start production server
- `pnpm test` - Run tests
- `pnpm test:coverage` - Run tests with coverage

### Technology Stack

**Frontend:**
- React 19 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- React Query for data fetching
- Axios for HTTP requests
- Custom Design System with reusable components
- Custom SVG icon system
- React Testing Library for testing
- Vitest for test runner

**Backend:**
- Node.js with TypeScript
- Express.js for web framework
- MongoDB with Mongoose ODM
- CORS for cross-origin requests
- Swagger/OpenAPI for API documentation
- Jest for testing
- Supertest for API testing
- MongoDB Memory Server for testing

## 🚀 Deployment

### Frontend Deployment
1. Build the frontend:
   ```bash
   cd frontend
   pnpm build
   ```
2. Deploy the `dist` folder to your hosting service (Vercel, Netlify, etc.)

### Backend Deployment
1. Build the backend:
   ```bash
   cd backend
   pnpm build
   ```
2. Set environment variables in your hosting service
3. Deploy to your server (Railway, Heroku, DigitalOcean, etc.)

### Environment Variables
```env
PORT=5001
NODE_ENV=production
MONGO_URI=your_mongodb_connection_string
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Run tests: `pnpm test`
5. Commit your changes: `git commit -m 'Add feature'`
6. Push to the branch: `git push origin feature-name`
7. Submit a pull request

### Development Guidelines
- Follow TypeScript best practices
- Write tests for new features
- Update documentation as needed
- Use conventional commit messages
- Ensure all tests pass before submitting PR

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- React team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- MongoDB for the flexible database
- All open-source contributors who made this possible

## 📞 Support

If you have any questions or need help, please:
- Open an issue on GitHub
- Check the documentation
- Review the test files for usage examples

---

**Happy Todo-ing! 🎉**
