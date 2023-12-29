


/**
 * Recursively retrieves a nested property value from an object or an nested array of objects based on the provided path.
 *
 * @param {Object|Array} arr - The object or array from which to retrieve the value.
 * @param {Array} path - An array representing the path to the desired property.
 * @returns {*} - The value located at the specified path, or null if not found.
 */



function get(data, path,defaultValue=null) {
    if(typeof path=='string') path = path.split('.');
    let current = data;
  
    for (const [index, key] of path.entries()) {
        if (typeof current === 'object' && !Array.isArray(current)) {
            if (current[key]) {
                current = current[key];
            } else {
                if (current.children) {
                    current = current.children.find(item => item?.key === key);
                } else {
                    return defaultValue;
                }
            }
        } else if (typeof current === 'object' && Array.isArray(current)) {
            current = current.find(item => item?.key === key);
        }
    }
  
    return current;
  }
  
  

module.exports =get;