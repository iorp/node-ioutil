

const fs = require('fs').promises;
 
const path = require('path');
const {generateHierarchy,remove}=require('../../../src/common/filesystem');


// Example usage:


 
const itemsArray = [
    { type: 'file', name: 'myfile.txt', content: 'filecontents' },
    {
        type: 'dir', name: 'mydir', children: [
            { type: 'file', name: 'a.txt', content: 'filecontents' },
            { type: 'file', name: 'c.txt', content: 'filecontents' },
            {
                type: 'dir', name: 'mydir', children: [
                    { type: 'file', name: 'c.txt', content: 'filecontents' },
                ],
            },
        ],
    },
];
 

(async ()=>{
    const deploymentPath =path.join('./test/temp','generateHierarchy'); 
    // await deletePath(deploymentPath,undefined,true);
    //  await fs.mkdir(deploymentPath, { recursive: true });  
    response =await generateHierarchy(deploymentPath, itemsArray,{verbose:true,overwrite:null});
    console.log('generated',response);
    
})()


 