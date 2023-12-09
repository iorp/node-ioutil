const fs = require('fs').promises;
const path = require('path');
const {copy,generateHierarchy}=require('../../../src/common/filesystem');


// # Create a temp for tests  
 
 (async ()=>{
    var r;
    const deploymentPath =path.join('./test/temp','copy');  
    r =await generateHierarchy(deploymentPath, [
        { type: 'file', name: 'file.txt', content: 'copiable text' },
        { type: 'dir', name: 'dir', children: [
            { type: 'file', name: 'file.txt', content: 'copiable text' } ,
            { type: 'file', name: 'file1.txt', content: 'copiable text' } 
        ],
        }
    ],{verbose:true,overwrite:null});
     
    
 


 
// # Test start
    
  
    r= await copy(
        path.join(__dirname, "./../../temp/copy/file.txt"),
        path.join(__dirname,"./../../temp/copy/copiedFile.txt"),
        {
            verbose:null,
            overwrite:null
        });
 
     
   // Copy a folder
   r= await copy(
        path.join(__dirname, "./../../temp/copy/dir"),
        path.join(__dirname, "./../../temp/copy/copiedDir"),{
            verbose:null,
            overwrite:null
        });
    console.log(r);
})();



 