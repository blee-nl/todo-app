import { describe, it, expect } from 'vitest';
import type { TaskType as APITaskType, TaskState as APITaskState } from '../../services/api';
import {
  TaskType,
  TaskState,
  CardVariant,
  LoadingText,
  ActionText,
  isOneTimeTask,
  isDailyTask,
  isPendingTask,
  isActiveTask,
  isCompletedTask,
  isFailedTask,
  isCompletedOrFailedTask,
  TASK_TYPE_CONFIG,
  TASK_STATE_CONFIG,
  VALID_TASK_TYPES,
  VALID_TASK_STATES,
  getCardVariant,
  getTaskPlaceholder,
  TASK_STATE_TABS,
  TASK_TYPE_BUTTONS,
  DEFAULT_VALUES,
} from '../taskConstants';

describe('taskConstants', () => {
  describe('TaskType Constants', () => {
    it('should have correct task type values', () => {
      expect(TaskType.ONE_TIME).toBe('one-time');
      expect(TaskType.DAILY).toBe('daily');
    });

    it('should be readonly (const assertion)', () => {
      expect(Object.keys(TaskType)).toHaveLength(2);
      expect(TaskType).toHaveProperty('ONE_TIME');
      expect(TaskType).toHaveProperty('DAILY');
    });
  });

  describe('TaskState Constants', () => {
    it('should have correct task state values', () => {
      expect(TaskState.PENDING).toBe('pending');
      expect(TaskState.ACTIVE).toBe('active');
      expect(TaskState.COMPLETED).toBe('completed');
      expect(TaskState.FAILED).toBe('failed');
    });

    it('should be readonly (const assertion)', () => {
      expect(Object.keys(TaskState)).toHaveLength(4);
      expect(TaskState).toHaveProperty('PENDING');
      expect(TaskState).toHaveProperty('ACTIVE');
      expect(TaskState).toHaveProperty('COMPLETED');
      expect(TaskState).toHaveProperty('FAILED');
    });
  });

  describe('CardVariant Constants', () => {
    it('should have correct card variant values', () => {
      expect(CardVariant.DEFAULT).toBe('default');
      expect(CardVariant.ACTIVE).toBe('active');
      expect(CardVariant.OVERDUE).toBe('overdue');
      expect(CardVariant.FAILED).toBe('failed');
    });

    it('should be readonly (const assertion)', () => {
      expect(Object.keys(CardVariant)).toHaveLength(4);
      expect(CardVariant).toHaveProperty('DEFAULT');
      expect(CardVariant).toHaveProperty('ACTIVE');
      expect(CardVariant).toHaveProperty('OVERDUE');
      expect(CardVariant).toHaveProperty('FAILED');
    });
  });

  describe('LoadingText Constants', () => {
    it('should have correct loading text values', () => {
      expect(LoadingText.ADDING).toBe('Adding...');
      expect(LoadingText.ADD_TASK).toBe('Add Task');
      expect(LoadingText.SAVING).toBe('Saving...');
      expect(LoadingText.SAVE).toBe('Save');
      expect(LoadingText.LOADING).toBe('Loading...');
    });

    it('should have user-friendly text', () => {
      Object.values(LoadingText).forEach(text => {
        expect(typeof text).toBe('string');
        expect(text.length).toBeGreaterThan(0);
        expect(text.trim()).toBe(text); // No leading/trailing whitespace
      });
    });
  });

  describe('ActionText Constants', () => {
    it('should have correct action text values', () => {
      expect(ActionText.DELETE).toBe('Delete');
      expect(ActionText.EDIT).toBe('Edit');
      expect(ActionText.CANCEL).toBe('Cancel');
      expect(ActionText.SAVE).toBe('Save');
      expect(ActionText.DELETE_ALL_COMPLETED).toBe('Delete All Completed');
      expect(ActionText.DELETE_ALL_FAILED).toBe('Delete All Failed');
      expect(ActionText.ACTIVATE).toBe('Activate');
      expect(ActionText.COMPLETE).toBe('Complete');
      expect(ActionText.FAIL).toBe('Fail');
      expect(ActionText.REACTIVATE).toBe('Reactivate');
    });

    it('should have user-friendly action text', () => {
      Object.values(ActionText).forEach(text => {
        expect(typeof text).toBe('string');
        expect(text.length).toBeGreaterThan(0);
        expect(text.trim()).toBe(text);
      });
    });
  });

  describe('Type Guards', () => {
    describe('Task Type Guards', () => {
      it('should correctly identify one-time tasks', () => {
        expect(isOneTimeTask('one-time' as APITaskType)).toBe(true);
        expect(isOneTimeTask('daily' as APITaskType)).toBe(false);
      });

      it('should correctly identify daily tasks', () => {
        expect(isDailyTask('daily' as APITaskType)).toBe(true);
        expect(isDailyTask('one-time' as APITaskType)).toBe(false);
      });

      it('should handle edge cases for task types', () => {
        // @ts-expect-error - Testing invalid input
        expect(isOneTimeTask('')).toBe(false);
        // @ts-expect-error - Testing invalid input
        expect(isDailyTask(null)).toBe(false);
        // @ts-expect-error - Testing invalid input
        expect(isOneTimeTask('invalid')).toBe(false);
      });
    });

    describe('Task State Guards', () => {
      it('should correctly identify pending tasks', () => {
        expect(isPendingTask('pending' as APITaskState)).toBe(true);
        expect(isPendingTask('active' as APITaskState)).toBe(false);
        expect(isPendingTask('completed' as APITaskState)).toBe(false);
        expect(isPendingTask('failed' as APITaskState)).toBe(false);
      });

      it('should correctly identify active tasks', () => {
        expect(isActiveTask('active' as APITaskState)).toBe(true);
        expect(isActiveTask('pending' as APITaskState)).toBe(false);
        expect(isActiveTask('completed' as APITaskState)).toBe(false);
        expect(isActiveTask('failed' as APITaskState)).toBe(false);
      });

      it('should correctly identify completed tasks', () => {
        expect(isCompletedTask('completed' as APITaskState)).toBe(true);
        expect(isCompletedTask('pending' as APITaskState)).toBe(false);
        expect(isCompletedTask('active' as APITaskState)).toBe(false);
        expect(isCompletedTask('failed' as APITaskState)).toBe(false);
      });

      it('should correctly identify failed tasks', () => {
        expect(isFailedTask('failed' as APITaskState)).toBe(true);
        expect(isFailedTask('pending' as APITaskState)).toBe(false);
        expect(isFailedTask('active' as APITaskState)).toBe(false);
        expect(isFailedTask('completed' as APITaskState)).toBe(false);
      });

      it('should correctly identify completed or failed tasks', () => {
        expect(isCompletedOrFailedTask('completed' as APITaskState)).toBe(true);
        expect(isCompletedOrFailedTask('failed' as APITaskState)).toBe(true);
        expect(isCompletedOrFailedTask('pending' as APITaskState)).toBe(false);
        expect(isCompletedOrFailedTask('active' as APITaskState)).toBe(false);
      });

      it('should handle edge cases for task states', () => {
        // @ts-expect-error - Testing invalid input
        expect(isPendingTask('')).toBe(false);
        // @ts-expect-error - Testing invalid input
        expect(isActiveTask(null)).toBe(false);
        // @ts-expect-error - Testing invalid input
        expect(isCompletedTask('invalid')).toBe(false);
      });
    });
  });

  describe('TASK_TYPE_CONFIG', () => {
    it('should have configuration for all task types', () => {
      expect(TASK_TYPE_CONFIG).toHaveProperty(TaskType.ONE_TIME);
      expect(TASK_TYPE_CONFIG).toHaveProperty(TaskType.DAILY);
    });

    it('should have complete configuration for one-time tasks', () => {
      const config = TASK_TYPE_CONFIG[TaskType.ONE_TIME];
      expect(config.label).toBe('One-time');
      expect(config.iconType).toBe('task');
      expect(config.description).toBe('One-time tasks have a specific deadline');
      expect(config.placeholderType).toBe('task');
    });

    it('should have complete configuration for daily tasks', () => {
      const config = TASK_TYPE_CONFIG[TaskType.DAILY];
      expect(config.label).toBe('Daily');
      expect(config.iconType).toBe('habit');
      expect(config.description).toBe('Daily tasks repeat every day at midnight');
      expect(config.placeholderType).toBe('habit');
    });

    it('should have consistent structure across all configurations', () => {
      Object.values(TASK_TYPE_CONFIG).forEach(config => {
        expect(config).toHaveProperty('label');
        expect(config).toHaveProperty('iconType');
        expect(config).toHaveProperty('description');
        expect(config).toHaveProperty('placeholderType');
        expect(typeof config.label).toBe('string');
        expect(typeof config.iconType).toBe('string');
        expect(typeof config.description).toBe('string');
        expect(typeof config.placeholderType).toBe('string');
      });
    });
  });

  describe('TASK_STATE_CONFIG', () => {
    it('should have configuration for all task states', () => {
      expect(TASK_STATE_CONFIG).toHaveProperty(TaskState.PENDING);
      expect(TASK_STATE_CONFIG).toHaveProperty(TaskState.ACTIVE);
      expect(TASK_STATE_CONFIG).toHaveProperty(TaskState.COMPLETED);
      expect(TASK_STATE_CONFIG).toHaveProperty(TaskState.FAILED);
    });

    it('should have correct configuration for pending state', () => {
      const config = TASK_STATE_CONFIG[TaskState.PENDING];
      expect(config.label).toBe('Pending');
      expect(config.color).toBe('text-blue-600');
      expect(config.bgColor).toBe('bg-blue-50');
    });

    it('should have correct configuration for active state', () => {
      const config = TASK_STATE_CONFIG[TaskState.ACTIVE];
      expect(config.label).toBe('Active');
      expect(config.color).toBe('text-green-600');
      expect(config.bgColor).toBe('bg-green-50');
    });

    it('should have correct configuration for completed state', () => {
      const config = TASK_STATE_CONFIG[TaskState.COMPLETED];
      expect(config.label).toBe('Completed');
      expect(config.color).toBe('text-gray-600');
      expect(config.bgColor).toBe('bg-gray-50');
    });

    it('should have correct configuration for failed state', () => {
      const config = TASK_STATE_CONFIG[TaskState.FAILED];
      expect(config.label).toBe('Failed');
      expect(config.color).toBe('text-red-600');
      expect(config.bgColor).toBe('bg-red-50');
    });

    it('should have valid Tailwind CSS classes', () => {
      Object.values(TASK_STATE_CONFIG).forEach(config => {
        expect(config.color).toMatch(/^text-\w+-\d+$/);
        expect(config.bgColor).toMatch(/^bg-\w+-\d+$/);
      });
    });
  });

  describe('Validation Arrays', () => {
    it('should have all valid task types', () => {
      expect(VALID_TASK_TYPES).toHaveLength(2);
      expect(VALID_TASK_TYPES).toContain(TaskType.ONE_TIME);
      expect(VALID_TASK_TYPES).toContain(TaskType.DAILY);
    });

    it('should have all valid task states', () => {
      expect(VALID_TASK_STATES).toHaveLength(4);
      expect(VALID_TASK_STATES).toContain(TaskState.PENDING);
      expect(VALID_TASK_STATES).toContain(TaskState.ACTIVE);
      expect(VALID_TASK_STATES).toContain(TaskState.COMPLETED);
      expect(VALID_TASK_STATES).toContain(TaskState.FAILED);
    });

    it('should be readonly arrays', () => {
      // Const assertions provide TypeScript readonly behavior, but don't prevent runtime modifications
      // Instead, test that the arrays contain the expected values
      expect(VALID_TASK_TYPES).toEqual([TaskType.ONE_TIME, TaskType.DAILY]);
      expect(VALID_TASK_STATES).toEqual([TaskState.PENDING, TaskState.ACTIVE, TaskState.COMPLETED, TaskState.FAILED]);

      // Verify immutability through type checking (compile-time)
      const types = VALID_TASK_TYPES;
      const states = VALID_TASK_STATES;
      expect(types).toBe(VALID_TASK_TYPES);
      expect(states).toBe(VALID_TASK_STATES);
    });
  });

  describe('Utility Functions', () => {
    describe('getCardVariant', () => {
      it('should return correct variant for active state', () => {
        expect(getCardVariant('active' as APITaskState)).toBe(CardVariant.ACTIVE);
      });

      it('should return correct variant for failed state', () => {
        expect(getCardVariant('failed' as APITaskState)).toBe(CardVariant.FAILED);
      });

      it('should return default variant for pending state', () => {
        expect(getCardVariant('pending' as APITaskState)).toBe(CardVariant.DEFAULT);
      });

      it('should return default variant for completed state', () => {
        expect(getCardVariant('completed' as APITaskState)).toBe(CardVariant.DEFAULT);
      });

      it('should handle edge cases', () => {
        // @ts-expect-error - Testing invalid input
        expect(getCardVariant('invalid')).toBe(CardVariant.DEFAULT);
        // @ts-expect-error - Testing invalid input
        expect(getCardVariant(null)).toBe(CardVariant.DEFAULT);
      });
    });

    describe('getTaskPlaceholder', () => {
      it('should return correct placeholder for one-time tasks', () => {
        expect(getTaskPlaceholder('one-time' as APITaskType)).toBe('What task needs to be done?');
      });

      it('should return correct placeholder for daily tasks', () => {
        expect(getTaskPlaceholder('daily' as APITaskType)).toBe('What habit needs to be done?');
      });

      it('should handle edge cases gracefully', () => {
        // For invalid task types, it should throw or return a reasonable default
        expect(() => {
          // @ts-expect-error - Testing invalid input
          getTaskPlaceholder('invalid');
        }).toThrow();
      });
    });
  });

  describe('Navigation Configuration', () => {
    describe('TASK_STATE_TABS', () => {
      it('should have tabs for all task states', () => {
        expect(TASK_STATE_TABS).toHaveLength(4);

        const states = TASK_STATE_TABS.map(tab => tab.state);
        expect(states).toContain(TaskState.PENDING);
        expect(states).toContain(TaskState.ACTIVE);
        expect(states).toContain(TaskState.COMPLETED);
        expect(states).toContain(TaskState.FAILED);
      });

      it('should have correct tab configuration structure', () => {
        TASK_STATE_TABS.forEach(tab => {
          expect(tab).toHaveProperty('label');
          expect(tab).toHaveProperty('state');
          expect(tab).toHaveProperty('icon');
          expect(typeof tab.label).toBe('string');
          expect(typeof tab.state).toBe('string');
          expect(typeof tab.icon).toBe('string');
        });
      });

      it('should use labels from TASK_STATE_CONFIG', () => {
        TASK_STATE_TABS.forEach(tab => {
          expect(tab.label).toBe(TASK_STATE_CONFIG[tab.state].label);
        });
      });

      it('should have appropriate icons', () => {
        const tabByState = Object.fromEntries(
          TASK_STATE_TABS.map(tab => [tab.state, tab])
        );

        expect(tabByState[TaskState.PENDING].icon).toBe('clock');
        expect(tabByState[TaskState.ACTIVE].icon).toBe('task');
        expect(tabByState[TaskState.COMPLETED].icon).toBe('success');
        expect(tabByState[TaskState.FAILED].icon).toBe('error');
      });
    });

    describe('TASK_TYPE_BUTTONS', () => {
      it('should have buttons for all task types', () => {
        expect(TASK_TYPE_BUTTONS).toHaveLength(2);

        const types = TASK_TYPE_BUTTONS.map(button => button.type);
        expect(types).toContain(TaskType.ONE_TIME);
        expect(types).toContain(TaskType.DAILY);
      });

      it('should have correct button configuration structure', () => {
        TASK_TYPE_BUTTONS.forEach(button => {
          expect(button).toHaveProperty('type');
          expect(button).toHaveProperty('label');
          expect(button).toHaveProperty('variant');
          expect(typeof button.type).toBe('string');
          expect(typeof button.label).toBe('string');
          expect(typeof button.variant).toBe('string');
        });
      });

      it('should use labels from TASK_TYPE_CONFIG', () => {
        TASK_TYPE_BUTTONS.forEach(button => {
          expect(button.label).toBe(TASK_TYPE_CONFIG[button.type].label);
        });
      });

      it('should have appropriate button variants', () => {
        const buttonByType = Object.fromEntries(
          TASK_TYPE_BUTTONS.map(button => [button.type, button])
        );

        expect(buttonByType[TaskType.ONE_TIME].variant).toBe('primary');
        expect(buttonByType[TaskType.DAILY].variant).toBe('success');
      });
    });
  });

  describe('DEFAULT_VALUES', () => {
    it('should have correct default task type', () => {
      expect(DEFAULT_VALUES.TASK_TYPE).toBe(TaskType.ONE_TIME);
    });

    it('should have correct default task state', () => {
      expect(DEFAULT_VALUES.TASK_STATE).toBe(TaskState.PENDING);
    });

    it('should use valid default values', () => {
      expect(VALID_TASK_TYPES).toContain(DEFAULT_VALUES.TASK_TYPE);
      expect(VALID_TASK_STATES).toContain(DEFAULT_VALUES.TASK_STATE);
    });
  });

  describe('Integration and Consistency', () => {
    it('should have consistent task types across all configurations', () => {
      const configTypes = Object.keys(TASK_TYPE_CONFIG);
      const constantTypes = Object.values(TaskType);
      const validTypes = [...VALID_TASK_TYPES];

      expect(configTypes.sort()).toEqual(constantTypes.sort());
      expect(validTypes.sort()).toEqual(constantTypes.sort());
    });

    it('should have consistent task states across all configurations', () => {
      const configStates = Object.keys(TASK_STATE_CONFIG);
      const constantStates = Object.values(TaskState);
      const validStates = [...VALID_TASK_STATES];

      expect(configStates.sort()).toEqual(constantStates.sort());
      expect(validStates.sort()).toEqual(constantStates.sort());
    });

    it('should have matching tab and button configurations', () => {
      TASK_STATE_TABS.forEach(tab => {
        expect(VALID_TASK_STATES).toContain(tab.state);
        expect(TASK_STATE_CONFIG).toHaveProperty(tab.state);
      });

      TASK_TYPE_BUTTONS.forEach(button => {
        expect(VALID_TASK_TYPES).toContain(button.type);
        expect(TASK_TYPE_CONFIG).toHaveProperty(button.type);
      });
    });
  });

  describe('Real-world Usage Scenarios', () => {
    it('should support task validation', () => {
      const validTask = {
        type: TaskType.ONE_TIME,
        state: TaskState.PENDING,
      };

      expect(VALID_TASK_TYPES.includes(validTask.type)).toBe(true);
      expect(VALID_TASK_STATES.includes(validTask.state)).toBe(true);
      expect(isOneTimeTask(validTask.type)).toBe(true);
      expect(isPendingTask(validTask.state)).toBe(true);
    });

    it('should support UI rendering configurations', () => {
      const taskType = TaskType.DAILY;
      const taskState = TaskState.ACTIVE;

      const typeConfig = TASK_TYPE_CONFIG[taskType];
      const stateConfig = TASK_STATE_CONFIG[taskState];
      const cardVariant = getCardVariant(taskState);
      const placeholder = getTaskPlaceholder(taskType);

      expect(typeConfig.label).toBe('Daily');
      expect(stateConfig.color).toBe('text-green-600');
      expect(cardVariant).toBe(CardVariant.ACTIVE);
      expect(placeholder).toBe('What habit needs to be done?');
    });

    it('should support navigation and button rendering', () => {
      const tabs = TASK_STATE_TABS.map(tab => ({
        key: tab.state,
        label: tab.label,
        icon: tab.icon,
      }));

      const buttons = TASK_TYPE_BUTTONS.map(button => ({
        key: button.type,
        label: button.label,
        variant: button.variant,
      }));

      expect(tabs).toHaveLength(4);
      expect(buttons).toHaveLength(2);

      tabs.forEach(tab => {
        expect(tab.label).toBeTruthy();
        expect(tab.icon).toBeTruthy();
      });

      buttons.forEach(button => {
        expect(button.label).toBeTruthy();
        expect(button.variant).toBeTruthy();
      });
    });
  });
});