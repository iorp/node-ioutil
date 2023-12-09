const {parseList,extractClosure,getLineNumber,getLines,getLine, getLineStartIndex, getLineEndIndex}=require('../../../../src/common/strings');



 

 
 
 
  
   const TurboDocJs= class{
   
    static capture ={
      unassigned:(lines,line,i,level,options)=>{
        var captured = null; 
          var attr =  TurboDocJs.getAttributes(line.text,'var');
          captured={
            '@name':attr.name,
            '@type':line.text.match(/^\s*([^\s]+)/)?.[1],
            '@dtype':'null',
            '@line':line.index,
            '@start':line.startCharIndex,
            '@end':line.endCharIndex,
          };

          return captured;
      },
      prototypeDefinition:(lines,line,i,level,options)=>{
       
        var captured = null;
        var attr =  TurboDocJs.getAttributes(line.text,'prototype');
        var argsClosure = extractClosure(lines.text,{opener:'(',closer:')',offset: i});
        if(!argsClosure){  console.error('Malformed function arguments at li.text ',i); return;  } 
        var argsList = parseList(argsClosure.matchInner);
 
        var closure = extractClosure(lines.text,{offset:argsClosure.end+1});
        if(closure){
          captured={ 
            '@name':attr.name,  
            '@line':line.index,
            '@type':'prototype',
            '@dtype':'function',   
            '@prototypee':attr.prototypee,   
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
      classDefinition:(lines,line,i,level,options)=>{
        var captured = null;
        var attr =  TurboDocJs.getAttributes(line.text,'class');
        //var argsClosure = extractClosure(lines.text,{opener:'(',closer:')',offset: i});
        //if(!argsClosure){  console.error('Malformed function arguments at li.text ',i); return;  } 
        //var argsList = parseList(argsClosure.matchInner);
 
        var closure = extractClosure(lines.text,{offset:i});
        if(closure){
          captured={ 
            '@name':attr.name,  
            '@line':line.index,
            '@type':line.text.match(/^\s*([^\s]+)/)?.[1],
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
      functionDefinition:(lines,line,i,level,options)=>{
        var captured = null;
        var attr =  TurboDocJs.getAttributes(line.text,'function');
        var argsClosure = extractClosure(lines.text,{opener:'(',closer:')',offset: i});
        if(!argsClosure){  console.error('Malformed function arguments at li.text ',i); return;  } 
        var argsList = parseList(argsClosure.matchInner);
 
        var closure = extractClosure(lines.text,{offset:argsClosure.end+1});
        if(closure){
          captured={ 
            '@name':attr.name,  
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
      anonymousClass:(lines,line,i,level,options)=>{
        var captured = null;
        var attr =  TurboDocJs.getAttributes(line.text,'var');
        //var argsClosure = extractClosure(lines.text,{opener:'(',closer:')',offset: i});
        //if(!argsClosure){  console.error('Malformed function arguments at li.text ',i); return;  } 
        //var argsList = parseList(argsClosure.matchInner);
 
        var closure = extractClosure(lines.text,{offset:i});
        if(closure){
          captured={ 
            '@name':attr.name,  
            '@line':line.index,
            '@type':line.text.match(/^\s*([^\s]+)/)?.[1],
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
      anonymousFunction:(lines,line,i,level,options)=>{
        var captured = null;
        var attr =  TurboDocJs.getAttributes(line.text,'var');
        var argsClosure = extractClosure(lines.text,{opener:'(',closer:')',offset: i});
        if(!argsClosure){  console.error('Malformed function arguments at li.text ',i); return;  } 
        var argsList = parseList(argsClosure.matchInner);
 
        var closure = extractClosure(lines.text,{offset:argsClosure.end+1});
        if(closure){
          captured={ 
            '@name':attr.name,  
            '@line':line.index,
            '@type':line.text.match(/^\s*([^\s]+)/)?.[1],
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
      enclosure:(opener,closer,excludes,lines,line,i,level,options)=>{
        
        var captured = null;  
          var attr =  TurboDocJs.getAttributes(line.text,'var'); 
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
            '@name':attr.name,
            '@type':line.text.match(/^\s*([^\s]+)/)?.[1],
            '@dtype':dtype,
            '@line':line.index, 
            '@start':line.startCharIndex,
            '@end':end,
          }

          return captured;

          
        
      },
      // enclosedString:(input,lines,line,i,level,options)=>{
      //   const quoteType = input[0]; 
      //   var captured = null;  
      //     var attr =  TurboDocJs.getAttributes(line.text,'var'); 
      //     var end; 
      //     if(input.length>1 && input.endsWith(quoteType) || input.endsWith(';')){
      //     end = line.endCharIndex;
      //     }else{
      //       var closure = extractClosure(lines.text,{opener:quoteType,closer:quoteType,excludes:[],offset:i});
          
      //       if(closure){
      //       // todo store match ... 
      //         end = closure.end
      //       }else{
      //         console.error("Unclosed string literal at line ",line.index,line.text);
      //         return null;
      //       }
      //     }

      //     captured={
      //       '@name':attr.name,
      //       '@type':'var',
      //       '@dtype':'string',
      //       '@line':line.index, 
      //       '@start':line.startCharIndex,
      //       '@end':end,
      //     }

      //     return captured;

          
        
      // },
      quotedString:(input,lines,line,i,level,options)=>{
        const quoteType = input[0]; 
        var captured = null; 
  
          var attr =  TurboDocJs.getAttributes(line.text,'var');
    
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
            '@name':attr.name,
            '@type':line.text.match(/^\s*([^\s]+)/)?.[1],
            '@dtype':'string',
            '@line':line.index, 
            '@start':line.startCharIndex,
            '@end':end,
          }

          return captured;

          
        
      },
      number:(input,line,i,level,options)=>{
        //## number assignee
        var captured = null;
        if(/^-?\d+(\.\d+)?/g.test(input)){
          var attr =  TurboDocJs.getAttributes(line.text,'var');
          captured={
            '@name':attr.name,
            '@type':line.text.match(/^\s*([^\s]+)/)?.[1],
            '@dtype':'number',
            '@line':line.index,
            '@start':line.startCharIndex,
            '@end':line.endCharIndex,
          };
        }
        return captured;
      }
    } 
    // todo destroy and bring to each capture
    static getAttributes(str,type){
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
          attr['prototypee']= str.split('.')[0];
          break;
      }
  
      
      return attr;
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
        
        // todo exlude coments closures by jumping them 
        // ...
        var captured =null;
        //# var with assignation
        if (/^(var|let|const)\s*([a-zA-Z1-9@$$_]*\w*)\s*=/g.test(line.text)){
          var attr =  TurboDocJs.getAttributes(line.text,'var');
          let assignee = line.text.replace(/^[^=]*=/, '').trim();  
          let assigneeStart = line.text.indexOf('=');
          //## string quoted assignee single and double quotes
          if(assignee.startsWith('"')||assignee.startsWith("'")){ 
            captured = TurboDocJs.capture.quotedString(assignee,lines,line,i,level,options); 
            i = captured['@end'] +2; //2 = 1 the new line, 1 for the next char 
          }
          else
          //## string backticked assignee 
          if(assignee.startsWith('`')){
            captured = TurboDocJs.capture.enclosure('`','`',[],lines,line,i,level,options); 
            //captured = TurboDocJs.capture.enclosedString(assignee,lines,line,i,level,options); 
            i = captured['@end'] +2; //2 = 1 the new line, 1 for the next char 
          }
          //## object assignee 
          if(assignee.startsWith('{')){
            
            captured = TurboDocJs.capture.enclosure('{','}',[],lines,line,i,level,options);
            i = captured['@end'] +2; //2 = 1 the new line, 1 for the next char 
          }
          //## array assignee 
          if(assignee.startsWith('[')){
            captured = TurboDocJs.capture.enclosure('[',']',[],lines,line,i,level,options); 
            i = captured['@end'] +2; //2 = 1 the new line, 1 for the next char 
          }                    
          else
          //## number assignee //todo redo to numeric 
          if(/^-?\d+(\.\d+)?/g.test(assignee)){
            captured = TurboDocJs.capture.number(assignee,line,i,level,options); 
            i = captured['@end'] +2; //2 = 1 the new line, 1 for the next char 
          } 
          else 
          //## anonymous function assignee       
            if(/^((|static|async)(|.\s*)(|static|async)(|.\s*)(function.\s*\([^)]*\)\s*{\s*))|(|static|async)(|.\s*)(|static|async)(|.\s*)(\(.*\)\s*=>\s*{)/g.test(assignee)){      
            captured = TurboDocJs.capture.anonymousFunction(lines,line,i,level,options); 
            i = captured['@end'] +2; //2 = 1 the new line, 1 for the next char  
          }
          else
          //## anonymous class assignee       
            if(/^(|static)(|.\s*)(class.*{)/g.test(assignee)){      
            captured = TurboDocJs.capture.anonymousClass(lines,line,i,level,options); 
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
          captured = TurboDocJs.capture.functionDefinition(lines,line,i,level,options); 
          i = captured['@end'] +2; //2 = 1 the new line, 1 for the next char  
        }
        else
        //# class definiton       
        if(/^(|static)(|.\s*)(class.*{)/g.test(line.text)){      
          captured = TurboDocJs.capture.classDefinition(lines,line,i,level,options); 
          i = captured['@end'] +2; //2 = 1 the new line, 1 for the next char  
        }
        else 
        //# prototype definition       
        if(/^([\w@$]+)\.prototype.([\w@$]+)/g.test(line.text)){      
          captured = TurboDocJs.capture.prototypeDefinition(lines,line,i,level,options); 
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
    title:'var const and let',
    str:`  
    Function.prototype.demo = function(args) { 
    };

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
 let testIndex = process.argv[2]||0;

 var test = tests[testIndex];
 console.log('TESTING:',testIndex, test.title);
 

console.log(TurboDocJs.extract((test.str||"")));
  