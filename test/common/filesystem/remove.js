const fs = require('fs').promises;
const path = require('path');
const {remove,generateHierarchy}=require('../../../src/common/filesystem');


// # Create a temp for tests  
/*
temp/
├── mydir/ 
│   └── file.txt
└── file.txt
*/
(async ()=>{
    const deploymentPath =path.join('./test/temp','remove');  
    response =await generateHierarchy(deploymentPath, [
        { type: 'file', name: 'file.txt', content: 'deleteable text' },
        { type: 'dir', name: 'mydir', children: [
                { type: 'file', name: 'file.txt', content: 'deleteable text' } 
            ],
        }
    ],{verbose:true,overwrite:'y'});
     
    
 


 
// # Test start

// Example usage:
// confirm can be y/n or undefined if its undefined it will ask
    // Delete a file
    var r = await remove("./test/temp/remove/file.txt", true,null);
    console.log(r);

    // // Delete a folder
    var r = await remove("./test/temp/remove/mydir",null, true);
    console.log(r);
})();



 