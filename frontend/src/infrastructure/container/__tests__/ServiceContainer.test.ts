import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { serviceContainer } from '../ServiceContainer';
import { TaskApplicationService } from '../../../application/services/TaskApplicationService';
import { ApiTaskRepository } from '../../adapters/ApiTaskRepository';
import type { TaskRepository } from '../../../domain/repositories/TaskRepository';

// Mock the dependencies
vi.mock('../../adapters/ApiTaskRepository');
vi.mock('../../../application/services/TaskApplicationService');

const MockApiTaskRepository = vi.mocked(ApiTaskRepository);
const MockTaskApplicationService = vi.mocked(TaskApplicationService);

describe('ServiceContainer', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Reset the singleton instance for each test
    (serviceContainer as any).constructor.instance = undefined;
    (serviceContainer as any)._taskRepository = undefined;
    (serviceContainer as any)._taskApplicationService = undefined;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getInstance', () => {
    it('creates a singleton instance', () => {
      const container1 = (serviceContainer as any).constructor.getInstance();
      const container2 = (serviceContainer as any).constructor.getInstance();

      expect(container1).toBe(container2);
      expect(container1).toBeDefined();
    });

    it('returns the same instance on multiple calls', () => {
      const instances = Array.from({ length: 5 }, () =>
        (serviceContainer as any).constructor.getInstance()
      );

      const firstInstance = instances[0];
      instances.forEach(instance => {
        expect(instance).toBe(firstInstance);
      });
    });
  });

  describe('taskRepository', () => {
    it('creates ApiTaskRepository on first access', () => {
      const repository = serviceContainer.taskRepository;

      expect(MockApiTaskRepository).toHaveBeenCalledTimes(1);
      expect(repository).toBeInstanceOf(ApiTaskRepository);
    });

    it('returns the same instance on subsequent calls', () => {
      const repository1 = serviceContainer.taskRepository;
      const repository2 = serviceContainer.taskRepository;

      expect(repository1).toBe(repository2);
      expect(MockApiTaskRepository).toHaveBeenCalledTimes(1);
    });

    it('lazy loads the repository', () => {
      // Repository should not be created until accessed
      expect(MockApiTaskRepository).not.toHaveBeenCalled();

      // Access the repository
      serviceContainer.taskRepository;

      expect(MockApiTaskRepository).toHaveBeenCalledTimes(1);
    });
  });

  describe('taskApplicationService', () => {
    it('creates TaskApplicationService with repository dependency', () => {
      const applicationService = serviceContainer.taskApplicationService;

      expect(MockTaskApplicationService).toHaveBeenCalledTimes(1);
      expect(MockTaskApplicationService).toHaveBeenCalledWith(serviceContainer.taskRepository);
      expect(applicationService).toBeInstanceOf(TaskApplicationService);
    });

    it('returns the same instance on subsequent calls', () => {
      const service1 = serviceContainer.taskApplicationService;
      const service2 = serviceContainer.taskApplicationService;

      expect(service1).toBe(service2);
      expect(MockTaskApplicationService).toHaveBeenCalledTimes(1);
    });

    it('lazy loads the application service', () => {
      // Service should not be created until accessed
      expect(MockTaskApplicationService).not.toHaveBeenCalled();

      // Access the service
      serviceContainer.taskApplicationService;

      expect(MockTaskApplicationService).toHaveBeenCalledTimes(1);
    });

    it('uses the same repository instance for application service', () => {
      const repository = serviceContainer.taskRepository;
      const applicationService = serviceContainer.taskApplicationService;

      expect(MockTaskApplicationService).toHaveBeenCalledWith(repository);
    });
  });

  describe('setTaskRepository', () => {
    it('allows setting a custom repository', () => {
      const mockRepository: TaskRepository = {
        findAll: vi.fn(),
        findById: vi.fn(),
        findByState: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        deleteCompleted: vi.fn(),
        deleteFailed: vi.fn(),
        activate: vi.fn(),
        complete: vi.fn(),
        fail: vi.fn(),
        reactivate: vi.fn(),
      };

      serviceContainer.setTaskRepository(mockRepository);

      const repository = serviceContainer.taskRepository;
      expect(repository).toBe(mockRepository);
      expect(MockApiTaskRepository).not.toHaveBeenCalled();
    });

    it('creates new application service with custom repository', () => {
      const mockRepository: TaskRepository = {
        findAll: vi.fn(),
        findById: vi.fn(),
        findByState: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        deleteCompleted: vi.fn(),
        deleteFailed: vi.fn(),
        activate: vi.fn(),
        complete: vi.fn(),
        fail: vi.fn(),
        reactivate: vi.fn(),
      };

      serviceContainer.setTaskRepository(mockRepository);

      const applicationService = serviceContainer.taskApplicationService;

      expect(MockTaskApplicationService).toHaveBeenCalledWith(mockRepository);
      expect(applicationService).toBeInstanceOf(TaskApplicationService);
    });

    it('replaces existing repository and recreates application service', () => {
      // First, access the default repository and service
      const originalRepo = serviceContainer.taskRepository;
      const originalService = serviceContainer.taskApplicationService;

      expect(MockTaskApplicationService).toHaveBeenCalledTimes(1);

      // Now set a custom repository
      const mockRepository: TaskRepository = {
        findAll: vi.fn(),
        findById: vi.fn(),
        findByState: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        deleteCompleted: vi.fn(),
        deleteFailed: vi.fn(),
        activate: vi.fn(),
        complete: vi.fn(),
        fail: vi.fn(),
        reactivate: vi.fn(),
      };

      serviceContainer.setTaskRepository(mockRepository);

      // Repository should be replaced
      const newRepo = serviceContainer.taskRepository;
      expect(newRepo).toBe(mockRepository);
      expect(newRepo).not.toBe(originalRepo);

      // Application service should be recreated
      const newService = serviceContainer.taskApplicationService;
      expect(MockTaskApplicationService).toHaveBeenCalledTimes(2);
      expect(MockTaskApplicationService).toHaveBeenLastCalledWith(mockRepository);
    });
  });

  describe('dependency injection scenarios', () => {
    it('handles multiple service access patterns', () => {
      // Access application service first (should create repository internally)
      const applicationService = serviceContainer.taskApplicationService;

      // Then access repository
      const repository = serviceContainer.taskRepository;

      // Should use the same repository instance
      expect(MockTaskApplicationService).toHaveBeenCalledWith(repository);
      expect(MockApiTaskRepository).toHaveBeenCalledTimes(1);
      expect(MockTaskApplicationService).toHaveBeenCalledTimes(1);
    });

    it('maintains consistency across service instances', () => {
      const repo1 = serviceContainer.taskRepository;
      const service1 = serviceContainer.taskApplicationService;

      // Clear mocks to test reuse
      vi.clearAllMocks();

      const repo2 = serviceContainer.taskRepository;
      const service2 = serviceContainer.taskApplicationService;

      // Should reuse existing instances
      expect(repo1).toBe(repo2);
      expect(service1).toBe(service2);
      expect(MockApiTaskRepository).not.toHaveBeenCalled();
      expect(MockTaskApplicationService).not.toHaveBeenCalled();
    });
  });

  describe('singleton behavior', () => {
    it('maintains state across different access points', () => {
      // Don't reset the singleton for this test - create a fresh singleton manually
      const ContainerClass = (serviceContainer as any).constructor;
      ContainerClass.instance = undefined;

      const container1 = ContainerClass.getInstance();

      // Set a custom repository
      const mockRepository: TaskRepository = {
        findAll: vi.fn(),
        findById: vi.fn(),
        findByState: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        deleteCompleted: vi.fn(),
        deleteFailed: vi.fn(),
        activate: vi.fn(),
        complete: vi.fn(),
        fail: vi.fn(),
        reactivate: vi.fn(),
      };

      container1.setTaskRepository(mockRepository);

      // Get a new reference to the container
      const container2 = ContainerClass.getInstance();

      // Should maintain the custom repository (check that it's the same instance)
      expect(container2).toBe(container1);
      expect(container2.taskRepository).toBe(mockRepository);
    });

    it('ensures thread-safe singleton creation', () => {
      // Simulate concurrent access (though JS is single-threaded, this tests the logic)
      const promises = Array.from({ length: 10 }, () =>
        Promise.resolve((serviceContainer as any).constructor.getInstance())
      );

      return Promise.all(promises).then(instances => {
        const firstInstance = instances[0];
        instances.forEach(instance => {
          expect(instance).toBe(firstInstance);
        });
      });
    });
  });

  describe('error handling', () => {
    it('handles repository creation errors gracefully', () => {
      MockApiTaskRepository.mockImplementation(() => {
        throw new Error('Repository creation failed');
      });

      expect(() => serviceContainer.taskRepository).toThrow('Repository creation failed');
    });

    it('handles application service creation errors gracefully', () => {
      MockTaskApplicationService.mockImplementation(() => {
        throw new Error('Service creation failed');
      });

      expect(() => serviceContainer.taskApplicationService).toThrow('Service creation failed');
    });

    it('handles null repository injection', () => {
      expect(() => {
        serviceContainer.setTaskRepository(null as any);
      }).not.toThrow();

      // Accessing the repository should return an ApiTaskRepository since null is falsy
      expect(serviceContainer.taskRepository).toBeInstanceOf(ApiTaskRepository);
    });
  });

  describe('memory management', () => {
    it('maintains references to prevent garbage collection', () => {
      const repository = serviceContainer.taskRepository;
      const applicationService = serviceContainer.taskApplicationService;

      // Simulate garbage collection scenario
      const weakRepository = new WeakRef(repository);
      const weakService = new WeakRef(applicationService);

      // References should still be strong through the container
      expect(weakRepository.deref()).toBeDefined();
      expect(weakService.deref()).toBeDefined();
    });

    it('allows for service replacement without memory leaks', () => {
      // Get original services
      const originalRepo = serviceContainer.taskRepository;
      const originalService = serviceContainer.taskApplicationService;

      // Replace with new repository
      const newMockRepository: TaskRepository = {
        findAll: vi.fn(),
        findById: vi.fn(),
        findByState: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        deleteCompleted: vi.fn(),
        deleteFailed: vi.fn(),
        activate: vi.fn(),
        complete: vi.fn(),
        fail: vi.fn(),
        reactivate: vi.fn(),
      };

      serviceContainer.setTaskRepository(newMockRepository);

      // New instances should be different
      const newRepo = serviceContainer.taskRepository;
      const newService = serviceContainer.taskApplicationService;

      expect(newRepo).not.toBe(originalRepo);
      expect(newService).not.toBe(originalService);
      expect(newRepo).toBe(newMockRepository);
    });
  });

  describe('container lifecycle', () => {
    it('supports container reset for testing', () => {
      // Access services to create them
      const originalRepo = serviceContainer.taskRepository;
      const originalService = serviceContainer.taskApplicationService;

      // Manually reset the container state (simulating test cleanup)
      (serviceContainer as any)._taskRepository = undefined;
      (serviceContainer as any)._taskApplicationService = undefined;

      // Clear mocks to track new creations
      vi.clearAllMocks();

      // Access services again
      const newRepo = serviceContainer.taskRepository;
      const newService = serviceContainer.taskApplicationService;

      // Should create new instances
      expect(MockApiTaskRepository).toHaveBeenCalledTimes(1);
      expect(MockTaskApplicationService).toHaveBeenCalledTimes(1);
      expect(newRepo).not.toBe(originalRepo);
      expect(newService).not.toBe(originalService);
    });
  });
});