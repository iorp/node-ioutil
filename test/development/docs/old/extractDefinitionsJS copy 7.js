const {extractClosure,getLineNumber,getLines,getLine}=require('../../../../src/common/strings');



const tests = [
  {
    title:'var const and let',
    str:`
    var c;
    function a(){} 
    `
  },
  {
    title:'var const and let',
    str:` 
      const a = ()=>{ 
      }
      let b = function(){ 
      }
      const c = class{ 
      }
    `
  },
  {
    title:'Nested functions',
    str:`
    function a(){
      a
      function b(){
        b
      }
    } `
  },
  {
    title:'Function types',
    str:`
    function a(){
       ...
      }
    async function b(){
      ...
      }
    static async function c(){
      ...
      }
    static function d(){
      ...
      }
    e(){
      ...
      }
    `
  },
  {
    title:'All symbols test',
    str:` 
    function a@_$1(){
      ...
     }
    `
  },
   
]; 

 
// modification of extractClosureTree
function extractDefinitionsJS(inputString, options = {}, globalOffset = 0,globalDepth = 0) {
  inputString = inputString.trim()
  function getTypeInfo(str, startIndex) {
      
    // getTypeInfo functions
    function getType(str){
      var type = null;
      // check var, let,const
      // if(/^(var|let|const)\s+/.test(str)){
    
      // check object wrapper
      if (startIndex==0 && (str.match(/^\{/gm)||[]).length>0) { 
        type = 'wrapper'; 
      // check function 
      }else  if ((str.match(/\b(?:var|let|const)\s*([a-zA-Z1-9@$$_]*\w*)\b/gm)||[]).length>0) { 
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
          break;
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
    }
  
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
  options = Object.assign({ 
      opener: '{',
      closer: '}',
      offset: 0,
      excludes: [
          ['"', '"'],
          [`'`, `'`],
          ['`', '`'],
          ['/*', '*/'],
          ['//', '\n'],
      ],
  }, options);

  const closureCollector = (collected,closure,options,globalOffset,globalDepth)=>{
     
            // determine type , get name (and attrs) in consequence 
       var typeInfo = getTypeInfo(inputString,closure.start);
       
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
           ...extractDefinitionsJS(closure.match.slice(1, -1),{...options,offset:0},globalOffset+closure.start+options.opener.length,globalDepth+1)//+1 because we have sliced the closure symbol recurse(closure.match.slice(1, -1),level+1)
       
       };
    
     }

  const extractAssignation=(inputString,options={offset:0})=>{
   var i = options.offset;

    // retrieve line 
    // const lineNumber = getLineNumber(inputString,i);
    // const line = getLine(inputString,lineNumber); 
    // console.log(lineNumber,line)
    typeinfo= getTypeInfo(inputString,i);
    console.log(typeinfo)
    process.exit()
    return{
      match: '{}',
      matchInner: '',
      start: NaN,
      end: NaN,
      ostart: 23,
      oend: 24
    }
  }
  const assignationCollector = (collected,assignation,options,globalOffset,globalDepth)=>{
 
     collected[assignation.name]={
          '@docs':typeInfo,
           '@match':assignation.match,
           '@matchInner':assignation.matchInner,
           '@start':assignation.start ,
           '@end':assignation + globalOffset,
           '@depth':globalDepth,  
     }
  }
 
  var i = 0;
  var collected = {};
 var last =0;
  while (i < inputString.length) {
   // console.log(i,inputString[i]);

    // // find definitions 
    //  var assignation = extractAssignation(inputString, { ...options, offset: i });
    //   var assignation =  {match:'var',name:'a',end:4};
    //  if(assignation){
    //   assignationCollector(collected, assignation, options, globalOffset,globalDepth);
    //   i=assignation.end+1;
    //  }
    

    // find closure

      var closure = extractClosure(inputString, { ...options, offset: i });
      if (closure) {
        
        // console.log(9999,closure,9999)
        closureCollector(collected, closure, options, globalOffset,globalDepth);
        i = closure.end + 1;
        last = i;
      } 
      break;
  }

  return collected;
}






// extract definitions in javascript
// function extractEnclosedDefsJS(inputString){
//   inputString = inputString.trim()
//   // if(!(inputString.startsWith('{') && inputString.endsWith('}'))) inputString = `{\n${inputString}\n}`;
 
//   var tree = extractClosureTree(inputString);
//   return tree;

// }
 
 let testIndex = process.argv[2]||0;

 var test = tests[testIndex];
 console.log('TESTING:',testIndex, test.title,'\n');
 

console.log(extractDefinitionsJS((test.str||"").trim()));
// function a() {
//   function ab() {

//   }
// }

// function b(){
 
// }