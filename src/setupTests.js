import '@testing-library/jest-dom';
import { TextDecoder, TextEncoder } from 'text-encoding';
import 'jest-mock'; 

global.TextDecoder = TextDecoder;
global.TextEncoder = TextEncoder;

