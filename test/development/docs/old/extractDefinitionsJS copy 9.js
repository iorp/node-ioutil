const {parseList,extractClosure,getLineNumber,getLines,getLine, getLineStartIndex, getLineEndIndex}=require('../../../../src/common/strings');



 

 
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
 

  const findEnd=()=>{

  }

  const getExpressionType=(input)=>{
    input = input.trim();
    var type = null;
    if ((input.match(/\b(?:var|let|const)\s*([a-zA-Z1-9@$$_]*\w*)\b/gm)||[]).length>0) { 
      type = input.split(' ')[0]; 
    // check function 
    }else if ((input.match(/(^((function|async.*(\s)function|static.*(\s)function|static.*(\s)async.*(\s)function)\s+[\w$]+\s*\()+(((.*)\)))+(((.*)\{)|((.*\n)\{))|^([\w@$]+)\(+(.*)\)+(((.*)\{)|((.*\n)\{)))/gm)||[]).length>0){
    type = 'function';
    // check class
    //}else if ((str.match(/(^((class)(\s*)[\w$]+\s*)|(^([\w$]+(\s*=\s*class))))/gm)||[]).length>0){
    }else if ((input.match(/(^((class)(\s*)[\w$]+\s*))/gm)||[]).length>0){
      type = 'class';
      }else  if ((input.match(/^([\w@$]+)\.prototype.([\w@$]+)/gm)||[]).length>0){
      type = 'prototype';
      }
      return type;
    } 
  const extractExpression=(input,charIndex)=>{ 

    var type = getExpressionType(input.substr(charIndex));
    console.log(type);

    switch (type){
      case 'var':
        
      break;
    }
 
    return {
      match:match,
      matchInner:match.trim().slice(1, -1),
      start:offset+start, // global 
      end:offset+i + closer.length-1,// global 
      ostart:start, // within offset 
      oend:i + closer.length-1,// within offset 
  } 
  }
 

  const collectExpression = (collected,closure,options,globalOffset,globalDepth)=>{
     
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
  var i = 0;
  var collected = {};
 var last =0;
  while (i < inputString.length) {
   

      var expression = extractExpression(inputString, i);
      if (expression) {
   
       
        
        collectExpression(collected, expression, options, globalOffset,globalDepth);
        i = expression.end + 1;
        last = i;
      } 
      break;
  }

  return collected;
}





function OLDextractExpressionsJS(input,options={}){

  function getAttributes(str,type){
    str = str.trim();
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
          attr['name'] =   str.match(/(?:var|const|let)\s+([^=\s;]+)/g)?.[0].substr(type.length+1)
      
          // old attr['name'] = str.match(/\b(?:var|let|const)\s*([a-zA-Z1-9@$$_]*\w*)\b/)?.[1];
        break;
        case 'prototype': 
        attr['name'] =str.match(/\b(?:\.prototype.)\s*([a-zA-Z1-9@$$_]*\w*)\b/)?.[1];
        attr['datatype']= str.split('.')[0];
        break;
    }

    
    return attr;
  }
  function recurse(input,i=0,level=0){ 
    var collected={}; 
  const lines =  getLines(input)

    while(i<lines.length){
      const line = lines[i];
      console.log('lli',i,level, input)
      const tLine = line.trim();


      var captured =null;
      // var ??? =,var with assignation
      if (/(var|let|const)\s*([a-zA-Z1-9@$$_]*\w*)\s*=/g.test(tLine)){
        var attr =  getAttributes(tLine,'var');
        let assignee = tLine.replace(/^[^=]*=/, '');  
        // function assignee (todo async static ... )
        if(/function\s*\([^)]*\)\s*{\s*|\(\s*\)\s*=>\s*{/g.test(assignee)){
          let lineStart = getLineStartIndex(input,i);
         
          var argsClosure = extractClosure(input,{opener:'(',closer:')',offset: lineStart});
          if(!argsClosure){  console.error('Malformed function arguments at line ',i); return;  } 
          var argsList = parseList(argsClosure.matchInner);
        
          var closure = extractClosure(input,{offset:argsClosure.end})
          if(!closure){  console.error('Malformed function body at line ',i); return;  }
          // console.log(closure)
          captured={ 
            '@name':attr.name,  
            '@line':i,
            '@type':'function',  
            '@arguments':argsList, 
             ...extractExpressionsJS(input,closure.start+1,level+1)
            // continue here it must recurse ...recuse ... here 
           
          }
          i = getLineNumber(lines,closure.end)+1;
          console.log(i)
        }
        else{
          var attr =  getAttributes(tLine,'var');
          captured={ 
            '@name':attr.name,
            '@line':i,
          }
        }
        
      }else 
      // var ??? , var without assignation
      if (/(var|let|const)\s*([a-zA-Z1-9@$$_]*\w*)\s*/g.test(tLine)){ 
        var attr =  getAttributes(tLine,'var');
          captured={
            '@name':attr.name,
            '@type':'var',
            '@line':i,
          }

       }else


      if(/(^((function|async.*(\s)function|static.*(\s)function|static.*(\s)async.*(\s)function)\s+[\w$]+\s*\()+(((.*)\)))+(((.*)\{)|((.*\n)\{))|^([\w@$]+)\(+(.*)\)+(((.*)\{)|((.*\n)\{)))/g.test(tLine)){
        console.log(i,line,'function');

      }


      if(captured!=null){
      collected[captured['@name']]=captured;
      }
      
      //console.log(i,line);
      i++;

    }
    return collected;
  }

 return recurse(input)

}

 


function extractExpressionsJS(input,options={}){

  function getAttributes(str,type){
    str = str.trim();
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
          attr['name'] =   str.match(/(?:var|const|let)\s+([^=\s;]+)/g)?.[0].substr(type.length+1)
      
          // old attr['name'] = str.match(/\b(?:var|let|const)\s*([a-zA-Z1-9@$$_]*\w*)\b/)?.[1];
        break;
        case 'prototype': 
        attr['name'] =str.match(/\b(?:\.prototype.)\s*([a-zA-Z1-9@$$_]*\w*)\b/)?.[1];
        attr['datatype']= str.split('.')[0];
        break;
    }

    
    return attr;
  }
  function recurse(input,offset=0,level=0){
    var i = offset;
    const lines = getLines(input);
    var collected={}; 
    while(i<input.length){
      const lineNumber =getLineNumber(lines,i);
      const line = (lines[lineNumber]||'').trim();
      const lineStart = getLineStartIndex(lines,lineNumber);
      const lineEnd = getLineEndIndex(lines,lineNumber);
   

      

      var captured =null;
      //# var with assignation
      if (/^(var|let|const)\s*([a-zA-Z1-9@$$_]*\w*)\s*=/g.test(line)){
        var attr =  getAttributes(line,'var');
        let assignee = line.replace(/^[^=]*=/, '').trim();  

        //## string quoted assignee
        if(assignee.startsWith('"')){
          var attr =  getAttributes(line,'var');
          captured={
            '@name':attr.name,
            '@type':'var',
            '@dtype':'string',
            '@line':lineNumber,
          }

          if(assignee.endsWith('"') || assignee.endsWith(';')){
          i = lineEnd +1
          }else{
            if(assignee.endsWith('+')){
              var currentLine =assignee;
              var currentLineNumber = lineNumber;
              while(currentLine.endsWith('+')){

                currentLineNumber++;
                currentLine= getLine(lines,currentLineNumber)
              }
          
              const currentLineEnd = getLineEndIndex(lines,currentLineNumber);
              i = currentLineEnd +1
            }else{
              console.error("Unclosed string literal at line",lineNumber,line);

            }
          }
        }
        else
        //## number assignee
        if(/^-?\d+(\.\d+)?/g.test(assignee)){
          var attr =  getAttributes(line,'var');
          captured={
            '@name':attr.name,
            '@type':'var',
            '@dtype':'number',
            '@line':lineNumber,
          }
          i = lineEnd +1
         
        }
        else
        //## function assignee (todo add async static in the regex ... )
        if(/function\s*\([^)]*\)\s*{\s*|\(\s*\)\s*=>\s*{/g.test(assignee)){          
          var argsClosure = extractClosure(input,{opener:'(',closer:')',offset: lineStart});
          if(!argsClosure){  console.error('Malformed function arguments at line ',i); return;  } 
          var argsList = parseList(argsClosure.matchInner);
        
          var closure = extractClosure(input,{offset:argsClosure.end})
          if(!closure){  console.error('Malformed function body at line ',i); return;  }
          // console.log(closure)
          captured={ 
            '@name':attr.name,  
            '@line':i,
            '@type':'function',  
            '@arguments':argsList, 
            // ...extractExpressionsJS(input,closure.start+1,level+1)
            // continue here it must recurse ...recuse ... here 
           
          }
          // i = getLineNumber(lines,closure.end)+1;
          // console.log(i)
        }
        //## none of the previous cases todo IT DOEsNT HAVE TO REACH HERE
        else{
          var attr =  getAttributes(line,'var');
          console.error("Uncaptured expression at line",lineNumber,line)

          captured={ 
            '@name':attr.name,
            '@line':lineNumber,
          }
        }
        
      }else 
      //# var without assignation
      if (/^(var|let|const)\s*([a-zA-Z1-9@$$_]*\w*)\s*/g.test(line)){ 
       var attr =  getAttributes(line,'var');
          captured={
            '@name':attr.name,
            '@type':'var', 
            '@line':lineNumber,
          }
          i = lineEnd +1
      }
      else
      //# function definiton 
      if(/(^((function|async.*(\s)function|static.*(\s)function|static.*(\s)async.*(\s)function)\s+[\w$]+\s*\()+(((.*)\)))+(((.*)\{)|((.*\n)\{))|^([\w@$]+)\(+(.*)\)+(((.*)\{)|((.*\n)\{)))/g.test(line)){
        console.log(i,line,'function');

      }


      if(captured!=null){ 
      collected[captured['@name']]=captured;

      }else{ 
        i++;
      }
      
       
       
    }
    return collected;
  }

  return recurse(input)
}

const tests = [
  {
    title:'var const and let',
    str:`  
    var a = "123"+
    ""; 
    var b = 123;   
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


