const os = require('os');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { filesystem: {writeFile } } = require('../common')
 

/**
 * Executes a command from a collection of classes in a Node.js environment.
 *
 * @param {Object} classCollection - An object containing classes or a class filled with classes,
 *                                   where each class represents a command.
 * @param {string} commandKey - The key corresponding to the command to be executed from the classCollection.
 * @param {number} argOffset - The offset in the process.argv array to start parsing command-line arguments.
 * @returns {Object} - An instance of the specified command class initialized with the parsed command-line arguments.
 *                    If the command is not found, returns an error object with details.
 *
 * @example
 * // Assuming you have a collection of command classes defined like this:
 * const classCollection = {
 *   CommandA: class CommandA { /* ... * / },
 *   CommandB: class CommandB { /* ... * / },
 *   // ...
 * };
 *
 * // To execute a command, call the executeFromCollection function:
 * const result = executeFromCollection(classCollection, 'CommandA', 2);
 * // The '2' in this example is the argOffset, assuming command-line arguments start from index 2 (e.g., 'node script.js CommandA arg1 arg2').
 *
 * // The result will be an instance of the CommandA class initialized with the parsed command-line arguments.
 * // If 'CommandA' is not found in the classCollection, an error object will be returned.
 */
function call(classCollection, commandKey, argOffset) {
    const CommandClass = classCollection[commandKey];
  
    if (CommandClass === undefined) {
      console.log(`Command "${commandKey}" not found.`);
      return {
        'error': true,
        'code': 'CommandNotFound',
        'exception': 'Command not found',
        'command': commandKey
      };
    }
  
    return new CommandClass(process.argv.slice(argOffset));
  }


/**
 * Reads variables from a .env file.
 *
 * @param {string} filePath - The path to the .env file.
 * @returns {Object} - If successful, returns an object with the data read from the .env file.
 *                    If unsuccessful, returns an error object with the following properties:
 *                    - error (boolean): true
 *                    - code (string): 'EnvReadError'
 *                    - exception (string): The exception message.
 */
function readEnvFile(filePath) {
  try {
    const data = dotenv.config({ path: filePath }).parsed;
    if (!data) {
      throw new Error('No data found in the .env file');
    }
    return { data };
  } catch (error) {
    return { error: true, code: 'EnvReadError', exception: error.message };
  }
}


/**
 * Writes variables to a .env file.
 *
 * @param {string} filePath - The path to the .env file.
 * @param {Object} data - An object containing key-value pairs to be written to the .env file.
 * @param {boolean} merge - If true, merge the new data with existing data using Object.assign.
 * @returns {Object} - If an error occurs, returns an error object with the following properties:
 *                    - error (boolean): true
 *                    - code (string): 'EnvWriteError'
 *                    - exception (string): The exception message.
 *                    If successful, returns an object with the code 'EnvWriteSuccess'.
 */
function writeEnvFile(filePath, data, merge = false) {
  try {
    let existingData = {};

    // If merge is true, read existing data from the file
    if (merge) {
      const existingResult = readEnvFile(filePath);
      if (!existingResult.error) {
        existingData = existingResult.data;
      }
    }

    const combinedData = merge ? Object.assign({}, existingData, data) : data;

    const lines = [];
    for (const key in combinedData) {
      if (Object.prototype.hasOwnProperty.call(combinedData, key)) {
        lines.push(`${key}=${combinedData[key]}`);
      }
    }

    fs.writeFileSync(filePath, lines.join('\n'));
    return { code: 'EnvWriteSuccess' };
  } catch (error) {
    return { error: true, code: 'EnvWriteError', exception: error.message };
  }
}
 
 

/**
 * Initialize environment variables and update package.json keys.
 *
 * @param {Object} environment - The environment object containing key-value pairs for the .env file.
 * @param {Object} environmentToPackageKeys - The keys to be merged with package.json.
 *                                             Example: { 'homepage': 'REACT_APP_HOMEPAGE' }
 *
 * @throws {Object} - Throws an error object with details about the encountered issue.
 * @property {number} error - Error code (1 for missing environment, 1 for missing package.json, etc.).
 * @property {string} code - Error code for easy identification.
 * @property {string} exception - Detailed exception message.
 */
function initEnv(environmentName, environments, environmentToPackageKeys = null, callback=null,basePath=null,verbose=false) {
    try {
     
        basePath = basePath? basePath:process.cwd();
        var environment = environments[environmentName];
        // Check if the provided environment exists
        if (!environment) throw {'error': 1,'code': 'DevjsWrongEnvironmentName','exception': `There is no environment named that way.` };

        // Write .env file
        var  envFilePath = path.join(basePath, '/.env');
        var r = writeEnvFile(envFilePath , environment);
        if (r.error)  throw r;

        if (environmentToPackageKeys) {
            // Update homepage and other package.json keys
            const packagePath = path.join(basePath, '/package.json');
            Object.keys(environmentToPackageKeys).forEach(key => {
                environmentToPackageKeys[key] = environment[environmentToPackageKeys[key]];
            });

            if (!fs.existsSync(packagePath)) {
                throw {
                    'error': 1,
                    'code': 'DevjsMissingPackage',
                    'exception': 'There is no package.json file!'
                };
            }

            r = writeFile(packagePath, environmentToPackageKeys, {datatype:'JSON',merge:true});
            if (r.error) throw result;
        }
        r = { 'code': 'DevjsDevInitSuccess' };
        if(verbose) console.log(r);
        if(typeof callback==='function') callback(environmentName)
        return r; 
    } catch (e) {
        if(verbose) console.log(e)
        return e;
    
    }
}

  

  module.exports={
    call:call,
    readEnvFile:readEnvFile,
    writeEnvFile:writeEnvFile,
    initEnv:initEnv
  }