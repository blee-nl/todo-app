// Validation utilities

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

// Validate todo text
export const validateTodoText = (text: string): ValidationResult => {
  const trimmedText = text.trim();
  
  if (!trimmedText) {
    return {
      isValid: false,
      error: 'Todo text cannot be empty',
    };
  }
  
  if (trimmedText.length > 500) {
    return {
      isValid: false,
      error: 'Todo text cannot exceed 500 characters',
    };
  }
  
  return {
    isValid: true,
  };
};

// Validate todo ID
export const validateTodoId = (id: string): ValidationResult => {
  if (!id || typeof id !== 'string') {
    return {
      isValid: false,
      error: 'Invalid todo ID',
    };
  }
  
  if (id.length < 1) {
    return {
      isValid: false,
      error: 'Todo ID cannot be empty',
    };
  }
  
  return {
    isValid: true,
  };
};

// Sanitize input text
export const sanitizeText = (text: string): string => {
  return text
    .trim()
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .slice(0, 500); // Limit to 500 characters
};
