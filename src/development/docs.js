

const fs = require('fs'); 
const path = require('path');

const {makeTree}=require('../../src/common/filesystem');

// /**
//  * Recursively extracts docblocks from a file structure and returns an object.
//  *
//  * @param {string} uri - The path of the folder to start the extraction.
//  * @param {Object} [options={}] - Optional configuration options for the `makeTree` function.
//  * @param {Function} [options.fileKeyValue=(filePath, fileName) => { return { key: fileName, value: fs.readFileSync(filePath, 'utf-8') }; }] - Controls how the KeyValue pair of the files is built. WARNING: It must return an object like { key: string, value: any }. By default, Key will be filename, and Value will be the file content.
//  * @param {Function} [options.dirKey=(dirPath, dirName) => { return { key: dirName }; }] - Controls how the Key of the directories is built. WARNING: It must return an object like { key: string }. By default, Key will be the directory name.
//  * @returns {Object} - The resulting JavaScript object representing the file structure with docblocks.
//  */
// function extractDocblocks(uri, options = {}) { 
    
//   // // // Example usage with custom callback: 
 
//   // // Manipulator of the file object creation 
//   const fileKeyValue = (uri,name) => { 
//     return {// IMPORTANT: it must return an obect {key:string value:any}  
//       key:name,
//       value:fs.readFileSync(uri, 'utf-8').trim().slice(0, 5)
//     }
//     }
//     // Manipulator of the file object creation 
//     const dirKey = (uri,name) => { 
//       return {// IMPORTANT: it must return an obect {key:string }  
//         key:name,
//       }
//       } 
//     return makeTree(uri,{fileKeyValue,dirKey});
  
//     }  
// /**
//  * Recursively extracts JavaScript class, function, and variable definitions along with docblocks.
//  *
//  * @param {string} jsCode - The JavaScript code to extract definitions from.
//  * @param {string} [currentPath=''] - The current path in the file structure (used for nested scenarios).
//  * @returns {Object} - An object representing the extracted definitions.
//  */
// function extractDefinitionsJS(jsCode, currentPath = '') {
//   const definitions = {};
//   const regex = /(?:(?:class|function|const|let|var)\s+([\w$]+)\s*=?\s*(\([^)]*\)|[^;=]+))/g;

//   let match;
//   let count = 0; // To generate unique keys for nested definitions
//   while ((match = regex.exec(jsCode)) !== null) {
//     const [fullMatch, name, definition] = match;
//     const uniqueKey = `${name}${count++}`;

//     let type = 'variable';
//     let extra = '';
//     let docblock = 'Undocumented';
//     let subject = 'var';
//     let argumentsList = [];

//     if (definition.includes('(')) {
//       type = 'function';
//       if (/async\s+function/.test(definition)) {
//         extra += 'async ';
//       }

//       // Placeholder for function arguments
//       argumentsList = ['arguments', 'here'];

//       // Recursively extract definitions inside functions
//       const innerCode = definition.replace(/^\([^)]*\)\s*=>\s*{/, '').replace(/}$/, '');
//       const innerDefinitions = extractDefinitionsJS(innerCode, `${currentPath}.${name}`);
//       definitions[uniqueKey] = {
//         typeof: `typeof the function ${name} here`,
//         path: `calculate the path from the current document if it is nested: ${currentPath}.${name}`,
//         arguments: argumentsList,
//         docblock: 'docblock here (uncommented and as a string)',
//         extra: `whatever extra here ${extra}`,
//         ...innerDefinitions,
//       };
//     } else if (/class\s/.test(fullMatch)) {
//       type = 'class';
//       // Placeholder for class arguments
//       argumentsList = ['arguments', 'here'];

//       // Recursively extract definitions inside classes
//       const innerCode = definition.replace(/^[\s\S]*{/, '').replace(/}$/, '');
//       const innerDefinitions = extractDefinitionsJS(innerCode, `${currentPath}.${name}`);
//       definitions[uniqueKey] = {
//         typeof: `typeof the class ${name} here`,
//         path: `calculate the path from the current document if it is nested: ${currentPath}.${name}`,
//         arguments: argumentsList,
//         docblock: 'docblock here (uncommented and as a string)',
//         extra: `whatever extra here ${extra} extends ,,,`,
//         ...innerDefinitions,
//       };
//     }

//     // Extract docblock if present
//     const docblockMatch = jsCode.match(
//       new RegExp(`\\/\\*\\*([\\s\\S]*?)\\*\\/\\s*(?:class|function|const|let|var)\\s+${name}`)
//     );

//     if (docblockMatch && docblockMatch[1]) {
//       docblock = docblockMatch[1].trim();
//     }

//     if (type !== 'function' && type !== 'class') {
//       definitions[uniqueKey] = {
//         typeof: `typeof the ${subject} ${name} here`,
//         path: `calculate the path from the current document if it is nested: ${currentPath}.${name}`,
//         docblock: 'docblock here (uncommented and as a string)',
//         extra: `whatever extra here ${extra}`,
//         subject,
//       };
//     }
//   }

//   return definitions;
// }
 


    
module.exports={
   // extractDocblocks:extractDocblocks,
    //extractDefinitionsJS:extractDefinitionsJS
  }
