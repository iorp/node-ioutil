
const {del}=require('../../../src/common/objects');
 
var obj= {
    a:0,
    b:{
        c:1,
        d:{
            e:2
        },
        f:{
            g:3
        }
    }
}


 del(obj,'a'); console.log(obj);
 del(obj,'b.d.e');console.log(obj);  
 del(obj,'b.f.g',true);console.log(obj);// remove parent if empty: true 
 