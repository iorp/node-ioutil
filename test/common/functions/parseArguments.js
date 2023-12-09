
const {parseArguments}=require('../../../src/common/functions');
 
 
// function FuncA({a=0,b=1,c=2}) { 
//  const args = {a,b,c,...rest}= parseArguments(FuncA,arguments)
//  console.log(args)
// };
// console.log('Non positional arguments')
// FuncA(9,8,7) 
//  console.log('Positional arguments') 
// FuncA({c:7,b:8,a:9})



// // the the way to define the arguments is irrelevant as shown on FuncB
// function FuncB(a=0,b=1,c=2) { 
//     const args = {a,b,c,...rest}= parseArguments(FuncB,arguments); // parg shortens the parseArguments function
//     console.log(args)
//    };

// console.log('Non positional arguments')
// FuncB(4,5,6) 
//  console.log('Positional arguments') 
// FuncB({c:6,b:5,a:4})
  




// the the way to define the arguments is irrelevant as shown on FuncB
function FuncC(uri=0,options={c:1,d:2}) { 
    const args = {a,b,c,...rest}= parseArguments(FuncC,arguments); // parg shortens the parseArguments function
    console.log(args)
   };

console.log('FuncC Non positional arguments')
FuncC('asdas',{a:0,b:1}) 
 console.log('FuncC  Positional arguments') 
FuncC('asd',{c:6,b:5,a:4})
  