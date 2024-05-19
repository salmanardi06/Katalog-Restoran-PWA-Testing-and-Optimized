// jest.setup.js
import 'fake-indexeddb/auto';

// Mocking window.location.href redirections
delete window.location;
window.location = { href: jest.fn() };

// Example of setting up a custom global function or mock
global.myCustomGlobalFunction = jest.fn();

// Mock console to avoid noisy logging in test outputs
global.console = {
  log: jest.fn(), // mocks console.log()
  error: jest.fn(), // mocks console.error()
  warn: jest.fn(), // mocks console.warn()
  info: jest.fn(), // mocks console.info()
};
