
const {get}=require('../../../src/common/objects');
 
const obj= {
    a:0,
    b:{
        c:1
    }
}


console.log(get(obj,'a'));
console.log(get(obj,'b'));
console.log(get(obj,'b.c'))