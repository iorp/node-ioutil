 
require('./../prototypes/functions');
const {promptForConfirm} = require('./terminal');
 
const fs = require('fs');
const path = require('path'); 
const rimraf = require('rimraf');
const { exec } = require('child_process');  


/**
 * Asynchronously removes a file or directory.
 *
 * @param {string} uri - The URI of the file or directory to be removed.
 * @param {Object} options - Options for the removal operation.
 * @param {boolean} options.confirm - If true, prompts for confirmation before deletion. Defaults to false.
 * @param {boolean} options.verbose - If true, logs detailed information about the deletion process. Defaults to false.
 * @returns {Object} - An object with information about the deletion operation.
 * @throws {Object} - An object with error information if an exception occurs during the removal.
 */ 
const remove = async (uri, options = {}) => { 
    var {confirm=false,verbose=false}= options;
    
    const answer = await promptForConfirm(`Do you want to delete ${uri}`, ['y', 'n'], confirm);

    if (answer === 'n') {
        if (verbose) console.log(`Path ${uri} has NOT been deleted.`);
        return { 'code': 'DontOverwrite', 'error': false ,answer:answer};
    }

    try {
        if (uri.startsWith('file://')) uri = uri.replace('file://', '').trimStart('/');

        const onRmError = (func, path, excInfo) => {
            fs.promises.chmod(path, '0o755').then(() => fs.promises.unlink(path));
        };

        if (await fs.promises.access(uri).then(() => true).catch(() => false)) {
            if ((await fs.promises.stat(uri)).isDirectory()) {
                let itemsDeleted = 0;
                let bytesDeleted = 0;
                let totalBytes = 0;

                const processFile = async (itemPath, fileSize) => {
                    totalBytes += fileSize;
                    bytesDeleted += fileSize;
                    await fs.promises.unlink(itemPath);
                    itemsDeleted++;

                    if (verbose) {
                        const progress = (bytesDeleted / Math.max(totalBytes, 1)) * 100;
                        process.stdout.write(`Deleted: ${bytesDeleted} bytes / ${totalBytes} bytes (${progress.toFixed(2)}%)`);
                        process.stdout.write('\r');
                        
                    }
                };

                const processDirectory = async (dirPath) => {
                    const items = await fs.promises.readdir(dirPath);
                    for (const item of items) {
                        const itemPath = path.join(dirPath, item);

                        if ((await fs.promises.stat(itemPath)).isDirectory()) {
                            await exec(`attrib -H "${itemPath}"`);
                            await processDirectory(itemPath);
                            itemsDeleted++;
                        } else {
                            await processFile(itemPath, (await fs.promises.stat(itemPath)).size);
                        }
                    }
                };

                await processDirectory(uri);
                //fs.promises.rm(pathToDelete, { recursive: true }).catch(onRmError);
                //await fs.promises.rmdir(pathToDelete, { recursive: true }).catch(onRmError);
        
                rimraf.sync(uri, { onerror: onRmError });
            } else {
                const fileBytes = (await fs.promises.stat(uri)).size;
                await fs.promises.unlink(uri).catch(onRmError);

                if (verbose) {
                    const progress = 100.0;
                    process.stdout.write(`Deleted: ${fileBytes} bytes / ${fileBytes} bytes (${progress.toFixed(2)}%)`);
                    process.stdout.write('\r');
                    
                }
            }
        } else {
            return { 'error': true, 'code': 'RemovePathNotFound', 'exception': `File not found: ${uri}` };
        }
 
        if (verbose) console.log(`Path ${uri} has been deleted.`);
        return { 'code': 'FileSystemRemove', 'answer': answer };
    } catch (e) {
        return { 'error': true, 'code': 'RemoveException', 'exception': e.toString() };
    }
};

/**
 * Asynchronously generates a directory hierarchy with files and subdirectories.
 *
 * @param {string} base - The base path where the hierarchy will be created.
 * @param {Object|Array} items - The items to be created in the hierarchy. Can be a single item or an array of items.
 * @param {Object} options - Options for the hierarchy generation.
 * @param {boolean|null} options.overwrite - If true, overwrites existing directory. If null, prompts for confirmation. Defaults to null.
 * @param {boolean} options.verbose - If true, logs detailed information about the generation process. Defaults to false.
 * @returns {Object} - An object indicating the success of the hierarchy creation.
 * @throws {Object} - An object with error information if an exception occurs during hierarchy creation.
 */
