import React from 'react';
import { render } from '@testing-library/react';

import Index from '../src/pages';

describe('Index', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Index userId={'123456'} username={'c_tzaruba@groupon.com'} />);
    expect(baseElement).toBeTruthy();
  });
});
const s = "#e8a913";
