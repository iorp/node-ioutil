const {extractClosureTree,getLineNumber,getLines}=require('../../../../src/common/strings');

// example using a custom collector
// // NESTED FUNCTIONS
// var inputString=` 
// function a(){
//   a
//   function ab(){
// ab
//   }
// } 
// function b(){
//  b
// }

// `; 

// var inputString=` 
// class a@_$1{
//   constructor(x,y){
//   }
// }`;
 
// var inputString=` 
// const a@_$1 = (x,y)=>{
//   }
// `;

// var inputString=`
// /**
//  * dockblock here!
//  */
// const a = (x,y)=>{
//   }
// `;
 
var inputString=`
Function.prototype.demo = function(args) {  
};
`

// getTypeInfo functions
function getType(str){
  var type = null;
  // check var, let,const
if(/^(var|let|const)\s+/.test(str)){
  type = str.split(' ')[0]; 
// check function 
}else if ((str.match(/(^((function|async.*(\s)function|static.*(\s)function|static.*(\s)async.*(\s)function)\s+[\w$]+\s*\()+(((.*)\)))+(((.*)\{)|((.*\n)\{))|^([\w@$]+)\(+(.*)\)+(((.*)\{)|((.*\n)\{)))/gm)||[]).length>0){
 type = 'function';
 // check class
//}else if ((str.match(/(^((class)(\s*)[\w$]+\s*)|(^([\w$]+(\s*=\s*class))))/gm)||[]).length>0){
}else if ((str.match(/(^((class)(\s*)[\w$]+\s*))/gm)||[]).length>0){
  type = 'class';
  }else  if ((str.match(/^([\w@$]+)\.prototype.([\w@$]+)/gm)||[]).length>0){
  type = 'prototype';
  }
  return type;
}
function getAttributes(str,type){
  let attr = {type:type}; 
  switch(type){
    // get name of functions
    case 'function': 
      if(str.includes('function')){
        attr['name'] = str.split('function ')[1].split('(')[0].trim();
        
      }else{ 
        attr['name'] = str.split('(')[0];  
      }
      // todo args, static or async and so on 
      break;
    case 'class': 
    //attr['name'] = str.split(' ')[1].split('{')[0].trim(); 
    attr['name'] = str.match(/\b(?:class)\s*([a-zA-Z1-9@$$_]*\w*)\b/)?.[1];      
      
      // todo args from constructor 
      break;

      case 'const':
      case 'let':
      case 'var':
         attr['name'] = str.match(/\b(?:var|let|const)\s*([a-zA-Z1-9@$$_]*\w*)\b/)?.[1];
      
      case 'prototype': 
       attr['name'] =str.match(/\b(?:\.prototype.)\s*([a-zA-Z1-9@$$_]*\w*)\b/)?.[1];
       attr['datatype']= str.split('.')[0];
      break;
  }

  
  return attr;
}

function getBlock(lines, lineNumber,clear=true) {
  if(lineNumber>=lines.length) lineNumber = lines.length-1;
  let insideCommentBlock = false;
  let storedLines = [];

  for (let i = lineNumber-1 ; i >= 0; i=i-1) { 
     
    if(!lines[i]) continue;

    const line = lines[i].trim();
   
    if (line.endsWith('*/')) {
      insideCommentBlock = true;
    }
      if(line.length>0 && !line.startsWith('/*') && !insideCommentBlock){
      return null;
    }

    if (insideCommentBlock) {
      storedLines.push(lines[i]);

      if (line.startsWith('/*')) {
          var result = storedLines.reverse().join('\n');
          if(clear) result =result.replace(/\/\*\s*|\s*\*\/|\s*\*\s?/g, '').trim()
        return result;

        
      }
    }
  }

  return null;
};

function getTypeInfo(str, startIndex) {

 var lines = getLines(str);
 var lineNumber = getLineNumber(str,startIndex);
 //var line =lines[lineNumber];
// fragment to check on, the current and the next line
  
 const frag = `${lines[lineNumber]}\n${(lines[lineNumber+1]||'')}`.trim();
  // first two lines are taken to ensure a ...\n{ situation
  var type = getType(frag);
  var attr =  getAttributes(frag,type);
 
  attr.block = getBlock(lines,lineNumber);
  // todo depending type get name and so on 
 
  return  attr;
 
 
}


  


const customCollector= function(collected,closure,options,globalOffset=0,globalDepth=0){
  var typeInfo = getTypeInfo(inputString,closure.start);
    // determine type , get name (and attrs) in consequence 
 // console.log(closure.start,typeInfo);
 var key = typeInfo.name || Object.keys(collected).length;
  collected[key]={
      '@docs':typeInfo,
      '@match':closure.match,
      '@matchInner':closure.matchInner,
      '@start':closure.start ,
      '@end':closure.end + globalOffset,
      '@depth':globalDepth,  
      // the children grouped
      // children:extractClosureTree(closure.match.slice(1, -1),{...options,offset:0},globalOffset+closure.start+options.opener.length)//+1 because we have sliced the closure symbol recurse(closure.match.slice(1, -1),level+1)
       // the children can be spread
      ...extractClosureTree(closure.match.slice(1, -1),{...options,offset:0},globalOffset+closure.start+options.opener.length,globalDepth+1)//+1 because we have sliced the closure symbol recurse(closure.match.slice(1, -1),level+1)
   
  };
}
var tree = extractClosureTree(inputString,{collector:customCollector})
console.log(JSON.stringify(tree,null,2));



// function a() {
//   function ab() {

//   }
// }

// function b(){
 
// }