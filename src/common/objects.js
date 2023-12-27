/**
 * Merges two objects recursively, with the ability to merge nested objects.
 *
 * @function
 * @param {Object} a - The target object to merge into.
 * @param {Object} b - The object to merge into the target.
 * @returns {Object} - The merged object.
 */ 
function merge(a,b) {
    return JSON.parse(JSON.stringify({ ...a, ...b }));

    // return Object.keys(b||{}).reduce((merged, key) =>
    //     ({
    //         ...merged,
    //         [key]: typeof b[key] === 'object' && !Array.isArray(b[key]) && a[key] ?
    //             a[key].merge(b[key]) : b[key],
    //     }), {
    //         ...a
    //     }
    // );
};

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

     
    if (!target) console.error("No target provided")
    if (!path) console.error("No path provided")

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
function del(target,path, removeParentIfEmpty) {
 
 
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
 * @param {number} [level=0] - The depth level of the current iteration.
 */
function iterate(target, fn, level = 0) {
    let siblingIndex = 0; // Initialize siblingIndex for the current level

    for (let key in target) {
        if (target.hasOwnProperty(key)) {
            const value = target[key];

            // Call the callback function for the current key-value pair
            fn(key, value, level, siblingIndex);

            // If the value is an object, recursively iterate over it
            if (typeof value === 'object' && value !== null) {
                iterate(value, fn, level + 1);
            }

            // Increment sibling index for the next iteration
            siblingIndex++;
        }
    }
}
  
 

module.exports={
    merge:merge,
    set:set,
    get:get,
    del:del,
    iterate:iterate
}

