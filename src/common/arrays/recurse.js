/**
 * Recursively iterates through a hierarchical data structure and applies a callback function to each item.
 *
 * @param {Array} data - The array representing the hierarchical data structure.
 * @param {Function} callback - The callback function to apply to each item in the data structure.
 *   It receives two parameters: the current item and the path to the current item in the hierarchy.
 * @param {Array} [path=[]] - The path to the current item in the hierarchy (used internally during recursion).
 * @returns {Array} - A new array representing the transformed data structure.
 */
function recurse(data, callback, path = []) {
    return data.map(item => {
        const currentPath = [...path, item.key];
        const newItem = callback(item, currentPath) || item;
  
        if (item.children && item.children.length > 0) {
            newItem.children = recurse(item.children, callback, currentPath);
        }
  
        return newItem;
    });
  }
module.exports = recurse