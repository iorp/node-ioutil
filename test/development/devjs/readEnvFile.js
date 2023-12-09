const fs = require('fs').promises;
const path = require('path');
const {remove,generateHierarchy}=require('../../../src/common/filesystem');
const {readEnvFile}=require('../../../src/development/devjs');


// # Create a temp for tests  
/*
temp/ 
└── file.json
*/
(async ()=>{
    const deploymentPath =path.join('./test/temp','readEnvFile');  
    response =await generateHierarchy(deploymentPath, [
        { type: 'file', name: '.env', content: 'a=1\nb=2' }, 
    ],{verbose:true,overwrite:null});
     
    
 


 
// # Test start
  
   var r =  readEnvFile(path.join(__dirname, "./../../temp/readEnvFile/.env"))
 
   console.log(r);
})();



 