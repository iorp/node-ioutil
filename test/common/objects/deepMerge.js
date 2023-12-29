
const {deepMerge}=require('../../../src/common/objects');
 
var a= {
    a:0,
    b:{
        c:1
    }
}

var b= {
    d:2,
    e:{
        f:3
    }
}


console.log(deepMerge(a,b)); 