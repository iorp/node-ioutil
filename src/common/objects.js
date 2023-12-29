/**
 * Merges two objects recursively, with the ability to merge nested objects.
 *
 * @function
 * @param {Object} a - The target object to merge into.
 * @param {Object} b - The object to merge into the target.
 * @returns {Object} - The merged object.
 */ 
const deepMerge = (a, b) => {
    if (typeof a !== 'object' || typeof b !== 'object') {
      return b;
    }
  
    const merged = { ...a };
  
    for (const key in b) {
      if (b.hasOwnProperty(key)) {
        if (a.hasOwnProperty(key) && typeof a[key] === 'object' && typeof b[key] === 'object') {
          merged[key] = deepMerge(a[key], b[key]);
        } else {
          merged[key] = b[key];
        }
      }
    }
  
    return merged;
  };
  

 /**
 * Toggles the boolean-ish value at the specified path within the target object.
 *
 * @function
 * @param {Object} target - The target object to modify.
 * @param {Array} path - The path to the boolean value within the target object.
 * @returns {Object} - The modified target object.
 */
  function toggle(target,path) {
    const previousValue =  get(target,path); 
    return set(target,path,!previousValue) ; 
    
  }
/**
 * Sets a value at a specified path in an object. Optionally merges with existing values.
 *
 * @function
 * @param {Object} target - The target object to set the value in.
 * @param {string|array} path - The path at which to set the value.
 * @param {any} value - The value to set at the specified path.
 * @param {boolean} merge - If true, merge the new value with existing values at the path.
 * @returns {Object} - The modified target object.
 */
function set(target,path, value, merge) {

     
    if (!target) console.error("set: No target provided")
    if (!path) console.error("set: No path provided")

    if (path == "") {
        target = value;
    } else {

        let current = target;
        if (typeof path === 'string') path = path.split('.');
        for (let i = 0; i < path.length; i++) {
            if (current[path[i]]===undefined) current[path[i]] = {};

            if (i == path.length - 1) {

                if (merge) {
                    Object.assign(current[path[i]], value)
                } else {
                    current[path[i]] = value;
                }

            } else {
                //SET NEXT NODE
                current = current[path[i]];
            }
        }
    }

    // Set operation returns modified root object 
    return target

}
 
/**
 * Gets the value at a specified path in an object.
 *
 * @function
 * @param {Object} target - The target object to get the value from.
 * @param {string|array} path - The path at which to get the value.
 * @returns {any} - The value at the specified path or null if not found.
 */
function get(target,path) { 
    if (!target) console.error("No object provided")
    if (!path) console.error("No path provided")

    if ((path === "")) return target;

    var current = target;
    
    if (typeof path === 'string') path = path.split('.');
    for (let i = 0; i < path.length; i++) {
        
        if (current[path[i]]==undefined) return null; // current[path[i]]={};  
        current = current[path[i]];
    } 
    return current;

}

/**
 * Deletes the value at a specified path in an object, optionally removing empty parent nodes.
 *
 * @function
 * @param {Object} target - The target object to delete the value from.
 * @param {string|array} path - The path at which to delete the value.
 * @param {boolean} removeParentIfEmpty - If true, remove empty parent nodes.
 * @returns {Object} - The modified target object.
 */
function remove(target,path, removeParentIfEmpty) {
 
 
    if (!path || path == "") console.error("No path provided")
    if (!target || target == "") console.error("No object provided")

    let current = target;
    let parent = null;
    if (typeof path === 'string') path = path.split('.');
    for (let i = 0; i < path.length; i++) {
        if (current[path[i]]==undefined) return target;
        if (i == path.length - 1) {
            delete current[path[i]];
            if (removeParentIfEmpty && parent != null) {
                delete parent[path[i - 1]];
            }
        } else {
            //SET NEXT NODE
            parent = current;
            current = current[path[i]];
        }
    }

    // Delete operation returns modified root object 
    return target;

}
/**
 * Iterates over key-value pairs in an object recursively, applying a callback function.
 *
 * @function
 * @param {Object} target - The target object to iterate over.
 * @param {Function} fn - The callback function to apply to each key-value pair.
 * @param {number} [level=0] - The depth level of the current iteration, ignore it.
 * @param {Array} [path=[]] - The path of ancestor keys to the current node.
 * @returns {Object} - The modified target object.
 */
function iterate(target, fn, level = 0, path = []) {
    let siblingIndex = 0; // Initialize siblingIndex for the current level

    for (let key in target) {
        if (target.hasOwnProperty(key)) {
            const value = target[key];

            // Build the current path by appending the current key
            const currentPath = [...path, key];

            // Call the callback function for the current key-value pair
            fn(key, value, level, siblingIndex, target, currentPath);

            // If the value is an object, recursively iterate over it
            if (typeof value === 'object' && value !== null) {
                iterate(value, fn, level + 1, currentPath);
            }

            // Increment sibling index for the next iteration
            siblingIndex++;
        }
    }
    return target;
}

  
/**
 * Creates a deep clone of the provided object.
 *
 * This function handles circular references and preserves non-JSON serializable values.
 *
 * @function
 * @param {Object} obj - The object to be cloned.
 * @param {Map} [cloneMap=new Map()] - Internal map to track circular references during cloning (used for recursion).
 * @returns {Object} - A deep clone of the provided object.
 */
function deepClone(obj, cloneMap = new Map()) {
    // Handle non-object types and null
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    // Check if the object has been cloned before (circular reference)
    if (cloneMap.has(obj)) {
        return cloneMap.get(obj);
    }

    // Create a new object or array based on the type of the input object
    const clone = Array.isArray(obj) ? [] : {};

    // Store the clone in the map to handle circular references
    cloneMap.set(obj, clone);

    // Recursively clone each property of the object
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            clone[key] = deepClone(obj[key], cloneMap);
        }
    }

    return clone;
}

 

module.exports={
    deepMerge,
    deepClone,
    set,
    get,
    remove,
    iterate,
    toggle
}

