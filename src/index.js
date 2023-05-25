import readlineSync from 'readline-sync';
import fs from 'fs';

const askFilePath = () => {
  const filePath = readlineSync.question('Please enter file path: ');
  return filePath;
};

const getFileContent = (filePath) => {
  const content = fs.readFileSync(filePath, 'utf-8');
  return content; 
};

const app = (formatName, parse) => {
  console.log(`Welcome to ${formatName} reader!`);
  const filePath = askFilePath();
  const content = getFileContent(filePath);
  const result = parse(content);
  console.log('Result:');
  console.log(result);
};

export default app;
