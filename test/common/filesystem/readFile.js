const fs = require('fs').promises;
const path = require('path');
const {remove,generateHierarchy,readFile}=require('../../../src/common/filesystem');


// # Create a temp for tests  
/*
temp/ 
└── file.json
*/
(async ()=>{
    const deploymentPath =path.join('./test/temp','readFile');  
    response =await generateHierarchy(deploymentPath, [
        { type: 'file', name: 'file.json', content: '{"a":1,"b":2}' }, 
    ],{verbose:true,overwrite:undefined});
     
    if(response.error){
        console.log(response)
        return;
    }
 


 
// # Test start
 
 
// Example usage:
// confirm can be y/n or undefined if its undefined it will ask
    // Copy a file 
    
   // Copy a folder

   r =  readFile(path.join(__dirname, "./../../temp/readFile/file.json"),{datatype:'JSON'})
 
   console.log(r);
})();



 