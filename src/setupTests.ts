import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';

// Suppress React 18 Act() warning
global.IS_REACT_ACT_ENVIRONMENT = true;

configure({
  testIdAttribute: 'data-testid'
});