
const {toggle}=require('../../../src/common/objects');
 
const obj= {
    a:false,
    b:{
        c:false,
        d:0,
        e:''

    }
}

 toggle(obj,'a')
 toggle(obj,'b.c')
 toggle(obj,'b.d')
 toggle(obj,'b.e')

console.log(obj)