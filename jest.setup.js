import '@testing-library/jest-dom'
const dotenv = require('dotenv');
dotenv.config({ path: './.env.test' });

jest.setTimeout(30000); 

beforeAll(() => {
  process.env.DB_HOST = '127.0.0.1';
  process.env.DB_USER = 'root';
  process.env.DB_PASS = 'root';
  process.env.DB_NAME = 'bibliotech';
});