async function generateHierarchy(base, items, options={}) { 
    var {overwrite=null,verbose = false}= options;
    async function createItems(currentPath, items) {
        for (const item of items) {
            const itemPath = path.join(currentPath, item.name);

            if (item.type === 'file') {
                item.content = typeof item.content==="string"? item.content : JSON.stringify(item.content,null,2)
                await fs.promises.writeFile(itemPath, item.content, { encoding: item.encoding || 'utf-8' });
                if (verbose) console.log(`File '${itemPath}' created.`);
            } else if (item.type === 'dir') {
                await fs.promises.mkdir(itemPath);
                if (verbose) console.log(`Directory '${itemPath}' created.`);
                if (item.children) {
                    await createItems(itemPath, item.children);
                }
            }
        }
    } 
   try {

        if(directoryExists(base)) {
         
          r=  await remove(base,{confirm:overwrite,verbose:verbose}); 
          // return if error or dont overwrite
          if(r.error || r.answer=='n' || r.answer==false)return r; 
        }
         fs.mkdirSync(base, { recursive: true });  

        if (!Array.isArray(items)) items = [items];

        await createItems(base, items);
        if (verbose) console.log('Files and folders created successfully.');
        return { success: true, items: items };
    } catch (error) {
        error = { error: true, code: 'CreateHierarchyError', exception: error.message };
        return error;
    }
}

/**
 * Synchronously checks if a directory exists at the given path.
 *
 * @param {string} uri - The path to the directory.
 * @returns {boolean} - True if the directory exists, false otherwise.
 */
function directoryExists(uri) {
    try {
        const stats = fs.statSync(uri);
        return stats.isDirectory();
    } catch (error) {
        if (error.code === 'ENOENT') {
            return false; // Directory does not exist
        }
        throw error; // Propagate other errors
    }
}

/**
 * Synchronously checks if a file exists at the given path.
 *
 * @param {string} uri - The path to the file.
 * @returns {boolean} - True if the file exists, false otherwise.
 */
function fileExists(uri) {
    try {
        fs.accessSync(uri);
        return true; // File exists
    } catch (error) {
        if (error.code === 'ENOENT') {
            return false; // File does not exist
        }
        throw error; // Propagate other errors
    }
}

/**
 * Synchronously checks if a path (file or directory) exists at the given path.
 *
 * @param {string} uri - The path to the file or directory.
 * @returns {boolean} - True if the path exists, false otherwise.
 */
function pathExists(uri) {
    try {
        fs.accessSync(uri);
        return true; // Path exists
    } catch (error) {
        if (error.code === 'ENOENT') {
            return false; // Path does not exist
        }
        throw error; // Propagate other errors
    }
}
/**
 * Asynchronously copies files or directories from a source to a destination.
 *
 * @param {string} source - The source path of the file or directory to be copied.
 * @param {string|null} destination - The destination path where the file or directory will be copied.
 *                                    If null, a temporary directory is created, and the file is placed inside it.
 * @param {Object} options - Options for the copy operation.
 * @param {boolean} options.verbose - If true, logs detailed information about the copying process. Defaults to false.
 * @param {boolean|null} options.overwrite - If true, overwrites existing files or directories without prompting. If null, prompts for confirmation. Defaults to null.
 * @returns {Object} - An object with information about the success of the copy operation.
 * @throws {Object} - An object with error information if an exception occurs during the copying process.
 */
