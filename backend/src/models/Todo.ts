import mongoose, { Document, Schema } from 'mongoose';

// Todo interface
export interface ITodo extends Document {
  text: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date; // Date when todo was completed
}

// Todo schema
const todoSchema = new Schema<ITodo>({
  text: {
    type: String,
    required: [true, 'Todo text is required'],
    trim: true,
    maxlength: [500, 'Todo text cannot exceed 500 characters']
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date,
    default: null
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

// Index for better query performance
todoSchema.index({ completed: 1, createdAt: -1 });
todoSchema.index({ completedAt: -1 });
todoSchema.index({ text: 'text' }); // Text search index

// Pre-save middleware for validation and completedAt logic
todoSchema.pre('save', function(next) {
  if (this.text.trim().length === 0) {
    next(new Error('Todo text cannot be empty'));
  }
  
  // Set completedAt when todo is completed
  if (this.isModified('completed')) {
    if (this.completed && !this.completedAt) {
      this.completedAt = new Date();
    } else if (!this.completed) {
      this.completedAt = undefined;
    }
  }
  
  next();
});

// Static method to find todos by completion status
todoSchema.statics.findByStatus = function(completed: boolean) {
  return this.find({ completed }).sort({ createdAt: -1 });
};

// Instance method to toggle completion
todoSchema.methods.toggleComplete = function() {
  this.completed = !this.completed;
  if (this.completed && !this.completedAt) {
    this.completedAt = new Date();
  } else if (!this.completed) {
    this.completedAt = undefined;
  }
  return this.save();
};

// Create and export the model
const Todo = mongoose.model<ITodo>('Todo', todoSchema);

export default Todo;
