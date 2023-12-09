const fs = require('fs');
const path = require('path'); 
const {makeTree}=require('../../../src/common/filesystem');
 


// Example usage with simplified options 

var tree = makeTree('./src');
console.log(tree);

// Example usage with options
  
 var tree = makeTree('./src', {
    fileFilter: (filePath) => filePath.endsWith('.js'),
    dirFilter: (dirPath) => dirPath !== '/path/to/your/folder/excludeThisDirectory',  
  });
console.log(tree);


 
  // Manipulator of the file object creation 
  const fileKeyValue = (uri,name) => { 
  return {// IMPORTANT: it must return an obect {key:string value:any}  
    key:name+' ModifiedKeyName',
    value:fs.readFileSync(uri, 'utf-8').trim().slice(0, 10)
  }
  }
  // Manipulator of the file object creation 
  const dirKey = (uri,name) => { 
    return {// IMPORTANT: it must return an obect {key:string }  
      key:name+' ModifiedFolderName',
    }
    }


  const tree = makeTree('./src',{fileKeyValue,dirKey});
  console.log(tree);

 