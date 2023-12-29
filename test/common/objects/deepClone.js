
const {deepClone}=require('../../../src/common/objects');
 
var a= {
    a:0,
    b:{
        c:1
    }
}
 
var b = deepClone(a)
console.log(b); 