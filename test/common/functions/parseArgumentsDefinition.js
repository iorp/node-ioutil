
const {parseArgumentsDefinition}=require('../../../src/common/functions');
 

 
function myFunction(a=1, b) {
  return a + b;
};





console.log(parseArgumentsDefinition(myFunction));