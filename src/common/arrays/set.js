/**
 * Recursively sets a nested property value in an object or an array based on the provided path.
 *
 * @param {Object|Array} obj - The object or array in which to set the value.
 * @param {Array} path - An array representing the path to the desired property.
 * @param {*} value - The value to set at the specified path.
 * @returns {null|Object} - Returns the modified if the set operation is successful, null otherwise.
 */ 
function set(data, path,value) {
      if(typeof path=='string') path = path.split('.');
      let current = data;
    
      for (const [index, key] of path.entries()) {
          if (typeof current === 'object' && !Array.isArray(current)) {
              // 
              if(index ==path.length-1){
                  //console.log( 'last',key)
                  current[key] = value;
              }else
              if (current[key]) {
    
                
                      current = current[key]; 
              } else {
                  if (current.children && current.children.find(item => item?.key === key)) {
                      current = current.children.find(item => item?.key === key);
                  } else { 
                      current[key] = value;
                  }
              }
          } else if (typeof current === 'object' && Array.isArray(current)) {
              current = current.find(item => item?.key === key);
          }
      }
    
     return data;
    }

module.exports =set;