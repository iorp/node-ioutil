 
 
 
 const path = require('path');

// const path = require('path');
const {generateHierarchy, writeFile}=require('../../../src/common/filesystem');
  
  
const {StructDrafterJS, StringParserJS}=require('../../../src/development/turbodoc');
  
// # Create a temp for tests   
//var deploymentPath = path.join('./test/temp','structDrafterJS');
const deploymentPath = './test/temp/structDrafterJS/demo0';
 

 (async ()=>{
   
       await generateHierarchy(deploymentPath, [
        { type: 'file', name: 'file0.js', content: `
        //@doc This is file0 explanation continue here!
        /**
         *   docblock method0
         **/   
        function method0(x,y,z){ 
          //@todo bla bla 
        }
        /**
         *   docblock method1
         **/  
        function method1(x,y,z){ 
        }

        ` },
        { type: 'file', name: 'file1.js', content: `
        /**
         *   docblock method0
         **/  
        function method0(x,y,z){ 
        }
        /**
         *   docblock method1
         **/  
        function method1(x,y,z){ 
        }

        ` },
        { type: 'dir', name: 'dir0', children: [
          { type: 'file', name: 'file0.js', content: `
          /**
           *   docblock method0
           **/  
          function method0(x,y,z){ 
          }
          /**
           *   docblock method1
           **/  
          function method1(x,y,z){ 
          }
  
          ` },
        ]},

        , 
    ],{verbose:false,overwrite:true});
   





 
    const options = {
  
    };
    const parserOptions = {
      'verbose': true,
      'debug': false, // Performance tests
      'nodeDataKeyName': '@', // the subnode name here the node data is stored 
      'maxDepth': null, // The max level depth
      'captureBlocks': true, // Capture also doc blocks if present,
      'captureRoutes':true,
      'markers': { // marker tags in single line comments
        'doc': '@doc', // This markers will go right under the file title
        'todo': '@todo' // This tells turbodoc to capture @todo tags after single line comments (//)
      },
      filter: (collected, offset, lines, line, self) => {
        return true;
      }, // filter: if it returns true ,the node will be stored, if not ,the collected object will not be stored.
      onBeforeStoreNode: (collected, offset, lines, line, self) => {
        return collected;
      }, // This allows to modify the collected node data before being stored. 
      onAfterStoreNode: (collected, offset, lines, line, self) => {} // This allows to modify the collected node data after being stored. 
    };
   
      
     var r = new StructDrafterJS(deploymentPath,options,StringParserJS,parserOptions).output
     console.log(r);
     r = writeFile( path.join(__dirname, "./../../temp/structDrafterJS/demo0/DOC.md"),r.rendered);
    
      //r = JSON.stringify(r,null,2)
     console.log(r);
        


  })();
 
  
  





 