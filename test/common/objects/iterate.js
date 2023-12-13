
const {iterate}=require('../../../src/common/objects');
 
var obj= {
    a:0,
    b:{
        c:1
    }
}

 

 iterate(obj,(key,val)=>{
    console.log(key,val);
}); 


// Example usage
// iterate({ a: 1, b: { c: 2, d: 3 }, e: 4 }, (key, value, level, siblingIndex) => {
//     console.log(`Key: ${key}, Value: ${value}, Level: ${level}, Sibling Index: ${siblingIndex}`);
// });
