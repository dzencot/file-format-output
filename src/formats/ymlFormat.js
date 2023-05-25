import yaml from 'js-yaml';
import app from '../index.js';

const FORMAT_NAME = 'YAML';

const ymlParse = (content) => yaml.load(content);

export default () => app(FORMAT_NAME, ymlParse);
