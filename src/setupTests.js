import '@testing-library/jest-dom';
import { TextDecoder, TextEncoder } from 'text-encoding';
import 'jest-mock'; 

global.TextDecoder = TextDecoder;
global.TextEncoder = TextEncoder;

global.performance = {
    mark: jest.fn(),
    measure: jest.fn(),
    clearMarks: jest.fn(),
    clearMeasures: jest.fn(),
  };
