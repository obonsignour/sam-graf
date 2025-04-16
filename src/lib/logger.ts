// A centralized logging service that captures logs for export

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'time' | 'timeEnd';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
}

class LoggerService {
  private logs: LogEntry[] = [];
  private maxEntries: number = 10000; // Limit to prevent memory issues
  private startTimes: Record<string, number> = {};
  
  constructor() {
    // Optionally override console methods to capture all logs
    this.interceptConsole();
  }

  private interceptConsole() {
    const originalConsole = {
      log: console.log,
      info: console.info,
      warn: console.warn,
      error: console.error,
      time: console.time,
      timeEnd: console.timeEnd
    };

    // Override console.log
    console.log = (...args: any[]) => {
      this.debug(args[0], args.slice(1));
      originalConsole.log.apply(console, args);
    };

    // Override console.info
    console.info = (...args: any[]) => {
      this.info(args[0], args.slice(1));
      originalConsole.info.apply(console, args);
    };

    // Override console.warn
    console.warn = (...args: any[]) => {
      this.warn(args[0], args.slice(1));
      originalConsole.warn.apply(console, args);
    };

    // Override console.error
    console.error = (...args: any[]) => {
      this.error(args[0], args.slice(1));
      originalConsole.error.apply(console, args);
    };

    // Override console.time
    console.time = (label: string) => {
      this.time(label);
      originalConsole.time.apply(console, [label]);
    };

    // Override console.timeEnd
    console.timeEnd = (label: string) => {
      this.timeEnd(label);
      originalConsole.timeEnd.apply(console, [label]);
    };
  }

  private addEntry(level: LogLevel, message: string, data?: any) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message: String(message),
      data: data
    };

    this.logs.push(entry);
    
    // Trim logs if they exceed the maximum
    if (this.logs.length > this.maxEntries) {
      this.logs = this.logs.slice(-this.maxEntries);
    }
  }

  public debug(message: any, data?: any) {
    this.addEntry('debug', message, data);
  }

  public info(message: any, data?: any) {
    this.addEntry('info', message, data);
  }

  public warn(message: any, data?: any) {
    this.addEntry('warn', message, data);
  }

  public error(message: any, data?: any) {
    this.addEntry('error', message, data);
  }

  public time(label: string) {
    this.startTimes[label] = performance.now();
    this.addEntry('time', `Timer started: ${label}`);
  }

  public timeEnd(label: string) {
    if (this.startTimes[label]) {
      const duration = performance.now() - this.startTimes[label];
      this.addEntry('timeEnd', `Timer ended: ${label} (${duration.toFixed(2)}ms)`);
      delete this.startTimes[label];
    } else {
      this.addEntry('timeEnd', `Timer ended: ${label} (timer not found)`);
    }
  }

  public getLogs(): LogEntry[] {
    return [...this.logs];
  }

  public clearLogs() {
    this.logs = [];
  }

  public downloadLogs(filename: string = 'layout-logs.json') {
    const logsJson = JSON.stringify(this.logs, null, 2);
    const blob = new Blob([logsJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }

  public downloadLogsAsText(filename: string = 'layout-logs.txt') {
    // Format logs as text for easier reading
    const logText = this.logs.map(log => 
      `[${log.timestamp}] [${log.level.toUpperCase()}] ${log.message}${log.data ? ' ' + JSON.stringify(log.data) : ''}`
    ).join('\n');
    
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }
}

// Create a singleton instance
export const logger = new LoggerService();
export default logger;