import React from 'react';
import { render, screen } from './test/test-utils';
import '@testing-library/jest-dom';
import App from './App';
import { TEST_IDS } from './test/constants';

describe('App', () => {
  beforeEach(() => {
    render(<App />);
  });

  describe('Layout', () => {
    it('renders main container with correct structure', () => {
      const container = screen.getByTestId(TEST_IDS.APP.CONTAINER);
      expect(container).toBeInTheDocument();
      expect(container).toHaveClass('App');
    });

    it('renders header section', () => {
      const header = screen.getByTestId(TEST_IDS.APP.HEADER);
      expect(header).toBeInTheDocument();
      expect(header).toHaveClass('App-header');
    });

    it('renders chat interface', () => {
      const chat = screen.getByTestId(TEST_IDS.APP.CHAT);
      expect(chat).toBeInTheDocument();
    });
  });

  describe('Content', () => {
    it('displays correct title text', () => {
      const heading = screen.getByRole('heading', { name: /BLXCK\.chat/i });
      expect(heading).toBeInTheDocument();
    });

    it('displays subtitle text', () => {
      const subtitle = screen.getByText(/Your AI Chat Interface/i);
      expect(subtitle).toBeInTheDocument();
    });
  });
});