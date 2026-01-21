/// <reference types="cypress" />
// ***********************************************

// Declare global types for custom commands
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface Chainable {
      // Add custom command types here if needed
    }
  }
}

export {};
