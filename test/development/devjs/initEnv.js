const fs = require('fs').promises;
const path = require('path');
const {generateHierarchy}=require('../../../src/common/filesystem');
const {initEnv}=require('../../../src/development/devjs');


// # Create a temp for tests   
(async ()=>{
    const deploymentPath =path.join('./test/temp','initEnv');  
    r =await generateHierarchy(deploymentPath, [
        { type: 'file', name: 'package.json', content: {
            name:'test',
            
        } }, 
    ],{verbose:true,overwrite:true});
     
    
 
// the environments are at ./dev.js normally 
   const Environments={
        'production':{
            REACT_APP_HOMEPAGE: 'http://production.com/build'
        },
        'development':{
            REACT_APP_HOMEPAGE: 'http://development.com:3000/'
        }
    }


   r = initEnv('development',Environments, { 'homepage': 'REACT_APP_HOMEPAGE' },(envName)=>{console.log(envName,' optional callback')},deploymentPath); 
   console.log(r);
    if(r.error) process.exit()
// # Test start
  
//    var r =  readEnvFile(path.join(__dirname, "./../../temp/readEnvFile/.env"))
 
//    console.log(r);
})();



 