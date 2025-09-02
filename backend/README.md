# Todo Backend API

A TypeScript-based REST API for the Todo application built with Express.js and MongoDB.

## Features

- ✨ **Full TypeScript Support** - Type-safe development with interfaces and types
- 🚀 **RESTful API** - Complete CRUD operations for todos
- 🗄️ **MongoDB Integration** - Mongoose ODM with proper schemas
- 🔒 **Input Validation** - Request validation and error handling
- 📊 **Rate Limiting** - Basic rate limiting for API protection
- 🎯 **Error Handling** - Comprehensive error handling with proper HTTP status codes
- 📝 **Logging** - Request logging and error tracking
- 🔄 **Hot Reload** - Development server with automatic reloading

## API Endpoints

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

### 4. MongoDB
Make sure MongoDB is running locally or update the `MONGO_URI` in your `.env` file.

## Project Structure

```
src/
├── controllers/     # Request handlers
├── middleware/      # Custom middleware
├── models/          # Mongoose models
├── routes/          # API routes
└── index.ts         # Main server file
```

## Development Scripts

- `pnpm dev` - Start development server with hot reload
- `pnpm build` - Build TypeScript to JavaScript
- `pnpm start` - Start production server
- `pnpm clean` - Clean build directory

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

## Contributing

1. Follow TypeScript best practices
2. Add proper error handling
3. Include input validation
4. Write clear documentation
5. Test API endpoints
