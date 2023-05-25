import app from '../index.js';

const FORMAT_NAME = 'JSON';

const jsonParse = (content) => JSON.parse(content);

export default () => app(FORMAT_NAME, jsonParse);
