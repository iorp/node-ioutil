const {parseList,extractClosure,getLineNumber,getLines,getLine, getLineStartIndex, getLineEndIndex}=require('../../../../src/common/strings');



const text = "   Hello World() \n   JavaScript is awesome\n   Regex is powerful";

 

 
/*
todo , ignore unknown assignations, 
recursivity with functions classes and prototypes 
group data in a single key whitin the level 
*/
 
  
    const TurboDocJs= class{ 
      static String=class{
       REGEX={
        VLC_DEFINITION_ASSIGNATED: /^(var|let|const)\s*([a-zA-Z1-9@$$_]*\w*)\s*=/g,
        VLC_DEFINITION_UNASSIGNATED:/^(var|let|const)\s*([a-zA-Z1-9@$$_]*\w*)\s*/g,
        ANONYMOUS_FUNCTION:/^((|static|async)(|.\s*)(|static|async)(|.\s*)(function.\s*\([^)]*\)\s*{\s*))|^(|static|async)(|.\s*)(|static|async)(|.\s*)(\(.*\)\s*=>\s*{)/g,
        ANONYMOUS_CLASS:/^(|static)(|.\s*)(class.*{)/g,
        FUNCTION_DEFINITION:/^((|static|async)(|.\s*)(|static|async)(|.\s*)(function.*\([^)]*\)*[^{]*))/g,
        CLASS_DEFINITION:/^(|static)(|.\s*)(class.*{)/g,
        PROTOTYPE_DEFINITION:/^([\w@$]+)\.prototype.([\w@$]+)/g,
        NUMBER:/^-?\d+(\.\d+)?/g
    
    
      }
   
       collect ={
        vlcDefinitionAssigned:(lines,line,attributes,options)=>{
          // var {offset,level}=attributes;
  
  
          var collected = null;
          if (this.REGEX.VLC_DEFINITION_ASSIGNATED.test(line.text)){ 
            let assignee = line.text.replace(/^[^=]*=/, '').trim();  
          // let assigneeStart = line.text.indexOf('=');
          //## string quoted assignee single and double quotes
          if(assignee.startsWith('"')||assignee.startsWith("'")){ 
            collected = this.collect.assigneeQuotedString(assignee,lines,line,attributes,options);  
            attributes.offset = collected[options.nodeDataKeyName]['end'] +2; //2 = 1 the new line, 1 for the next char 
          }
          else
          //## string backticked assignee 
          if(assignee.startsWith('`')){
            collected = this.collect.asigneeEnclosure('`','`',[],lines,line,attributes,options);  
            attributes.offset = collected[options.nodeDataKeyName]['end'] +2; //2 = 1 the new line, 1 for the next char 
          }
          else
          //## object assignee 
          if(assignee.startsWith('{')){
            
            collected = this.collect.asigneeEnclosure('{','}',[],lines,line,attributes,options);
            attributes.offset = collected[options.nodeDataKeyName]['end'] +2; //2 = 1 the new line, 1 for the next char 
          }
          else
          //## array assignee 
          if(assignee.startsWith('[')){
            collected = this.collect.asigneeEnclosure('[',']',[],lines,line,attributes,options); 
            attributes.offset = collected[options.nodeDataKeyName]['end'] +2; //2 = 1 the new line, 1 for the next char 
          }                    
          else
          //## parenthesed assignee 
          if(assignee.startsWith('(')){
          collected = this.collect.asigneeEnclosure('(',')',[],lines,line,attributes,options); 
          attributes.offset = collected[options.nodeDataKeyName]['end'] +2; //2 = 1 the new line, 1 for the next char 
          }                    
          else
          //## number assignee //todo redo to numeric 
          if(this.REGEX.NUMBER.test(assignee)){
            collected = this.collect.assigneeNumber(assignee,line,attributes,options); 
            attributes.offset = collected[options.nodeDataKeyName]['end'] +2; //2 = 1 the new line, 1 for the next char 
          }
          else 
          //## anonymous function assignee       
            if(this.REGEX.ANONYMOUS_FUNCTION.test(assignee)){      
            collected = this.collect.assigneeAnonymousFunction(lines,line,attributes,options); 
            attributes.offset =  collected[options.nodeDataKeyName]['end'] +2; //2 = 1 the new line, 1 for the next char  
          }
          else
          //## anonymous class assignee       
            if(this.REGEX.ANONYMOUS_CLASS.test(assignee)){      
            collected = this.collect.assigneeAnonymousClass(lines,line,attributes,options); 
            attributes.offset =  collected[options.nodeDataKeyName]['end'] +2; //2 = 1 the new line, 1 for the next char  
          }
         
        }
  
        
        return collected;
        },
        // Unassigned variable
        vlcDefinition:(lines,line,attributes,options)=>{
            //# var without assignation
            var collected;
            if (this.REGEX.VLC_DEFINITION_UNASSIGNATED.test(line.text)){  
             
          var {offset,level} = attributes;
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
            
            attributes.offset =  collected[options.nodeDataKeyName]['end'] +2//2 = 1 the new line, 1 for the next char  
             
          }
          return collected; 
        },
        prototypeDefinition:(lines,line,attributes,options)=>{ 
          var collected = null
          //# prototype definition       
          if(this.REGEX.PROTOTYPE_DEFINITION.test(line.text)){      
          var {offset,level} = attributes;
         
          var collected = null;
          // var attr =  TurboDocJs.getAttributes(line.text,'prototype');
          var argsClosure = extractClosure(lines.text,{opener:'(',closer:')',offset: offset});
          if(!argsClosure){  console.error('Malformed function arguments at line ',line.index);   } 
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
              },
              ...this.extract(lines.text,options,{offset:closure.start+1,limit:closure.end-1,level:level+1})
  
            }
           }else{
            console.error('Malformed function closure at line ',line.index);    
          }
          // console.log(closure)
         
          attributes.offset =  collected[options.nodeDataKeyName]['end'] +2; //2 = 1 the new line, 1 for the next char  
          }
          return collected; 
          
        },
        classDefinition:(lines,line,attributes,options)=>{
          var collected = null
          //# class definiton       
          if(this.REGEX.CLASS_DEFINITION.test(line.text)){      
          var {offset,level} = attributes;
          var collected = null;
         // var attr =  TurboDocJs.getAttributes(line.text,'class');
          //var argsClosure = extractClosure(lines.text,{opener:'(',closer:')',offset: i});
          //if(!argsClosure){  console.error('Malformed function arguments at li.text ',i); return;  } 
          //var argsList = parseList(argsClosure.matchInner);
          
         
          var closure = extractClosure(lines.text,{offset:offset});
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
              },
              ...this.extract(lines.text,options,{offset:closure.start+1,limit:closure.end-1,level:level+1})
  
            }
           }else{
            console.error('Malformed class closure at line ',offset); 
          }
          
           
          attributes.offset =  collected[options.nodeDataKeyName]['end'] +2; //2 = 1 the new line, 1 for the next char  
        }
        return collected; 
          
        },
        functionDefinition:(lines,line,attributes,options)=>{
          var collected = null
          if(this.REGEX.FUNCTION_DEFINITION.test(line.text)){
          
          var {offset,level} = attributes;
          var collected = null; 
          var argsClosure = extractClosure(lines.text,{opener:'(',closer:')',offset: offset});
        
          if(!argsClosure){
              console.error('functionDefinition:Malformed function arguments at line ',line.index);   
              return;  
            } 
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
            
              },
              ...this.extract(lines.text,options,{offset:closure.start+1,limit:closure.end-1,level:level+1})
              
            }
           }else{
            console.error('Malformed function closure at line ',offset); 
          }
          // console.log(closure)
          
          attributes.offset =  collected[options.nodeDataKeyName]['end'] +2; //2 = 1 the new line, 1 for the next char  
        }
        return collected;
      
          
        },
        assigneeAnonymousClass:(lines,line,attributes,options)=>{
          var {offset,level} = attributes;
          var collected = null;
          // todo retrieve extends closure if exists
          // todo retrieve constructor arguments
   
          var closure = extractClosure(lines.text,{offset:offset});
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
              },
              ...this.extract(lines.text,options,{offset:closure.start+1,limit:closure.end-1,level:level+1})
  
            }
           }else{
            console.error('Malformed class closure at line ',offset); 
          }
          // console.log(closure)
         
          return collected;
          
        },
        assigneeAnonymousFunction:(lines,line,attributes,options)=>{
          var {offset,level} = attributes;
          var collected = null;
          var argsClosure = extractClosure(lines.text,{opener:'(',closer:')',offset: offset});
          if(!argsClosure){  console.error('Malformed function arguments at line ',line.index); return;  } 
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
              },
              ...this.extract(lines.text,options,{offset:closure.start+1,limit:closure.end-1,level:level+1})
  
            }
           }else{
            console.error('Malformed function closure at line ',offset); 
          }
          // console.log(closure)
         
          return collected;
          
        },
        asigneeEnclosure:(opener,closer,excludes,lines,line,attributes,options)=>{
          var {offset,level} = attributes;
          
          var collected = null;  
           
            var end,dtype; 
            
              var closure = extractClosure(lines.text,{opener:opener,closer:closer,excludes:excludes,offset:offset});
  
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
        assigneeQuotedString:(input,lines,line,attributes,options)=>{
          var {offset,level} = attributes;
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
        assigneeNumber:(input,line,attributes,options)=>{
          var {offset,level} = attributes;
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
  
   
   
      
      extract(input,options={},attributes={}){
       
   
        attributes =  Object.assign({
          limit:null,
          offset:0,
          level:0
          },attributes);
          
        options =  Object.assign({
          'nodeDataKeyName':'@'
          
          },options);
           
        //var offset = offset;
        
        const lines = {
          list:getLines(input),
          text:input
        };
        var result={}; 
       
        while(attributes.offset<input.length){
          if(attributes.limit!=null && attributes.offset>attributes.limit)break;
          var line = {}
          line.index =getLineNumber(lines.list,attributes.offset);
          line.text = (lines.list[line.index]||'').trim();
          line.startCharIndex = getLineStartIndex(lines.list,line.index);
          line.endCharIndex =  getLineEndIndex(lines.list,line.index,false);
          
          // skip line comments
          if(line.text.startsWith('//')){
            attributes.offset = line.endCharIndex+2;
               continue;
          }
          // skip comments closures 
          if(line.text.startsWith('/*')){
            var closure = extractClosure(lines.text,{opener:'/*',closer:'*/',offset:line.startCharIndex,excludes:[]})
            console.log(closure)
            attributes.offset = closure.end+1;  
            continue;
          }
  
          // start capture 
   
          var collected =null;
          //# var with assignation
          
          if(!collected) collected = this.collect.vlcDefinitionAssigned(lines,line,attributes,options);
          if(!collected) collected = this.collect.vlcDefinition(lines,line,attributes,options);
          if(!collected) collected = this.collect.functionDefinition(lines,line,attributes,options);
          if(!collected) collected = this.collect.classDefinition(lines,line,attributes,options);
          if(!collected) collected = this.collect.prototypeDefinition(lines,line,attributes,options);
  
        if(collected!=null){  
           result[collected[options.nodeDataKeyName]['name']]=collected;
  
        }else{ 
          attributes.offset++;
        }
  
         
      }
        return result;
      }
    }
 
    static fromString(input,options){
      var extractor = new TurboDocJs.String(input,options);
      return extractor.extract(input,options)
    }
     
    }
 

 

const tests = [
  {
    title:'Tester',
    str:`
    const a=>(){
      const b=>(){
          
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
 
var r = TurboDocJs.fromString((test.str||""))
r = JSON.stringify(r,null,2)
console.log(r);
  