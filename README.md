# 📝 Todo App

A modern, full-stack todo application built with React, TypeScript, Node.js, and MongoDB. This app provides a complete task management solution with a beautiful, responsive interface and robust backend API.

## 🌟 Features

### ✨ Core Functionality
- **Add Todos**: Create new tasks with a simple input field
- **Edit Todos**: Click on any todo to edit its text inline
- **Delete Todos**: Remove individual todos or bulk delete completed ones
- **Mark Complete**: Toggle todo completion status with a single click
- **Cancel Editing**: Escape key or click outside to cancel editing mode

### 🎨 User Interface
- **Apple-inspired Design**: Clean, modern interface with glass morphism effects
- **Responsive Layout**: Optimized for mobile, tablet, and desktop devices
- **Smooth Animations**: CSS transitions and hover effects for better UX
- **Dark/Light Theme**: Beautiful color scheme with proper contrast
- **Real-time Updates**: Instant UI updates with optimistic rendering

### 📊 Task Management
- **Active Tasks**: View and manage incomplete todos
- **Completed Tasks**: Separate section for finished tasks (read-only)
- **Timestamps**: Display creation, update, and completion dates
- **Status Filtering**: Filter todos by completion status
- **Bulk Operations**: Delete all completed todos at once

### 🔧 Technical Features
- **TypeScript**: Full type safety across frontend and backend
- **React Query**: Efficient data fetching and caching
- **Error Handling**: Comprehensive error management with user feedback
- **Input Validation**: Client and server-side validation
- **Rate Limiting**: API protection against abuse
- **Testing**: 80%+ test coverage with Jest and React Testing Library

## 🖥️ Screenshots

### Desktop View
- Clean, organized layout with active and completed todo sections
- Inline editing with smooth transitions
- Timestamp display for all tasks

### Mobile View
- Touch-friendly interface
- Responsive design that works on all screen sizes
- Optimized for one-handed use

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
1. Type your task in the input field at the top
2. Press Enter or click the "Add Todo" button
3. Your todo appears in the active tasks section

### Editing a Todo
1. Click on any active todo text
2. The todo enters edit mode with a text input
3. Make your changes and press Enter to save
4. Press Escape to cancel editing

### Completing a Todo
1. Click the checkbox next to any active todo
2. The todo moves to the completed section
3. Completed todos show the completion timestamp

### Deleting Todos
- **Single Todo**: Click the delete button (trash icon) next to any todo
- **All Completed**: Click "Delete All Completed" button in the completed section

### Viewing Timestamps
- **Created**: When the todo was first created
- **Updated**: Last modification time
- **Completed**: When the todo was marked as complete (for completed todos)

## 🔌 API Endpoints

### Todos
- `GET /api/todos` - Get all todos
- `GET /api/todos/:id` - Get single todo by ID
- `POST /api/todos` - Create new todo
- `PUT /api/todos/:id` - Update todo
- `PATCH /api/todos/:id/toggle` - Toggle todo completion
- `DELETE /api/todos/:id` - Delete single todo
- `DELETE /api/todos/completed` - Delete all completed todos

### Utility
- `GET /` - API information
- `GET /health` - Health check endpoint

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
- **Frontend**: 80%+ coverage with React Testing Library
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
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- React Query for data fetching
- Axios for HTTP requests
- React Testing Library for testing
- Vitest for test runner

**Backend:**
- Node.js with TypeScript
- Express.js for web framework
- MongoDB with Mongoose ODM
- CORS for cross-origin requests
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
