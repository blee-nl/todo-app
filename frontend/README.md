# Todo App Frontend

A modern React todo application built with TypeScript, Tailwind CSS, and React Query. Features advanced task management with four states, responsive design, and comprehensive testing.

## Features

- ✅ **Task Management**: Add, edit, delete, and complete todos with four states (Pending, Active, Completed, Failed)
- 🔔 **Smart Notifications**: Browser notifications with customizable reminder times (5 minutes to 7 days before due)
- 🎨 **iOS Reminders-inspired Design**: Clean, modern interface with rounded cards and glass morphism effects
- 📱 **Responsive Layout**: Desktop sidebar + mobile bottom tabs with floating action button
- ⚡ **Real-time Updates**: React Query for efficient data fetching and caching
- 🛡️ **Comprehensive Error Handling**: User-friendly error messages and validation
- 🧪 **Extensive Test Coverage**: React Testing Library with comprehensive test suite (1365+ tests passing)
- ♿ **Full Accessibility**: ARIA labels, keyboard navigation, and screen reader support
- 🎯 **Task Types**: Support for one-time and daily tasks with due dates
- 🔄 **Re-activation**: Bring completed/failed tasks back to active state
- 🗑️ **Bulk Operations**: Delete all completed or failed tasks at once
- 🎨 **Design System**: Reusable components with consistent styling and behavior
- 🏗️ **Clean Architecture**: Domain-driven design with clear separation of concerns
- 🔧 **Centralized Actions**: Task actions centralized in custom hooks for better maintainability
- 📅 **Enhanced Calendar**: Custom date/time picker with today highlighting and validation
- 🎯 **Optimized Performance**: Memoized components and efficient state management
- 🔔 **Notification Management**: Permission handling, scheduling, and browser API integration

## Tech Stack

- **React 19** - Latest React with concurrent features
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework with custom styles
- **React Query (TanStack Query)** - Server state management
- **Clean Architecture** - Domain, Application, and Infrastructure layers
- **Browser Notifications API** - Native browser notifications with service worker support
- **Custom Design System** - Reusable components (Button, Input, TextArea, Badge, etc.)
- **Custom Icons** - Optimized SVG icon system with size variants
- **Vite** - Fast build tool and dev server
- **Vitest** - Fast unit testing framework
- **React Testing Library** - Component testing utilities
- **MSW (Mock Service Worker)** - API mocking for tests

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

- **Components**: All React components with user interactions (1365+ tests passing)
- **Hooks**: Custom hooks with various scenarios including notification hooks
- **Utils**: Utility functions with edge cases including notification utilities
- **API**: Service layer with mocked responses
- **Error Handling**: Error states and recovery
- **Design System**: All reusable components tested
- **Task Actions**: Centralized action hooks tested
- **Domain Layer**: Entity models and domain services
- **Application Layer**: Use cases and application services
- **Infrastructure**: Repository adapters and external integrations
- **Notification System**: Browser API integration and permission handling

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
│   ├── TodoApp.tsx      # Main app component
│   ├── Layout.tsx       # Responsive layout wrapper
│   ├── Sidebar.tsx      # Desktop sidebar navigation
│   ├── BottomTabBar.tsx # Mobile bottom navigation
│   ├── TopBar.tsx       # Top bar with title and add button
│   ├── FloatingActionButton.tsx # Mobile FAB
│   ├── TaskList.tsx     # Task list with delete all functionality
│   ├── TaskModal.tsx    # Modal for adding/editing tasks
│   ├── TodoInput.tsx    # Input component for new tasks
│   ├── NotificationTimePicker.tsx    # Notification time picker
│   ├── NotificationIndicator.tsx     # Notification status indicator
│   ├── PendingTodoItem.tsx    # Pending task component
│   ├── ActiveTodoItem.tsx     # Active task component
│   ├── CompletedTodoItem.tsx  # Completed task component
│   ├── FailedTodoItem.tsx     # Failed task component
│   ├── TaskActionButtons.tsx  # Centralized action buttons
│   ├── CustomDateTimePicker.tsx # Enhanced date/time picker
│   ├── actions/         # Centralized task actions
│   │   └── TaskActions.ts # Custom hooks for task operations
│   └── __tests__/       # Component tests
├── domain/              # Domain layer (Clean Architecture)
│   ├── entities/        # Domain entities
│   │   ├── Task.ts      # Task entity with business logic
│   │   └── __tests__/   # Entity tests
│   ├── repositories/    # Repository interfaces
│   │   └── TaskRepository.ts # Task repository interface
│   └── services/        # Domain services
│       ├── TaskDomainService.ts # Task business logic
│       └── __tests__/   # Domain service tests
├── application/         # Application layer (Clean Architecture)
│   └── services/        # Application services
│       ├── TaskApplicationService.ts # Use cases orchestration
│       └── __tests__/   # Application service tests
├── infrastructure/      # Infrastructure layer (Clean Architecture)
│   ├── adapters/        # External service adapters
│   │   ├── ApiTaskRepository.ts # API repository implementation
│   │   └── __tests__/   # Adapter tests
│   └── container/       # Dependency injection
│       ├── ServiceContainer.ts # DI container
│       └── __tests__/   # Container tests
├── features/            # Feature modules
│   ├── tasks/           # Task management feature
│   │   ├── components/  # Feature-specific components
│   │   ├── hooks/       # Feature-specific hooks
│   │   └── __tests__/   # Feature tests
│   └── task-management/ # Advanced task management
│       ├── components/  # Task management components
│       ├── hooks/       # Task management hooks
│       └── __tests__/   # Task management tests
├── design-system/       # Reusable design system
│   ├── components/      # Design system components
│   │   ├── Button.tsx   # Reusable button component
│   │   ├── Input.tsx    # Reusable input component
│   │   ├── TextArea.tsx # Reusable textarea component
│   │   ├── Badge.tsx    # Reusable badge component
│   │   └── ...          # Other design system components
│   └── index.ts         # Design system exports
├── assets/              # Static assets
│   └── icons/           # Custom SVG icon system
│       ├── index.tsx    # Icon exports
│       └── *.tsx        # Individual icon components
├── hooks/               # Custom React hooks
│   ├── useTodos.ts      # Todo-related hooks
│   ├── useErrorHandler.ts # Error handling hook
│   ├── useLoadingState.ts # Loading state hook
│   └── __tests__/       # Hook tests
├── services/            # Infrastructure services
│   ├── api.ts           # Axios configuration and API calls
│   ├── notificationScheduler.ts # Notification scheduling service
│   └── __tests__/       # Service tests
├── utils/               # Utility functions
│   ├── dateUtils.ts     # Date formatting
│   ├── errorUtils.ts    # Error handling
│   ├── validation.ts    # Input validation
│   ├── notificationUtils.ts # Notification utilities
│   ├── queryUtils.ts    # React Query utilities
│   ├── styles/          # Style utilities
│   │   └── classNames.ts # Class name utilities
│   ├── index.ts         # Utility exports
│   └── __tests__/       # Utility tests
├── constants/           # Configuration
│   ├── config.ts        # App configuration
│   ├── notificationConstants.ts # Notification constants
│   ├── timeConstants.ts # Time-related constants
│   ├── taskConstants.ts # Task-related constants
│   └── __tests__/       # Config tests
├── types/               # TypeScript type definitions
│   ├── notification.ts  # Notification types
│   └── index.ts         # Type exports
├── styles/              # Custom CSS
│   └── calendar.css     # Custom calendar styling
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