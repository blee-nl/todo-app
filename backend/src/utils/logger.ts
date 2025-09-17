type LoggerArgument = string | number | boolean | Error | Record<string, unknown> | null | undefined;

export const logger = {
  info: (message: string, ...args: LoggerArgument[]) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] INFO:`, message, ...args);
  },

  error: (message: string, ...args: LoggerArgument[]) => {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] ERROR:`, message, ...args);
  },

  warn: (message: string, ...args: LoggerArgument[]) => {
    const timestamp = new Date().toISOString();
    console.warn(`[${timestamp}] WARN:`, message, ...args);
  },

  debug: (message: string, ...args: LoggerArgument[]) => {
    const timestamp = new Date().toISOString();
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${timestamp}] DEBUG:`, message, ...args);
    }
  }
};