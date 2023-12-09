const {parseList,extractClosure,getLineNumber,getLines,getLine, getLineStartIndex, getLineEndIndex}=require('../../../../src/common/strings');



const text = "   Hello World() \n   JavaScript is awesome\n   Regex is powerful";

 

 
 
 
  
   const TurboDocJs= class{
   
    static capture ={
      // Unassigned variable
      unassigned:(lines,line,i,level,options)=>{
        var captured = null; 
       
          captured={
            '@name':line.text.match(/\b\w+\b/g)?.[1], // second word 
            '@type':line.text.match(/^\s*([^\s]+)/)?.[1], // first word
            '@dtype':'null',
            '@line':line.index,
            '@start':line.startCharIndex,
            '@end':line.endCharIndex,
          };

          return captured;
      },
      definerPrototype:(lines,line,i,level,options)=>{
       
        var captured = null;
        // var attr =  TurboDocJs.getAttributes(line.text,'prototype');
        var argsClosure = extractClosure(lines.text,{opener:'(',closer:')',offset: i});
        if(!argsClosure){  console.error('Malformed function arguments at li.text ',i); return;  } 
        var argsList = parseList(argsClosure.matchInner);
 
  
        var closure = extractClosure(lines.text,{offset:argsClosure.end+1});
        if(closure){
          captured={ 
            '@name': line.text.match(/\b(?:\.prototype.)\s*([a-zA-Z1-9@$$_]*\w*)\b/)?.[1],
            '@line':line.index,
            '@type':'prototype',
            '@dtype':'function',   
            '@prototypee':line.text.split('.')[0],   
            '@arguments':argsList, 
            '@start':line.startCharIndex,
            '@end':closure.end,
            // ...extractExpressionsJS(input,closure.start+1,level+1)
            // continue here it must recurse ...recuse ... here 
          }
         }else{
          console.error('Malformed function closure at line ',i); 
        }
        // console.log(closure)
       
        return captured;
        
      },
      definerClass:(lines,line,i,level,options)=>{
        var captured = null;
       // var attr =  TurboDocJs.getAttributes(line.text,'class');
        //var argsClosure = extractClosure(lines.text,{opener:'(',closer:')',offset: i});
        //if(!argsClosure){  console.error('Malformed function arguments at li.text ',i); return;  } 
        //var argsList = parseList(argsClosure.matchInner);
        
       
        var closure = extractClosure(lines.text,{offset:i});
        if(closure){
           
          captured={ 
            '@name': line.text.match(/class\s+([A-Za-z_$@][A-Za-z0-9_$@]*)/)?.[1].trim(),  
            '@line':line.index,
            '@type':'class', 
            '@dtype':'class',  
            //'@arguments':argsList, // todo from constructor if constructor present 
            '@start':line.startCharIndex,
            '@end':closure.end,
            // ...extractExpressionsJS(input,closure.start+1,level+1)
            // continue here it must recurse ...recuse ... here 
          }
         }else{
          console.error('Malformed class closure at line ',i); 
        }
        // console.log(closure)
       
        return captured;
        
      },
      definerFunction:(lines,line,i,level,options)=>{
        var captured = null; 
        var argsClosure = extractClosure(lines.text,{opener:'(',closer:')',offset: i});
        if(!argsClosure){  console.error('Malformed function arguments at li.text ',i); return;  } 
        var argsList = parseList(argsClosure.matchInner);
 
        var closure = extractClosure(lines.text,{offset:argsClosure.end+1});
        if(closure){
          captured={ 
            '@name':line.text.match(/function\s+([A-Za-z_$@][A-Za-z0-9_$@]*)/)?.[1].trim(),  
            '@line':line.index,
            '@type':'function',
            '@dtype':'function',   
            '@arguments':argsList, 
            '@start':line.startCharIndex,
            '@end':closure.end,
            // ...extractExpressionsJS(input,closure.start+1,level+1)
            // continue here it must recurse ...recuse ... here 
          }
         }else{
          console.error('Malformed function closure at line ',i); 
        }
        // console.log(closure)
       
        return captured;
        
      },
      assigneeAnonymousClass:(lines,line,i,level,options)=>{
        var captured = null;
        // todo retrieve extends closure if exists
        // todo retrieve constructor arguments
 
        var closure = extractClosure(lines.text,{offset:i});
        if(closure){
          captured={ 
            '@name':line.text.match(/\b\w+\b/g)?.[1], // second word 
            '@type':line.text.match(/^\s*([^\s]+)/)?.[1], // first word  
            '@line':line.index, 
            '@dtype':'class',  
            //'@arguments':argsList, // todo from constructor if constructor present 
            '@start':line.startCharIndex,
            '@end':closure.end,
            // ...extractExpressionsJS(input,closure.start+1,level+1)
            // continue here it must recurse ...recuse ... here 
          }
         }else{
          console.error('Malformed class closure at line ',i); 
        }
        // console.log(closure)
       
        return captured;
        
      },
      assigneeAnonymousFunction:(lines,line,i,level,options)=>{
        var captured = null;
        var argsClosure = extractClosure(lines.text,{opener:'(',closer:')',offset: i});
        if(!argsClosure){  console.error('Malformed function arguments at li.text ',i); return;  } 
        var argsList = parseList(argsClosure.matchInner);
 
        var closure = extractClosure(lines.text,{offset:argsClosure.end+1});
        if(closure){
          captured={
            '@name':line.text.match(/\b\w+\b/g)?.[1], // second word 
            '@type':line.text.match(/^\s*([^\s]+)/)?.[1], // first word   
            '@dtype':'function',   
            '@line':line.index, 
            '@arguments':argsList, 
            '@start':line.startCharIndex,
            '@end':closure.end,
            // ...extractExpressionsJS(input,closure.start+1,level+1)
            // continue here it must recurse ...recuse ... here 
          }
         }else{
          console.error('Malformed function closure at line ',i); 
        }
        // console.log(closure)
       
        return captured;
        
      },
      asigneeEnclosure:(opener,closer,excludes,lines,line,i,level,options)=>{
        
        var captured = null;  
         
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
              case '{':dtype='object';break;
              case '[':dtype='array';break;
              case '`':dtype='string';break;
              default:dtype=null;
            }

          captured={
            '@name':line.text.match(/\b\w+\b/g)?.[1], // second word 
            '@type':line.text.match(/^\s*([^\s]+)/)?.[1], // first word
            '@dtype':dtype,
            '@line':line.index, 
            '@start':line.startCharIndex,
            '@end':end,
          }

          return captured;

          
        
      },
      assigneeQuotedString:(input,lines,line,i,level,options)=>{
        const quoteType = input[0]; 
        var captured = null; 
  
     
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

          captured={
            '@name':line.text.match(/\b\w+\b/g)?.[1], // second word 
            '@type':line.text.match(/^\s*([^\s]+)/)?.[1], // first word 
            '@dtype':'string',
            '@line':line.index, 
            '@start':line.startCharIndex,
            '@end':end,
          }

          return captured;

          
        
      },
      assigneeNumber:(input,line,i,level,options)=>{
        //## number assignee
        var captured = null;
        if(/^-?\d+(\.\d+)?/g.test(input)){
           captured={
            '@name':line.text.match(/\b\w+\b/g)?.[1], // second word 
            '@type':line.text.match(/^\s*([^\s]+)/)?.[1], // first word 
            '@dtype':'number',
            '@line':line.index,
            '@start':line.startCharIndex,
            '@end':line.endCharIndex,
          };
        }
        return captured;
      }
    } 
 
    static recurse(input,offset=0,level=0,options={}){
      var i = offset;
      
      const lines = {
        list:getLines(input),
        text:input
      };
      var collected={}; 
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
 
        var captured =null;
        //# var with assignation
        if (/^(var|let|const)\s*([a-zA-Z1-9@$$_]*\w*)\s*=/g.test(line.text)){ 
          let assignee = line.text.replace(/^[^=]*=/, '').trim();  
          let assigneeStart = line.text.indexOf('=');
          //## string quoted assignee single and double quotes
          if(assignee.startsWith('"')||assignee.startsWith("'")){ 
            captured = TurboDocJs.capture.assigneeQuotedString(assignee,lines,line,i,level,options); 
            i = captured['@end'] +2; //2 = 1 the new line, 1 for the next char 
          }
          else
          //## string backticked assignee 
          if(assignee.startsWith('`')){
            captured = TurboDocJs.capture.asigneeEnclosure('`','`',[],lines,line,i,level,options); 
            //captured = TurboDocJs.capture.enclosedString(assignee,lines,line,i,level,options); 
            i = captured['@end'] +2; //2 = 1 the new line, 1 for the next char 
          }
          //## object assignee 
          if(assignee.startsWith('{')){
            
            captured = TurboDocJs.capture.asigneeEnclosure('{','}',[],lines,line,i,level,options);
            i = captured['@end'] +2; //2 = 1 the new line, 1 for the next char 
          }
          //## array assignee 
          if(assignee.startsWith('[')){
            captured = TurboDocJs.capture.asigneeEnclosure('[',']',[],lines,line,i,level,options); 
            i = captured['@end'] +2; //2 = 1 the new line, 1 for the next char 
          }                    
          else
          //## number assignee //todo redo to numeric 
          if(/^-?\d+(\.\d+)?/g.test(assignee)){
            captured = TurboDocJs.capture.assigneeNumber(assignee,line,i,level,options); 
            i = captured['@end'] +2; //2 = 1 the new line, 1 for the next char 
          } 
          else 
          //## anonymous function assignee       
            if(/^((|static|async)(|.\s*)(|static|async)(|.\s*)(function.\s*\([^)]*\)\s*{\s*))|(|static|async)(|.\s*)(|static|async)(|.\s*)(\(.*\)\s*=>\s*{)/g.test(assignee)){      
            captured = TurboDocJs.capture.assigneeAnonymousFunction(lines,line,i,level,options); 
            i = captured['@end'] +2; //2 = 1 the new line, 1 for the next char  
          }
          else
          //## anonymous class assignee       
            if(/^(|static)(|.\s*)(class.*{)/g.test(assignee)){      
            captured = TurboDocJs.capture.assigneeAnonymousClass(lines,line,i,level,options); 
            i = captured['@end'] +2; //2 = 1 the new line, 1 for the next char  
          }
           
        }
        else
         //# var without assignation
        if (/(var|let|const)\s*([a-zA-Z1-9@$$_]*\w*)\s*/g.test(line.text)){ 
          captured = TurboDocJs.capture.unassigned(lines,line,i,level,options); 
          i = captured['@end'] +2; //2 = 1 the new line, 1 for the next char  
        }
        else
        //# function definiton 
        if(/^((|static|async)(|.\s*)(|static|async)(|.\s*)(function.*\([^)]*\)*[^{]*))/g.test(line.text)){
          captured = TurboDocJs.capture.definerFunction(lines,line,i,level,options); 
          i = captured['@end'] +2; //2 = 1 the new line, 1 for the next char  
        }
        else
        //# class definiton       
        if(/^(|static)(|.\s*)(class.*{)/g.test(line.text)){      
          captured = TurboDocJs.capture.definerClass(lines,line,i,level,options); 
          i = captured['@end'] +2; //2 = 1 the new line, 1 for the next char  
        }
        else 
        //# prototype definition       
        if(/^([\w@$]+)\.prototype.([\w@$]+)/g.test(line.text)){      
          captured = TurboDocJs.capture.definerPrototype(lines,line,i,level,options); 
          i = captured['@end'] +2; //2 = 1 the new line, 1 for the next char  
          }
  
        if(captured!=null){ 
        collected[captured['@name']]=captured;
  
        }else{ 
          i++;
        }
        
         
         
      }
      return collected;
    }
    static extract(input,options={}){
      return TurboDocJs.recurse(input);
    }
     
    }
 

 

const tests = [
  {
    title:'Tester',
    str:`
    const b= ()=>{

    }
    // skippable
abc
    /*
     skippable
     */abc
    const c =1
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
 

console.log(TurboDocJs.extract((test.str||"")));
  