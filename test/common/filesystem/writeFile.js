const fs = require('fs').promises;
const path = require('path');
const {generateHierarchy,readFile,writeFile}=require('../../../src/common/filesystem');
 

// # Create a temp for tests  
/*
temp/ 
└── file.json
*/
(async ()=>{ 
    r =await generateHierarchy(path.join('./test/temp','writeFile'), [
        { type: 'file', name: 'file.json', content: '{"a":1,"b":2}' }, 
    ],{verbose:true,overwrite:null});
     
// # Test start
  

   r =  readFile(path.join(__dirname, "./../../temp/writeFile/file.json"),{datatype:'JSON'}) 
   console.log('before',r.data);
   r =  writeFile(path.join(__dirname, "./../../temp/writeFile/file.json"),{a:0,x:1,y:2},{datatype:'JSON',merge:true});
   console.log('write result :',r)
   r =  readFile(path.join(__dirname, "./../../temp/writeFile/file.json"),{datatype:'JSON'})

   console.log('after',r.data);
})();



 