async function copy(source, destination = null, options = {})  { 
    var { verbose = false, overwrite = null } = options;

    // try {
        
        source = source.replace(/^file:[/]+/, ''); // Correcting the regular expression
        destination = destination ? destination.replace(/^file:[/]+/, '') : destination;

        // Check if the source exists
        // try {
        //     await fs.promises.access(sourcePath);
        // } catch (error) {
        //     return { error: true, code: 'CopySourceMissing', exception: `Could not find the source '${sourcePath}'` };
        // }

        if(!pathExists(source))
        return { error: true, code: 'CopySourceMissing', exception: `Could not find the source '${source}'` };


        // If no destination is provided, place the file in the temporary directory
        if (!destination) {
            // Create a temporary directory
            const tempDir = await fs.promises.mkdtemp('temp-');
            destination = path.join(tempDir, path.basename(source));
        }
         
        // Overwrite
         
        if (pathExists(destination)) {
       
            const removeResult = await remove(destination,{confirm:overwrite,verbose:verbose});
            if (removeResult.error && removeResult.code!='RemovePathNotFound') return removeResult;
            if (removeResult.answer === 'n') return { code: 'DontOverWrite', path: destination, answer: 'n' };
        }
           // overwrite='y';// atthis point answer is y
        
        // Create parent directory if required ?? todo kill
        if (!directoryExists(destination)&& (destination.includes('/') || destination.includes('\\'))) {
            await fs.promises.mkdir(path.dirname(destination), { recursive: true });
        }

        if ((await fs.promises.stat(source)).isDirectory()) {
            // Create the destination directory
            await fs.promises.mkdir(destination, { recursive: true });

            let totalSize = 0;
            let copiedSize = 0;

            const calculateTotalSize = async (dirPath) => {
                const items = await fs.promises.readdir(dirPath);
                for (const item of items) {
                    const itemPath = path.join(dirPath, item);
                    const stats = await fs.promises.stat(itemPath);
                    if (stats.isDirectory()) {
                        await calculateTotalSize(itemPath);
                    } else {
                        totalSize += stats.size;
                    }
                }
            };

            await calculateTotalSize(source);

            const copyFiles = async (srcDir, dstDir) => {
                const items = await fs.promises.readdir(srcDir);
                for (const item of items) {
                    const srcItemPath = path.join(srcDir, item);
                    const dstItemPath = path.join(dstDir, item);
                    const stats = await fs.promises.stat(srcItemPath);
                    if (stats.isDirectory()) {
                        await fs.promises.mkdir(dstItemPath, { recursive: true });
                        await copyFiles(srcItemPath, dstItemPath);
                    } else {
                        const content = await fs.promises.readFile(srcItemPath);
                        await fs.promises.writeFile(dstItemPath, content);
                        copiedSize += stats.size;
                        const progress = (copiedSize / (totalSize || 1)) * 100;
                        if (verbose) console.log(`Copied: ${copiedSize} bytes / ${totalSize} bytes (${progress.toFixed(2)}%)`);
                    }
                }
            };

            await copyFiles(source, destination);

            if (verbose) console.log();
            return { code: 'CopyDirSuccess', source: source, destination: destination,  overwrite: overwrite };
 
        }

        if ((await fs.promises.stat(source)).isFile()) {
            // Copy the local file to the specified destination with a progress message
            const content = await fs.promises.readFile(source);
            await fs.promises.writeFile(destination, content);

            return { code: 'CopyFileSuccess', source: source, destination: destination, extension: path.extname(destination), overwrite: overwrite };
        }

        return { error: true, code: 'CopySourceMissing', exception: `Could not find the source '${source}'` };

    // } catch (error) {
    //     return { error: true, code: 'CopyException', exception: error.message, source: sourcePath, destination: destinationPath };
    // }
} 
 

/**
 * Writes content to a file with specified options.
 *
 * @param {string} uri - The URI of the file to be written.
 * @param {string|Object} content - The content to be written to the file.
 * @param {Object} options - Options for the write operation.
 * @param {string} options.datatype - The datatype of the content ('JSON' for JSON data). Defaults to null.
 * @param {boolean} options.merge - If true, merges existing JSON data with new data. Defaults to false.
 * @param {string} options.encoding - The encoding of the file. Defaults to 'utf-8'.
 * @returns {Object} - An object with information about the success of the write operation.
 * @throws {Object} - An object with error information if an exception occurs during the write operation.
 */ 
function writeFile(uri, content, options={}) { 
var {datatype = null, merge = false, encoding = 'utf-8' }= options;

    
    try {
        if (datatype === 'JSON') {
            if (typeof content !== 'object') {
                return { error: true, exception: "Content must be an object when datatype is set to 'JSON'" };
            }

            let existingData = {};

            // If merge is true, read existing JSON data from the file
            if (merge) {
                try {
                    const existingContent = fs.readFileSync(uri, { encoding });
                    existingData = JSON.parse(existingContent);
                } catch (readError) {
                    // Ignore read errors, assume no existing data
                }
            }

            // Merge existing data with new data
            const mergedData = merge ? Object.assign({}, existingData, content) : content;
            content = JSON.stringify(mergedData, null, 4);
        }

        try{
          fs.writeFileSync(uri, content, { encoding });
        }catch(e){
            console.error(e)
        }
        return {   code: 'WriteFileSuccess' ,uri:uri};
    } catch (error) {
        return { error: true, code: 'WriteFileError', exception: error.message };
    }
} 

/**
 * Reads content from a file with specified options.
 *
 * @param {string} uri - The URI of the file to be read.
 * @param {Object} options - Options for the read operation.
 * @param {string} options.datatype - The datatype of the content ('JSON' for JSON data). Defaults to null.
 * @param {string} options.encoding - The encoding of the file. Defaults to 'utf-8'.
 * @returns {Object} - An object with information about the success of the read operation. Retrieve object.data or object.error
 * @throws {Object} - An object with error information if an exception occurs during the read operation.
 */ 
