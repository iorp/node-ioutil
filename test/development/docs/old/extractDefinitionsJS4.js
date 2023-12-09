const {parseList,extractClosure,getLineNumber,getLines,getLine, getLineStartIndex, getLineEndIndex}=require('../../../../src/common/strings');



const text = "   Hello World() \n   JavaScript is awesome\n   Regex is powerful";

 

 
/*
todo , ignore unknown assignations, 
recursivity with functions classes and prototypes 
group data in a single key whitin the level 
*/
 
  
   const TurboDocJs= class{ 
    static REGEX={
      VLC_DEFINITION_ASSIGNATED: /^(var|let|const)\s*([a-zA-Z1-9@$$_]*\w*)\s*=/g,
      VLC_DEFINITION_UNASSIGNATED:/(var|let|const)\s*([a-zA-Z1-9@$$_]*\w*)\s*/g,
      ANONYMOUS_FUNCTION:/^((|static|async)(|.\s*)(|static|async)(|.\s*)(function.\s*\([^)]*\)\s*{\s*))|(|static|async)(|.\s*)(|static|async)(|.\s*)(\(.*\)\s*=>\s*{)/g,
      ANONYMOUS_CLASS:/^(|static)(|.\s*)(class.*{)/g,
      FUNCTION_DEFINITION:/^((|static|async)(|.\s*)(|static|async)(|.\s*)(function.*\([^)]*\)*[^{]*))/g,
      CLASS_DEFINITION:/^(|static)(|.\s*)(class.*{)/g,
      PROTOTYPE_DEFINITION:/^([\w@$]+)\.prototype.([\w@$]+)/g,
      NUMBER:/^-?\d+(\.\d+)?/g
  
   
    }

    static capture ={
      unnassignedVlc:()=>{
         //# var without assignation
         if (TurboDocJs.REGEX.VLC_DEFINITION_UNASSIGNATED.test(line.text)){ 
          return {
          collected : TurboDocJs.collectors.unassigned(lines,line,i,level,options),
          next :  collected[options.nodeDataKeyName]['end'] +2//2 = 1 the new line, 1 for the next char  
          }
        }
        return null;
      }
    }
    static collectors ={
      // Unassigned variable
      unassigned:(lines,line,i,level,options)=>{
        var collected = null; 
       
          collected={
            [options.nodeDataKeyName]:{
            'name':line.text.match(/\b\w+\b/g)?.[1], // second word 
            'type':line.text.match(/^\s*([^\s]+)/)?.[1], // first word
            'dtype':'null',
            'line':line.index,
            'start':line.startCharIndex,
            'end':line.endCharIndex,
            }
          };

          return collected;
      },
      definerPrototype:(lines,line,i,level,options)=>{
       
        var collected = null;
        // var attr =  TurboDocJs.getAttributes(line.text,'prototype');
        var argsClosure = extractClosure(lines.text,{opener:'(',closer:')',offset: i});
        if(!argsClosure){  console.error('Malformed function arguments at li.text ',i); return;  } 
        var argsList = parseList(argsClosure.matchInner);
 
  
        var closure = extractClosure(lines.text,{offset:argsClosure.end+1});
        if(closure){
          collected={ 
            [options.nodeDataKeyName]:{
            'name': line.text.match(/\b(?:\.prototype.)\s*([a-zA-Z1-9@$$_]*\w*)\b/)?.[1],
            'line':line.index,
            'type':'prototype',
            'dtype':'function',   
            'prototypee':line.text.split('.')[0],   
            'arguments':argsList, 
            'start':line.startCharIndex,
            'end':closure.end,
            // ...extractExpressionsJS(input,closure.start+1,level+1)
            // continue here it must recurse ...recuse ... here 
            }
          }
         }else{
          console.error('Malformed function closure at line ',i); 
        }
        // console.log(closure)
       
        return collected;
        
      },
      definerClass:(lines,line,i,level,options)=>{
        var collected = null;
       // var attr =  TurboDocJs.getAttributes(line.text,'class');
        //var argsClosure = extractClosure(lines.text,{opener:'(',closer:')',offset: i});
        //if(!argsClosure){  console.error('Malformed function arguments at li.text ',i); return;  } 
        //var argsList = parseList(argsClosure.matchInner);
        
       
        var closure = extractClosure(lines.text,{offset:i});
        if(closure){
           
          collected={ 
            [options.nodeDataKeyName]:{
            'name': line.text.match(/class\s+([A-Za-z_$@][A-Za-z0-9_$@]*)/)?.[1].trim(),  
            'line':line.index,
            'type':'class', 
            'dtype':'class',  
            //'arguments':argsList, // todo from constructor if constructor present 
            'start':line.startCharIndex,
            'end':closure.end,
            // ...extractExpressionsJS(input,closure.start+1,level+1)
            // continue here it must recurse ...recuse ... here 
            }
          }
         }else{
          console.error('Malformed class closure at line ',i); 
        }
        // console.log(closure)
       
        return collected;
        
      },
      definerFunction:(lines,line,i,level,options)=>{
        var collected = null; 
        var argsClosure = extractClosure(lines.text,{opener:'(',closer:')',offset: i});
        if(!argsClosure){  console.error('Malformed function arguments at li.text ',i); return;  } 
        var argsList = parseList(argsClosure.matchInner);
 
        var closure = extractClosure(lines.text,{offset:argsClosure.end+1});
        if(closure){
          collected={ 
            [options.nodeDataKeyName]:{
            'name':line.text.match(/function\s+([A-Za-z_$@][A-Za-z0-9_$@]*)/)?.[1].trim(),  
            'line':line.index,
            'type':'function',
            'dtype':'function',   
            'arguments':argsList, 
            'start':line.startCharIndex,
            'end':closure.end,
            // ...extractExpressionsJS(input,closure.start+1,level+1)
            // continue here it must recurse ...recuse ... here 
            }
          }
         }else{
          console.error('Malformed function closure at line ',i); 
        }
        // console.log(closure)
       
        return collected;
        
      },
      assigneeAnonymousClass:(lines,line,i,level,options)=>{
        var collected = null;
        // todo retrieve extends closure if exists
        // todo retrieve constructor arguments
 
        var closure = extractClosure(lines.text,{offset:i});
        if(closure){
          collected={ 
            [options.nodeDataKeyName]:{
            'name':line.text.match(/\b\w+\b/g)?.[1], // second word 
            'type':line.text.match(/^\s*([^\s]+)/)?.[1], // first word  
            'line':line.index, 
            'dtype':'class',  
            //'arguments':argsList, // todo from constructor if constructor present 
            'start':line.startCharIndex,
            'end':closure.end,
            // ...extractExpressionsJS(input,closure.start+1,level+1)
            // continue here it must recurse ...recuse ... here 
            }
          }
         }else{
          console.error('Malformed class closure at line ',i); 
        }
        // console.log(closure)
       
        return collected;
        
      },
      assigneeAnonymousFunction:(lines,line,i,level,options)=>{
        var collected = null;
        var argsClosure = extractClosure(lines.text,{opener:'(',closer:')',offset: i});
        if(!argsClosure){  console.error('Malformed function arguments at li.text ',i); return;  } 
        var argsList = parseList(argsClosure.matchInner);
 
        var closure = extractClosure(lines.text,{offset:argsClosure.end+1});
        if(closure){
          collected={
            [options.nodeDataKeyName]:{
            'name':line.text.match(/\b\w+\b/g)?.[1], // second word 
            'type':line.text.match(/^\s*([^\s]+)/)?.[1], // first word   
            'dtype':'function',   
            'line':line.index, 
            'arguments':argsList, 
            'start':line.startCharIndex,
            'end':closure.end,
            // ...extractExpressionsJS(input,closure.start+1,level+1)
            // continue here it must recurse ...recuse ... here 
            }
          }
         }else{
          console.error('Malformed function closure at line ',i); 
        }
        // console.log(closure)
       
        return collected;
        
      },
      asigneeEnclosure:(opener,closer,excludes,lines,line,i,level,options)=>{
        
        var collected = null;  
         
          var end,dtype; 
          
            var closure = extractClosure(lines.text,{opener:opener,closer:closer,excludes:excludes,offset:i});

            if(closure){
            // todo store match ... 
              end = closure.end
            }else{
              console.error("Unclosed closure at line ",line.index,line.text);
              return null;
            }
             
            switch(opener){
              case '(':dtype='parenthessed';break;  
              case '{':dtype='object';break;
              case '[':dtype='array';break;
              case '`':dtype='string';break;
              default:dtype=null;
            }

          collected={
            [options.nodeDataKeyName]:{
            'name':line.text.match(/\b\w+\b/g)?.[1], // second word 
            'type':line.text.match(/^\s*([^\s]+)/)?.[1], // first word
            'dtype':dtype,
            'line':line.index, 
            'start':line.startCharIndex,
            'end':end,
            }
          }

          return collected;

          
        
      },
      assigneeQuotedString:(input,lines,line,i,level,options)=>{
        const quoteType = input[0]; 
        
        var collected = null; 
  
     
          var end;
          if(input.endsWith(quoteType) || input.endsWith(';')){
          end = line.endCharIndex;
          }else{
            if(input.endsWith('+')){
              var currentLine =input;
              var currentLineNumber = line.index;
              while(currentLine.endsWith('+')){

                currentLineNumber++;
                currentLine= getLine(lines.list,currentLineNumber)
              }
          
              const currentLineEnd = getLineEndIndex(lines.list,currentLineNumber);
              end= currentLineEnd;
            }else{
              console.error("Unclosed string literal at line ",line.index,line.text);
              return null;
            }
          }

          collected={
            [options.nodeDataKeyName]:{
              'name':line.text.match(/\b\w+\b/g)?.[1], // second word 
              'type':line.text.match(/^\s*([^\s]+)/)?.[1], // first word 
              'dtype':'string',
              'line':line.index, 
              'start':line.startCharIndex,
              'end':end,
            }
            
          }

          return collected;

          
        
      },
      assigneeNumber:(input,line,i,level,options)=>{
        //## number assignee
        var collected = null;
        if(/^-?\d+(\.\d+)?/g.test(input)){
           collected={
            [options.nodeDataKeyName]:{
            'name':line.text.match(/\b\w+\b/g)?.[1], // second word 
            'type':line.text.match(/^\s*([^\s]+)/)?.[1], // first word 
            'dtype':'number',
            'line':line.index,
            'start':line.startCharIndex,
            'end':line.endCharIndex,
            }
          };
        }
        return collected;
      }
    } 

 
 
    static recurse(input,options={},offset=0,level=0){
      options =  Object.assign({
        'nodeDataKeyName':'@'
        },options);
         
      var i = offset;
      
      const lines = {
        list:getLines(input),
        text:input
      };
      var result={}; 
      while(i<input.length){
        
        var line = {}
        line.index =getLineNumber(lines.list,i);
        line.text = (lines.list[line.index]||'').trim();
        line.startCharIndex = getLineStartIndex(lines.list,line.index);
        line.endCharIndex =  getLineEndIndex(lines.list,line.index,false);
        
        // skip line comments
        if(line.text.startsWith('//')){
          i = line.endCharIndex+2;
             continue;
        }
        // skip comments closures 
        if(line.text.startsWith('/*')){
          var closure = extractClosure(lines.text,{opener:'/*',closer:'*/',offset:line.startCharIndex,excludes:[]})
          console.log(closure)
          i = closure.end+1;  
          continue;
        }

        // start capture 
 
        var collected =null;
        //# var with assignation
        
      //  if (/^(var|let|const)\s*([a-zA-Z1-9@$$_]*\w*)\s*=/g.test(line.text)){ 
          if (TurboDocJs.REGEX.VLC_DEFINITION_ASSIGNATED.test(line.text)){ 
            let assignee = line.text.replace(/^[^=]*=/, '').trim();  
          // let assigneeStart = line.text.indexOf('=');
          //## string quoted assignee single and double quotes
          if(assignee.startsWith('"')||assignee.startsWith("'")){ 
            collected = TurboDocJs.collectors.assigneeQuotedString(assignee,lines,line,i,level,options);  
            i = collected[options.nodeDataKeyName]['end'] +2; //2 = 1 the new line, 1 for the next char 
          }
          else
          //## string backticked assignee 
          if(assignee.startsWith('`')){
            collected = TurboDocJs.collectors.asigneeEnclosure('`','`',[],lines,line,i,level,options);  
            i = collected[options.nodeDataKeyName]['end'] +2; //2 = 1 the new line, 1 for the next char 
          }
          //## object assignee 
          if(assignee.startsWith('{')){
            
            collected = TurboDocJs.collectors.asigneeEnclosure('{','}',[],lines,line,i,level,options);
            i = collected[options.nodeDataKeyName]['end'] +2; //2 = 1 the new line, 1 for the next char 
          }
          //## array assignee 
          if(assignee.startsWith('[')){
            collected = TurboDocJs.collectors.asigneeEnclosure('[',']',[],lines,line,i,level,options); 
            i = collected[options.nodeDataKeyName]['end'] +2; //2 = 1 the new line, 1 for the next char 
          }                    
          else
          //## parenthesed assignee 
          if(assignee.startsWith('(')){
          collected = TurboDocJs.collectors.asigneeEnclosure('(',')',[],lines,line,i,level,options); 
          i = collected[options.nodeDataKeyName]['end'] +2; //2 = 1 the new line, 1 for the next char 
          }                    
          else
          //## number assignee //todo redo to numeric 
          if(TurboDocJs.REGEX.NUMBER.test(assignee)){
            collected = TurboDocJs.collectors.assigneeNumber(assignee,line,i,level,options); 
            i = collected[options.nodeDataKeyName]['end'] +2; //2 = 1 the new line, 1 for the next char 
          }
          else 
          //## anonymous function assignee       
            if(TurboDocJs.REGEX.ANONYMOUS_FUNCTION.test(assignee)){      
            collected = TurboDocJs.collectors.assigneeAnonymousFunction(lines,line,i,level,options); 
            i =  collected[options.nodeDataKeyName]['end'] +2; //2 = 1 the new line, 1 for the next char  
          }
          else
          //## anonymous class assignee       
            if(TurboDocJs.REGEX.ANONYMOUS_CLASS.test(assignee)){      
            collected = TurboDocJs.collectors.assigneeAnonymousClass(lines,line,i,level,options); 
            i =  collected[options.nodeDataKeyName]['end'] +2; //2 = 1 the new line, 1 for the next char  
          }
           
        }
        else
         //# var without assignation
        if (TurboDocJs.REGEX.VLC_DEFINITION_UNASSIGNATED.test(line.text)){ 
          collected = TurboDocJs.collectors.unassigned(lines,line,i,level,options); 
          i =  collected[options.nodeDataKeyName]['end'] +2; //2 = 1 the new line, 1 for the next char  
        }
        else
        //# function definiton 
        if(TurboDocJs.REGEX.FUNCTION_DEFINITION.test(line.text)){
          collected = TurboDocJs.collectors.definerFunction(lines,line,i,level,options); 
          i =  collected[options.nodeDataKeyName]['end'] +2; //2 = 1 the new line, 1 for the next char  
        }
        else
        //# class definiton       
        if(TurboDocJs.REGEX.CLASS_DEFINITION.test(line.text)){      
          collected = TurboDocJs.collectors.definerClass(lines,line,i,level,options); 
          i =  collected[options.nodeDataKeyName]['end'] +2; //2 = 1 the new line, 1 for the next char  
        }
        else 
        //# prototype definition       
        if(TurboDocJs.REGEX.PROTOTYPE_DEFINITION.test(line.text)){      
          collected = TurboDocJs.collectors.definerPrototype(lines,line,i,level,options); 
          i =  collected[options.nodeDataKeyName]['end'] +2; //2 = 1 the new line, 1 for the next char  
          }
  
        if(collected!=null){ 
          // legacy, todo remove below and uncomment next
         // collected[(captured['']||captured[options.nodeDataKeyName]['name'])]=captured;
           result[collected[options.nodeDataKeyName]['name']]=collected;
  
        }else{ 
          i++;
        }
        
         
         
      }
      return result;
    }
    static extract(input,options={}){
   
      return TurboDocJs.recurse(input,options);
    }
     
    }
 

 

const tests = [
  {
    title:'Tester',
    str:`
   function a(){
    function b(){
      
    }
   }
    `
  },
  {
    title:'All',
    str:` 
  // definitions 
   class A{}
   static class B{}
   function C(){}
   static function D(){}
   async function E(){}
   async static function F(){}
   Function.prototype.G = function(args) { }
   Array.prototype.H = function(args) { }
   
  // assignations
   var a; 
   const b=1;
   let c="2";
   var d='3'+
   '3';
   var e = class{}
   var f = static class{}
   var g = static class extends () {}
   var h = class extends () {}
   var i = function(){}
   var j = async function(){}
   var k = static function(){}
   var l = async static function(){}
   var m = ()=>{}
   var n = async ()=>{}
   var o = static ()=>{}
   var p = async static ()=>{}
    `
  },

  
   
]; 
 let testIndex = process.argv[2]||0;

 var test = tests[testIndex];
 console.log('TESTING:',testIndex, test.title);
 

console.log(JSON.stringify(TurboDocJs.extract((test.str||"")),null,2));
  