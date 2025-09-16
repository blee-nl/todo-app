# Todo Backend API

A TypeScript-based REST API for the Todo application built with Express.js and MongoDB. Features advanced task management with four states, duplicate prevention, and comprehensive testing.

## Features

- ✨ **Full TypeScript Support** - Type-safe development with interfaces and types
- 🚀 **RESTful API** - Complete CRUD operations for todos with advanced state management
- 🗄️ **MongoDB Integration** - Mongoose ODM with proper schemas and validation
- 🔔 **Notification System** - Backend notification data modeling and service layer
- 🔒 **Input Validation** - Request validation and error handling
- 📊 **Rate Limiting** - Basic rate limiting for API protection
- 🎯 **Error Handling** - Comprehensive error handling with proper HTTP status codes
- 📝 **Logging** - Request logging and error tracking with centralized logger
- 🔄 **Hot Reload** - Development server with automatic reloading
- 🧪 **Comprehensive Testing** - Jest test suite with 211+ tests passing
- 🏗️ **In-Memory Testing** - MongoDB Memory Server for isolated tests
- 🎯 **Task Types** - Support for one-time and daily tasks
- 🔄 **State Management** - Four task states: pending, active, completed, failed
- 🚫 **Duplicate Prevention** - Prevents duplicate active tasks by content
- 📅 **Due Date Handling** - Calendar integration for one-time tasks
- ⏰ **Notification Scheduling** - Task reminder system with customizable timing

## API Endpoints

### Todos
- `GET /api/todos` - Get all todos grouped by state
- `GET /api/todos/:id` - Get single todo by ID
- `POST /api/todos` - Create new todo (with duplicate prevention)
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

## Setup Instructions

### 1. Environment Variables
Create a `.env` file in the root directory:

```bash
PORT=5001
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/todo-app
```

### 2. Install Dependencies
```bash
pnpm install
```

### 3. Development
```bash
# Start development server with hot reload
pnpm dev

# Build TypeScript to JavaScript
pnpm build

# Start production server
pnpm start
```

### 4. Testing
```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage report
pnpm test:coverage

# Run tests for CI/CD
pnpm test:ci
```

### 5. MongoDB
Make sure MongoDB is running locally or update the `MONGO_URI` in your `.env` file.

## Project Structure

```
src/
├── controllers/     # Request handlers
│   ├── todoController.ts # Main todo controller
│   └── __tests__/   # Controller tests
│       ├── todoController.test.ts # Main controller tests
│       └── todoController.notification.test.ts # Notification feature tests
├── middleware/      # Custom middleware
│   ├── validation.ts # Input validation middleware
│   └── __tests__/   # Middleware tests
├── models/          # Mongoose models
│   ├── Todo.ts      # Todo model with notification support
│   └── __tests__/   # Model tests
│       ├── Todo.test.ts # Main model tests
│       └── Todo.notification.test.ts # Notification model tests
├── services/        # Business logic services
│   ├── NotificationService.ts # Notification service layer
│   └── __tests__/   # Service tests
│       └── NotificationService.test.ts # Notification service tests
├── routes/          # API routes
│   ├── todoRoutes.ts # Todo route definitions
│   ├── docsRoutes.ts # API documentation routes
│   └── __tests__/   # Route integration tests
├── config/          # Configuration
│   ├── swagger.ts   # OpenAPI/Swagger configuration
│   └── __tests__/   # Config tests
├── constants/       # Application constants
│   ├── timeConstants.ts # Time-related constants
│   └── __tests__/   # Constants tests
├── utils/           # Utility functions
│   ├── logger.ts    # Centralized logging utility
│   └── __tests__/   # Utility tests
├── test/            # Test utilities and setup
│   ├── setup.ts     # Test configuration
│   └── basic.test.ts # Basic test verification
└── index.ts         # Main server file with middleware setup
```

## Development Scripts

- `pnpm dev` - Start development server with hot reload
- `pnpm build` - Build TypeScript to JavaScript
- `pnpm start` - Start production server
- `pnpm clean` - Clean build directory
- `pnpm test` - Run all tests
- `pnpm test:watch` - Run tests in watch mode
- `pnpm test:coverage` - Run tests with coverage report
- `pnpm test:ci` - Run tests for CI/CD

## TypeScript Configuration

The project uses strict TypeScript configuration with:
- Strict type checking
- Source maps for debugging
- Declaration files generation
- Modern ES2020 target

## Error Handling

The API includes comprehensive error handling:
- Input validation errors (400)
- Resource not found errors (404)
- Rate limiting errors (429)
- Internal server errors (500)
- Custom error classes with status codes

## Rate Limiting

Basic rate limiting is implemented:
- 100 requests per minute per IP
- Configurable limits and time windows
- Proper error responses for exceeded limits

## Testing

The backend includes a comprehensive test suite with Jest:

### Test Coverage
- **Models**: Todo model validation, methods, and notification support (30+ tests)
- **Controllers**: All CRUD operations, error handling, and notification features (40+ tests)
- **Services**: Notification service layer with comprehensive testing (15+ tests)
- **Middleware**: Input validation and rate limiting (8+ tests)
- **Routes**: Integration tests for all API endpoints (20+ tests)
- **Configuration**: Swagger/OpenAPI configuration testing (50+ tests)
- **Constants**: Time constants and validation (40+ tests)
- **Utils**: Logger and utility function testing (30+ tests)
- **Integration**: Full application testing with real database (25+ tests)

### Test Features
- **In-Memory MongoDB**: Uses MongoDB Memory Server for isolated tests
- **Mock Data**: Test data and utilities for consistent testing
- **Error Scenarios**: Tests for validation and error handling
- **Integration Tests**: Full API endpoint testing with Supertest
- **Unit Tests**: Individual component testing for models, controllers, and middleware

### Test Structure
```
src/
├── models/__tests__/Todo.test.ts          # Model tests
├── controllers/__tests__/todoController.test.ts  # Controller tests
├── middleware/__tests__/validation.test.ts       # Middleware tests
├── routes/__tests__/todoRoutes.test.ts           # Integration tests
└── test/
    ├── setup.ts                          # Test setup and teardown
    └── utils.ts                          # Test utilities and mock data
```

### Running Tests
```bash
# Run all tests
pnpm test

# Run tests in watch mode (for development)
pnpm test:watch

# Generate coverage report
pnpm test:coverage

# Run tests for CI/CD (no watch mode)
pnpm test:ci
```

### Test Configuration
- **Jest**: Modern testing framework with TypeScript support
- **Supertest**: HTTP assertion library for API testing
- **MongoDB Memory Server**: In-memory MongoDB for isolated tests
- **Coverage Reports**: HTML and LCOV coverage reports generated
- **Test Structure**: Unit tests for models, controllers, middleware, and integration tests for routes

## Contributing

1. Follow TypeScript best practices
2. Add proper error handling
3. Include input validation
4. Write clear documentation
5. Test API endpoints
6. Write tests for new features
7. Update tests when modifying existing code
8. Run tests before committing changes
