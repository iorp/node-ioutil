const fs = require('fs').promises;
const path = require('path');
const {remove,generateHierarchy}=require('../../../src/common/filesystem');
const {readEnvFile,writeEnvFile}=require('../../../src/development/devjs');


// # Create a temp for tests  
/*
temp/ 
└── file.json
*/
(async ()=>{
    const deploymentPath =path.join('./test/temp','writeEnvFile');  
    response =await generateHierarchy(deploymentPath, [
        { type: 'file', name: '.env', content: 'a=8\nb=9' }, 
    ],{verbose:true,overwrite:null});
     
    
 


 
// # Test start
  
r =  writeEnvFile(path.join(__dirname, "./../../temp/writeEnvFile/.env"),{a:2,d:3},true)
if(r.error){console.log(r);return;}
r =  readEnvFile(path.join(__dirname, "./../../temp/writeEnvFile/.env"))
 
   console.log(r);
})();



 