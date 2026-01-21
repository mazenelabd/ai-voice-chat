/**
 * Utility functions for error handling and detection
 */
export class ErrorHandler {
  static isAbortError(error: unknown): boolean {
    if (error instanceof DOMException && error.name === 'AbortError') {
      return true;
    }

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return true;
      }

      const errorMessageLower = error.message.toLowerCase();
      return (
        errorMessageLower.includes('abort') ||
        errorMessageLower.includes('cancelled') ||
        errorMessageLower.includes('canceled')
      );
    }

    return false;
  }

  static getErrorMessage(
    error: unknown,
    defaultMessage: string = 'Unknown error occurred'
  ): string {
    if (error instanceof Error) {
      return error.message;
    }
    return defaultMessage;
  }
}
