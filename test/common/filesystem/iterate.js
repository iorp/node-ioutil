const path = require('path'); 
const {iterate}=require('../../../src/common/filesystem');

// Example usage with simplified options
const uri = './src';




// Basic filesystem iteration
console.log('Basic filesystem iteration');
iterate(uri, (filePath) => {
  console.log(filePath);
  // Your callback logic for each file and folder goes here
} );


// Filtered filesystem iteration
console.log('Filtered filesystem iteration');
iterate(uri, (filePath) => {
  console.log(filePath);
  // Your callback logic for each file and folder goes here
}, {
  fileFilter: (filePath) => path.basename(filePath)==='index.js', // only allows index.js
  dirFilter: (dirPath) => dirPath !== '/path/to/your/folder/excludeThisDirectory', // it doesnt allow that dir
});


