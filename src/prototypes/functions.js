const {parseArguments}=require('../../src/common/functions');

 
Function.prototype.demo = function(args) {
    // Use the parseArguments function to organize arguments
    console.log(this, args);
    return this
};
 