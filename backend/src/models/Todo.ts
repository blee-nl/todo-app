import mongoose, { Document, Schema } from 'mongoose';

// Todo interface
export interface ITodo extends Document {
  text: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
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
todoSchema.index({ text: 'text' }); // Text search index

// Pre-save middleware for validation
todoSchema.pre('save', function(next) {
  if (this.text.trim().length === 0) {
    next(new Error('Todo text cannot be empty'));
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
  return this.save();
};

// Create and export the model
const Todo = mongoose.model<ITodo>('Todo', todoSchema);

export default Todo;
