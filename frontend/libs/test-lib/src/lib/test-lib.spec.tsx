import { render } from '@testing-library/react';

import TestLib from './test-lib';

describe('TestLib', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<TestLib />);
    expect(baseElement).toBeTruthy();
  });
});
