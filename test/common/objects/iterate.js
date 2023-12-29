
const {iterate}=require('../../../src/common/objects');
 
var obj= {
    a:0,
    b:{
        c:1
    }
} 
 
 iterate(obj,(key,value,level,siblingIndex,parent,path)=>{
    console.log(key,level,siblingIndex,path);
}); 


// // Example usage with level and siblingIndex
// iterate({ a: 1, b: { c: 2, d: 3 }, e: 4 }, (key, value, level, siblingIndex,parent) => {
//     console.log(`Key: ${key}, Value: ${value}, Level: ${level}, Sibling Index: ${siblingIndex}`);
// });
