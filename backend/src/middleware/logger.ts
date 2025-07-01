export function log(message: string, ...args: any[]) {
  console.log(`[${new Date().toISOString()}] ${message}`, ...args);
}

export function logError(message: string, ...args: any[]) {
  console.error(`[${new Date().toISOString()}] ERROR: ${message}`, ...args);
}
