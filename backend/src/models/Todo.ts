import mongoose, { Document, Schema } from 'mongoose';

// Task types
export type TaskType = 'one-time' | 'daily';

// Task states
export type TaskState = 'pending' | 'active' | 'completed' | 'failed';

// Todo interface
export interface ITodo extends Document {
  text: string;
  type: TaskType;
  state: TaskState;
  dueAt?: Date; // For one-time tasks
  createdAt: Date;
  updatedAt: Date;
  activatedAt?: Date; // When task was moved to active
  completedAt?: Date; // When task was completed
  failedAt?: Date; // When task was marked as failed
  originalId?: string; // For tracking re-activated tasks
  isReactivation?: boolean; // Flag for re-activated tasks
  
  // Instance methods
  activate(): Promise<ITodo>;
  complete(): Promise<ITodo>;
  fail(): Promise<ITodo>;
  reactivate(newDueAt?: Date): Promise<ITodo>;
}

// Todo schema
const todoSchema = new Schema<ITodo>({
  text: {
    type: String,
    required: [true, 'Todo text is required'],
    trim: true,
    maxlength: [500, 'Todo text cannot exceed 500 characters']
  },
  type: {
    type: String,
    enum: ['one-time', 'daily'],
    required: [true, 'Task type is required'],
    default: 'one-time'
  },
  state: {
    type: String,
    enum: ['pending', 'active', 'completed', 'failed'],
    required: [true, 'Task state is required'],
    default: 'pending'
  },
  dueAt: {
    type: Date,
    required: false
  },
  activatedAt: {
    type: Date,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  },
  failedAt: {
    type: Date,
    default: null
  },
  originalId: {
    type: String,
    default: null
  },
  isReactivation: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
  toJSON: {
    transform: (doc, ret: any) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes for better query performance
todoSchema.index({ state: 1, createdAt: -1 });
todoSchema.index({ type: 1, state: 1 });
todoSchema.index({ dueAt: 1 });
todoSchema.index({ text: 'text' }); // Text search index
todoSchema.index({ activatedAt: -1 });
todoSchema.index({ completedAt: -1 });
todoSchema.index({ failedAt: -1 });

// Pre-save middleware for validation and state transitions
todoSchema.pre('save', function(next) {
  if (this.text.trim().length === 0) {
    next(new Error('Todo text cannot be empty'));
  }
  
  // Validate dueAt for one-time tasks
  if (this.type === 'one-time' && !this.dueAt) {
    next(new Error('Due date is required for one-time tasks'));
  }
  
  // Set timestamps based on state changes
  if (this.isModified('state')) {
    const now = new Date();
    
    switch (this.state) {
      case 'active':
        if (!this.activatedAt) {
          this.activatedAt = now;
        }
        break;
      case 'completed':
        if (!this.completedAt) {
          this.completedAt = now;
        }
        break;
      case 'failed':
        if (!this.failedAt) {
          this.failedAt = now;
        }
        break;
    }
  }
  
  next();
});

// Define static methods interface
interface ITodoModel extends mongoose.Model<ITodo> {
  findByState(state: TaskState): mongoose.Query<ITodo[], ITodo>;
  findByType(type: TaskType): mongoose.Query<ITodo[], ITodo>;
  findActiveByType(type: TaskType): mongoose.Query<ITodo[], ITodo>;
  findOverdueTasks(): mongoose.Query<ITodo[], ITodo>;
  findDailyTasksForToday(): mongoose.Query<ITodo[], ITodo>;
}

// Static methods
todoSchema.statics.findByState = function(state: TaskState) {
  return this.find({ state }).sort({ createdAt: -1 });
};

todoSchema.statics.findByType = function(type: TaskType) {
  return this.find({ type }).sort({ createdAt: -1 });
};

todoSchema.statics.findActiveByType = function(type: TaskType) {
  return this.find({ type, state: 'active' }).sort({ createdAt: -1 });
};

todoSchema.statics.findOverdueTasks = function() {
  const now = new Date();
  return this.find({
    type: 'one-time',
    state: 'active',
    dueAt: { $lt: now }
  });
};

todoSchema.statics.findDailyTasksForToday = function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return this.find({
    type: 'daily',
    state: 'active',
    activatedAt: { $gte: today, $lt: tomorrow }
  });
};

// Instance methods
todoSchema.methods.activate = function() {
  this.state = 'active';
  if (!this.activatedAt) {
    this.activatedAt = new Date();
  }
  return this.save();
};

todoSchema.methods.complete = function() {
  this.state = 'completed';
  if (!this.completedAt) {
    this.completedAt = new Date();
  }
  return this.save();
};

todoSchema.methods.fail = function() {
  this.state = 'failed';
  if (!this.failedAt) {
    this.failedAt = new Date();
  }
  return this.save();
};

todoSchema.methods.reactivate = function(newDueAt?: Date) {
  // Create a new instance for re-activation
  const TodoModel = this.constructor as mongoose.Model<ITodo>;
  const reactivatedTask = new TodoModel({
    text: this.text,
    type: this.type,
    state: 'active',
    dueAt: newDueAt || this.dueAt,
    originalId: this._id.toString(),
    isReactivation: true,
    activatedAt: new Date()
  });
  
  return reactivatedTask.save();
};

// Pre-save validation to ensure dueAt is required for one-time tasks
todoSchema.pre('save', function(next) {
  if (this.type === 'one-time' && !this.dueAt) {
    const error = new Error('Due date is required for one-time tasks');
    return next(error);
  }
  next();
});

// Create and export the model
const Todo = mongoose.model<ITodo, ITodoModel>('Todo', todoSchema);

export default Todo;
