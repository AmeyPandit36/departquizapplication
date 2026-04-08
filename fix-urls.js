const fs = require('fs');
const path = require('path');

const directory = path.join(__dirname, 'client', 'src');
const target = 'http://localhost:5000';
const replacement = 'process.env.REACT_APP_API_URL';

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Replace 'http://localhost:5000/api...' with `${process.env.REACT_APP_API_URL}/api...`
      const regex1 = /'http:\/\/localhost:5000([^']*)'/g;
      const newContent1 = content.replace(regex1, '`${process.env.REACT_APP_API_URL}$1`');
      
      // Replace `http://localhost:5000/api...` with `${process.env.REACT_APP_API_URL}/api...`
      const regex2 = /`http:\/\/localhost:5000([^`]*)`/g;
      const newContent2 = newContent1.replace(regex2, '`${process.env.REACT_APP_API_URL}$1`');
      
      if (content !== newContent2) {
        fs.writeFileSync(fullPath, newContent2);
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

walkDir(directory);
console.log('Finished updating URLs');
