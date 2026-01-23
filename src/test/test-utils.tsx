import React from 'react';
import { render, type RenderResult } from '@testing-library/react';

type CustomRenderOptions = Parameters<typeof render>[1];

const customRender = (
  ui: React.ReactElement,
  options?: Omit<CustomRenderOptions, 'wrapper'>
): RenderResult => render(ui, { ...options });

export * from '@testing-library/react';
export { customRender as render };