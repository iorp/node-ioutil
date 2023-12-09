
const {parseList}=require('../../../src/common/strings');

 // Test case 
 
let input,result 
input = 'a,"c,d"';result=parseList(input);console.log(0,'skip dquotes',input,result)
input = 'a,`c,d`';result=parseList(input);console.log(1,'skip backtick',input,result)
input = 'a,{c,d}';result=parseList(input);console.log(2,'skip brackets',input,result)
input = 'a,[c,d]';result=parseList(input);console.log(3,'skip sqbrackets',input,result)
input = 'a__b__c';result=parseList(input,{separator:'__'});console.log(4,'Other separator',input,result)
