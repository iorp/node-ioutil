
const {set}=require('../../../src/common/objects');
 
var obj= {
    a:0,
    b:{
        c:1
    }
}


 set(obj,'a',123);console.log(obj);
 set(obj,'b',{d:2},true);console.log(obj); // merge! 
 set(obj,'b.c',456);console.log(obj);
 set(obj,'b.e',789);console.log(obj);
 