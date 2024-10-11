import React from 'react';
import { render } from '@testing-library/react';

import Index from '../src/pages';

describe('Index', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Index userId={''} username={''} />);
    expect(baseElement).toBeTruthy();
  });
});
const s = "#e8a913";