function readFile(uri, options={}) { 
    var {datatype = null, encoding = 'utf-8' }= options;
    
    try {
        const fileContents = fs.readFileSync(uri, { encoding });

        if (datatype === 'JSON') {
            try {
                return {  data: JSON.parse(fileContents) };
            } catch (jsonError) {
                return { error: true, exception: "JSON decoding error. The file may not contain valid JSON data." };
            }
        }

        return { code: 'ReadFileSuccess',data: fileContents };
    } catch (error) {
        if (error.code === 'ENOENT') {
            return { error: true, code: 'ReadFileFileNotFoundError', exception: `File not found: ${uri}` };
        }
        return { error: true, exception: error.message };
    }
}

 

/**
 * Recursively iterates through a folder, applying a callback for each file and folder.
 *
 * @param {string} uri - The path of the folder to iterate.
 * @param {Function} callback - The callback function to apply for each file and folder.
 * @param {Object} [options={}] - Optional configuration options.
 * @param {Function} [options.fileFilter=() => true] - A function to filter files based on custom criteria.
 * @param {Function} [options.dirFilter=() => true] - A function to filter directories based on custom criteria.
 */
function iterate(uri, callback, options = {},level=0) {
   // console.log('[iterate]','uri',uri)
    // Destructure options with default values
    var { fileFilter = () => true, dirFilter = () => true } = options;
  
    // Read the contents of the folder synchronously
    fs.readdirSync(uri).forEach(file => {
      // Construct the full path of the file or directory
      const filePath = path.join(uri, file);
  
      // Check if it's a directory
      if (fs.statSync(filePath).isDirectory()) {
        // Check if the directory passes the custom filter
        if (dirFilter(filePath)) {
          // Recursively iterate through the subdirectory
          iterate(filePath, callback, options,level+1);
        }
      } else {
        // It's a file, check if it passes the custom filter
        if (fileFilter(filePath)) {
          // Invoke the callback for each file
          callback(filePath,level);
        }
      }
    });
  }
 
  /**
   * Recursively converts a file structure into a JavaScript object.
   *
   * @param {string} uri - The path of the folder to start the conversion.
   * @param {Object} [options={}] - Optional configuration options for the `iterate` function.
   * @param {Function} [options.fileFilter=() => true] - A function to filter files based on custom criteria.
   * @param {Function} [options.dirFilter=() => true] - A function to filter directories based on custom criteria.
   * @param {Function} [options.fileKeyValue=(uri, name) => { return { key: name, value: fs.readFileSync(uri, 'utf-8') }; }] - Controls how the KeyValue pair of the files is built. WARNING: It must return an object like { key: string, value: any }. By default, Key will be filename, and Value will be the file content.
   * @param {Function} [options.dirKey=(uri, name) => { return { key: name} }] - Controls how the Key of the folders is built. WARNING: It must return an object like { key: string }. By default, Key will be directory name.
   * @returns {Object} - The resulting JavaScript object representing the file structure.
   */
  function makeTree(uri, options = {}) {
    var {
      fileFilter = () => true,
      dirFilter = () => true,
      fileKeyValue =null,
      dirKey =null,
    } = options;
    
     dirKey = typeof dirKey==='function'? dirKey :(uri, name)=>{ return {key:name}};
     fileKeyValue =  typeof fileKeyValue==='function'? fileKeyValue :(uri, name) => ({ key: name, value: fs.readFileSync(uri, 'utf-8') });
 
    const tree = {};
     /**
     * Default callback function for the iterate function.
     * @param {string} uri - The path of the current file or folder.
     */
    function addToTree(uri) {
             
        uri = uri.replace(/\\/ig, '/');
        
         const parts = uri.split('/'); 
 
      // Reference to the current position in the tree
      let current = tree;
      
      // Traverse the path and create objects as needed
      for (let i = 0; i < parts.length; i++) {
        var part = parts[i]; 
        if (!current[part]) {
          // If it's the last part and a file, set the value based on the fileKeyValue function 
            if (i === parts.length - 1 && fileExists(uri)) {
            
                const { key, value } = fileKeyValue(uri, part);
            current[key] = value;
            part = key; 
          } else {
            // If it's a directory or not the last part, create an object
          //  const { key } =dirKey(uri, part);
            current[part] = {};

          
          }
        }
        current = current[part];
      }
    }
  
    // Use the iterate function with customCallback if provided; otherwise, use the default callback
    const callbackFunction = addToTree;
    iterate(uri, callbackFunction, { fileFilter, dirFilter });
  
    return tree;
  }
  


module.exports = {
    remove: remove,
    generateHierarchy:generateHierarchy,
    copy:copy,
    readFile:readFile,
    writeFile:writeFile,
    fileExists:fileExists,
    pathExists:pathExists,
    directoryExists:directoryExists,
    iterate:iterate,
    makeTree:makeTree
  };
  