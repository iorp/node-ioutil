  
 require('../../../src/prototypes/functions');
 
  
function FuncA({a=0,b=1,c=2}) { 
  
  const args = {a,b,c,...rest}= FuncA.parg(arguments); // parg shortens the parseArguments function

  console.log(args)
 };
 console.log('FuncA Non positional arguments')
 FuncA(9,8,7,1,2) 
  console.log('FuncA Positional arguments') 
 FuncA({c:7,b:8,a:9,x:1,z:2})
 
 
 
 // the the way to define the arguments is irrelevant as shown on FuncB
 function FuncB(a=0,b=1,c=2) { 
     const args = {a,b,c,...rest}= FuncA.parg(arguments); // parg shortens the parseArguments function
     console.log(args)
    };
 
 console.log('FuncB Non positional arguments')
 FuncB(4,5,6,1,2) 
  console.log('FuncB Positional arguments') 
 FuncB({c:6,b:5,a:4,x:1,z:2})
   
 