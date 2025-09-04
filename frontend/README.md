# Todo App Frontend

A modern React todo application built with TypeScript, Tailwind CSS, and React Query.

## Features

- ✅ Add, edit, delete, and complete todos
- 🎨 Apple-inspired design with glass morphism effects
- 📱 Responsive design for mobile, tablet, and desktop
- ⚡ Real-time updates with React Query
- 🛡️ Comprehensive error handling and validation
- 🧪 80%+ test coverage with React Testing Library
- ♿ Full accessibility support

## Tech Stack

- **React 19** - Latest React with concurrent features
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **React Query (TanStack Query)** - Server state management
- **Vite** - Fast build tool and dev server
- **Vitest** - Fast unit testing framework
- **React Testing Library** - Component testing utilities

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or pnpm

### Installation

```bash
# Install dependencies
npm install

# Note: Due to React 19 compatibility, some testing libraries may show peer dependency warnings.
# This is expected and safe to ignore. We use --legacy-peer-deps to resolve compatibility issues.
```

### Development

```bash
# Start development server
npm run dev

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in UI mode
npm run test:ui
```

### Building

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Testing

This project uses Vitest with React Testing Library for comprehensive testing.

### Test Coverage

- **Components**: All React components with user interactions
- **Hooks**: Custom hooks with various scenarios
- **Utils**: Utility functions with edge cases
- **API**: Service layer with mocked responses
- **Error Handling**: Error states and recovery

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage report
npm run test:coverage

# Run tests in watch mode
npm run test

# Run tests with UI
npm run test:ui
```

### Test Structure

```
src/
├── components/__tests__/     # Component tests
├── hooks/__tests__/          # Custom hook tests
├── utils/__tests__/          # Utility function tests
├── services/__tests__/       # API service tests
├── constants/__tests__/      # Configuration tests
└── test/                     # Test utilities and mocks
    ├── setup.ts              # Test setup
    ├── utils.tsx             # Custom render function
    └── mocks/                # MSW handlers
```

## React 19 Compatibility Notes

This project uses React 19, which is the latest version with new features like:

- **Concurrent Features**: Automatic batching, Suspense improvements
- **New Hooks**: `use()` hook for promises and context
- **Better Performance**: Optimized rendering and memory usage

### Testing Library Compatibility

Some testing libraries may show peer dependency warnings with React 19:

```
@testing-library/react-hooks requires react@^16.8.0 || ^17.0.0
```

**This is expected and safe to ignore.** The testing libraries work correctly with React 19, but their peer dependency declarations haven't been updated yet.

### Resolution

We use `--legacy-peer-deps` during installation to resolve these warnings:

```bash
npm install --legacy-peer-deps
```

This approach is recommended by the React Testing Library team for React 19 projects.

## Project Structure

```
src/
├── components/           # React components
│   ├── Todo.tsx         # Main todo component
│   ├── TodoItem.tsx     # Individual todo item
│   ├── CompletedTodoItem.tsx
│   ├── TodoInput.tsx    # Input component
│   ├── ErrorDisplay.tsx # Error display component
│   └── InlineErrorDisplay.tsx
├── hooks/               # Custom React hooks
│   ├── useTodos.ts      # Todo-related hooks
│   ├── useErrorHandler.ts
│   ├── useDebounce.ts
│   └── useLoadingState.ts
├── services/            # API services
│   └── api.ts           # Axios configuration and API calls
├── utils/               # Utility functions
│   ├── dateUtils.ts     # Date formatting
│   ├── errorUtils.ts    # Error handling
│   ├── validation.ts    # Input validation
│   └── index.ts         # Utility exports
├── constants/           # Configuration
│   └── config.ts        # App configuration
└── test/                # Testing utilities
    ├── setup.ts         # Test setup
    ├── utils.tsx        # Custom render
    └── mocks/           # Mock handlers
```

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:5001
```

## API Integration

The frontend communicates with a Node.js/Express backend:

- **Base URL**: `http://localhost:5001`
- **Endpoints**: `/api/todos/*`
- **Authentication**: None (for this demo)
- **CORS**: Configured for development

## Error Handling

Comprehensive error handling includes:

- **Network Errors**: Connection issues, timeouts
- **API Errors**: 4xx, 5xx status codes
- **Validation Errors**: Input validation failures
- **User Feedback**: Clear error messages with retry options

## Accessibility

Full accessibility support:

- **ARIA Labels**: All interactive elements
- **Keyboard Navigation**: Full keyboard support
- **Screen Readers**: Proper announcements
- **Focus Management**: Logical focus flow
- **Color Contrast**: WCAG compliant colors

## Performance

Optimizations include:

- **React Query**: Efficient data fetching and caching
- **Memoization**: `useMemo` and `useCallback` for expensive operations
- **Code Splitting**: Lazy loading of components
- **Bundle Optimization**: Tree shaking and minification

## Contributing

1. Fork the repository
2. Create a feature branch
3. Write tests for new features
4. Ensure all tests pass
5. Submit a pull request

## License

MIT License - see LICENSE file for details.