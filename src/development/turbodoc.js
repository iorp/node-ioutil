 
const {parseList,extractClosure,getLineNumber,getLines,getLine, getLineStartIndex, getLineEndIndex}=require('../common/strings');
 
  
/*
TODO IN THE FUTURE: 
- Js.StringParser, Capture assignees: aritmetical / logic operations, parenthesis enclosures, and regex  

*/
 /** 
 * `StringParserJS` is a JavaScript class designed to parse and extract structured data from a string input, with a focus on capturing and organizing information related to code elements such as variables, functions, classes, prototypes, and more. The parsing process is customizable through various options, allowing users to control aspects such as verbosity, debug mode, filtering, and handling of specific markers.
 * @constructor
 * @param {string} input - The input string to be parsed.
 * @param {Object} options - An optional configuration object.
 * @param {boolean} [options.verbose=true] - Enable or disable verbose logging.
 * @param {boolean} [options.debug=false] - Enable debug mode for performance tests.
 * @param {string} [options.nodeDataKeyName='@'] - The subnode name where the node data is stored.
 * @param {number|null} [options.maxDepth=null] - The maximum level depth for parsing nested structures.
 * @param {boolean} [options.captureBlocks=true] - Capture doc blocks if present.
 * @param {boolean} [options.captureRoutes=true] - Capture routes (additional feature, not mentioned in the original code).
 * @param {Object} [options.markers] - Marker tags in single-line comments.
 * @param {string} [options.markers.todo='@todo'] - Marker for capturing TODO tags after single-line comments.
 * @param {Function} [options.filter] - A function to filter nodes based on custom conditions.
 * @param {Function} [options.onBeforeStoreNode] - A function to modify collected node data before storage.
 * @param {Function} [options.onAfterStoreNode] - A function to modify collected node data after storage.
 */
 const StringParserJS = class {
  output = {
    error: null,
    markers: {},
    tree: {}
  }; 
  constructor(input, options={}) {
    console.log(options)
    this.input = input;
    this.options = Object.assign({
      'verbose': true,
      'debug': false, // Performance tests
      'nodeDataKeyName': '@', // the subnode name here the node data is stored 
      'maxDepth': null, // The max level depth
      'captureBlocks': true, // Capture also doc blocks if present,
      'captureRoutes':true,
      'markers': { // marker tags in single line comments
        'todo': '@todo', // This tells turbodoc to capture @todo tags after single line comments (//) 
      },
      filter: (collected, offset, lines, line, self) => {
        return true;
      }, // filter: if it returns true ,the node will be stored, if not ,the collected object will not be stored.
      onBeforeStoreNode: (collected, offset, lines, line, self) => {
        return collected;
      }, // This allows to modify the collected node data before being stored. 
      onAfterStoreNode: (collected, offset, lines, line, self) => {} // This allows to modify the collected node data after being stored. 
    }, options);
   
    if (this.options.debug) {
      this.output.debug = {
        'startTime': new Date().getTime(),
        'log': [{
          time: 0,
          code: 'INIT'
        }]
      }
    }
 

    this.output.tree = this.extract(input);
  }
  REGEX = {
    VLC_DEFINITION_ASSIGNED: /^(var|let|const)\s*([a-zA-Z1-9@$_]*\w*)\s*=/,
    VLC_DEFINITION_ASSIGNED_INCLASS: /^(|static\s*async|async|static)\s*([a-zA-Z1-9@$_]*\w*)\s*=/,
    VLC_DEFINITION_UNASSIGNED: /^(var|let|const)\s*([a-zA-Z1-9@$_]*\w*)\s*/,
    ANONYMOUS_FUNCTION: /^((|static|async)(|\s*)(|static|async)(|\s*)(function(|\s*)\([^)]*\)(|\s*){\s*))|^(|static|async)(|\s*)(|static|async)(|\s*)(\(.*\)(|\s*)=(|\n*.\s*)>)/,
    ANONYMOUS_CLASS: /^(|static)(|.\s*)(class.*{)/,
    FUNCTION_DEFINITION: /^(|(static\s+async|static|async))(|\s+)function\s+([a-zA-Z1-9@$_]*\w*)(|\s+)\(.*(|\s+)\)(|\s+){/,
    FUNCTION_DEFINITION_INCLASS: /^(|((static\s+async|static|async)\s+))([a-zA-Z1-9@$_]*\w*)(|\s+)\((|.|\s+)\)(|\s+){/,
    CLASS_DEFINITION: /^(|static)(|.\s*)(class.*{)/,
    PROTOTYPE_DEFINITION: /^([\w@$]+)\.prototype.([\w@$]+)/,
    NUMBER: /^-?\d+(\.\d+)?/
  }
  collect = {
    definitionAssignedVLC: (lines, line, attributes, level, parent) => {
      const {
        options
      } = this;
      var collected = null;
      const PATTERN = (parent && parent.datatype == 'class') ? this.REGEX.VLC_DEFINITION_ASSIGNED_INCLASS : this.REGEX.VLC_DEFINITION_ASSIGNED
      if (PATTERN.test(lines.remainingText)) {
        let assignee = line.text.replace(/^[^=]*=/, '').trim();
   
        //## anonymous function assignee       
        if (this.REGEX.ANONYMOUS_FUNCTION.test(assignee)) {
          collected = this.collect.assigneeAnonymousFunction(lines, line, attributes, level, parent);
          attributes.offset = collected[options.nodeDataKeyName]['end'] + 2; //2 = 1 the new line, 1 for the next char  
        } else
          //## string quoted assignee single and double quotes 
          if (assignee.startsWith('"') || assignee.startsWith("'")) {
            collected = this.collect.assigneeQuotedString(assignee, lines, line, attributes, level, parent);
            attributes.offset = collected[options.nodeDataKeyName]['end'] + 2; //2 = 1 the new line, 1 for the next char 
          }
        else
          //## string backticked assignee 
          if (assignee.startsWith('`')) {
            collected = this.collect.assigneeEnclosure('`', '`', [], lines, line, attributes, level, parent);
            attributes.offset = collected[options.nodeDataKeyName]['end'] + 2; //2 = 1 the new line, 1 for the next char 
          }
        else
          //## object assignee 
          if (assignee.startsWith('{')) {
            collected = this.collect.assigneeEnclosure('{', '}', [], lines, line, attributes, level, parent);
            attributes.offset = collected[options.nodeDataKeyName]['end'] + 2; //2 = 1 the new line, 1 for the next char 
          }
        else
          //## array assignee 
          if (assignee.startsWith('[')) {
            collected = this.collect.assigneeEnclosure('[', ']', [], lines, line, attributes, level, parent);
            attributes.offset = collected[options.nodeDataKeyName]['end'] + 2; //2 = 1 the new line, 1 for the next char 
          }
        else
          //## number assignee //todo redo to numeric 
          if (this.REGEX.NUMBER.test(assignee)) {
            collected = this.collect.assigneeNumber(assignee, line, attributes, level, parent);
            attributes.offset = collected[options.nodeDataKeyName]['end'] + 2; //2 = 1 the new line, 1 for the next char 
          }
        else
          //## anonymous class assignee       
          if (this.REGEX.ANONYMOUS_CLASS.test(assignee)) {
            collected = this.collect.assigneeAnonymousClass(lines, line, attributes, level, parent);
            attributes.offset = collected[options.nodeDataKeyName]['end'] + 2; //2 = 1 the new line, 1 for the next char  
          }
        //@todo: parenthesed assignee 
        //  else 
        // //## parenthesed assignee 
        // if(assignee.startsWith('(')){
        // collected = this.collect.asigneeEnclosure('(',')',[],lines,line,attributes,level,parent); 
        // attributes.offset = collected[options.nodeDataKeyName]['end'] +2; //2 = 1 the new line, 1 for the next char 
        // }  
        //@todo: Numerical operations 
        // //## Numerical operations 
      }
      return collected;
    },
    // Unassigned variable
    definitionVLC: (lines, line, attributes, level, parent) => {
      if (parent && parent.datatype == 'class') return null;
      const {
        options
      } = this;
      //# var without assignation
      var collected;
      if (this.REGEX.VLC_DEFINITION_UNASSIGNED.test(lines.remainingText)) {
        var {
          offset
        } = attributes;
        var collected = null;
        let words = line.text.split(' ');
        collected = {
          [options.nodeDataKeyName]: {
            'name':words[1].trim(), 
            'line': line.index,
            'level': level,
            'type': 'vlc-definition',
            'definer': words[0].trim(), // first word
            'datatype': undefined,
            'start': line.startCharIndex,
            'end': line.endCharIndex,
            'parent':parent,
          }
        };
        attributes.offset = collected[options.nodeDataKeyName]['end'] + 2 //2 = 1 the new line, 1 for the next char  
      }
      return collected;
    },
    definitionPrototype: (lines, line, attributes, level, parent) => {
      if (parent && parent.datatype == 'class') return null;
      const {
        options
      } = this;
      var collected = null
      //# prototype definition       
      if (this.REGEX.PROTOTYPE_DEFINITION.test(lines.remainingText)) {
        var {
          offset
        } = attributes;
        var collected = null;
        // var attr =  TurboDocJs.getAttributes(line.text,'prototype');
        var argsClosure = extractClosure(lines.text, {
          opener: '(',
          closer: ')',
          offset: offset
        });
        if (!argsClosure) this.fn.throwError(line, 'Malformed prototype function arguments');
        var argsList = parseList(argsClosure.matchInner);
        var closure = extractClosure(lines.text, {
          offset: argsClosure.end + 1
        });
        if (closure) {
          collected = {
            [options.nodeDataKeyName]: {
              'name': line.text.match(/\b(?:\.prototype.)\s*([a-zA-Z1-9@$$_]*\w*)\b/)?.[1],
              'line': line.index,
              'level': level,
              'type': 'prototype-definition',
              'datatype': 'function',
              'definer': 'prototype',
              'prototypee': line.text.split('.')[0],
              'arguments': argsList,
              'start': line.startCharIndex,
              'end': closure.end,
              'parent': parent,
            },
          }
          if (closure.matchInner.trim().length > 0 && (options.maxDepth == null || (level + 1) <= (options.maxDepth))) Object.assign(collected, this.extract(lines.text, {
            offset: closure.start + 1,
            limit: closure.end - 1
          }, level + 1, collected[options.nodeDataKeyName]))
        } else {
          this.fn.throwError(line, 'Malformed prototype function closure');
        }
        attributes.offset = collected[options.nodeDataKeyName]['end'] + 2; //2 = 1 the new line, 1 for the next char  
      }
      return collected;
    },
    definitionClass: (lines, line, attributes, level, parent) => {
      const {
        options
      } = this;
      if (parent && parent.datatype == 'class') return null;
      var collected = null
      //# class definiton       
      if (this.REGEX.CLASS_DEFINITION.test(lines.remainingText)) {
        var {
          offset
        } = attributes;
        var collected = null;
        //@todo: retrieve constructor logic 
        // var attr =  TurboDocJs.getAttributes(line.text,'class');
        //var argsClosure = extractClosure(lines.text,{opener:'(',closer:')',offset: i});
        //if(!argsClosure) this.fn.addError(line,'args... not ok ');  
        //var argsList = parseList(argsClosure.matchInner);
        var closure = extractClosure(lines.text, {
          offset: offset
        });
        if (closure) {
          collected = {
            [options.nodeDataKeyName]: {
              'name': line.text.match(/class\s+([A-Za-z_$@]*)/)?.[1].trim(),
              'line': line.index,
              'level': level,
              'type': 'class-definition',
              'datatype': 'class',
              'definer': 'class',
              //'arguments':argsList, // todo from constructor if constructor present 
              'start': line.startCharIndex,
              'end': closure.end,
              'static': line.text.startsWith('static'),
              'extends': line.text.match(/extends\s+([A-Za-z_$@]*)/)?.[1].trim(),
              'parent': parent
            },
          }
          if (closure.matchInner.trim().length > 0 && (options.maxDepth == null || (level + 1) <= (options.maxDepth))) Object.assign(collected, this.extract(lines.text, {
            offset: closure.start + 1,
            limit: closure.end - 1
          }, level + 1, collected[options.nodeDataKeyName]))
        } else {
          this.fn.throwError(line, 'Malformed class  closure');
        }
        attributes.offset = collected[options.nodeDataKeyName]['end'] + 2; //2 = 1 the new line, 1 for the next char  
      }
      return collected;
    },
    definitionFunction: (lines, line, attributes, level, parent) => {
      var collected = null;
      const {
        options
      } = this;
      const PATTERN = (parent && parent.datatype == 'class') ? this.REGEX.FUNCTION_DEFINITION_INCLASS : this.REGEX.FUNCTION_DEFINITION
      const getFeatures = (lines, line, parent) => {
        let s = line.text.split('(')[0].split(' ')
        s.forEach(e => {
          e = e.trim();
        });
        // static and async 
        if (s[0] && s[1] && s[0] == 'static' && s[1] == 'async') {
          return {
            _static: true,
            _async: true,
            _name: (parent && parent.datatype == 'class') ? s[2] : s[3]
          }
        }
        if (s[0] && s[0] == 'static') {
          return {
            _static: true,
            _async: false,
            _name: (parent && parent.datatype == 'class') ? s[1] : s[2]
          }
        }
        if (s[0] && s[0] == 'async') {
          return {
            _static: false,
            _async: true,
            _name: (parent && parent.datatype == 'class') ? s[1] : s[2]
          }
        }
        if (s[0] && s[0] == 'function') {
          return {
            _static: false,
            _async: false,
            _name: s[1]
          }
        }
        // inclass function name when no async and no static 
        if (s[0] && (parent && parent.datatype == 'class')) {
          return {
            _static: false,
            _async: false,
            _name: s[0]
          }
        }
      }
      if (PATTERN.test(lines.remainingText)) {
        const {
          _static,
          _async,
          _name
        } = getFeatures(lines, line, parent)
        var {
          offset
        } = attributes;
        var collected = null;
        var argsClosure = extractClosure(lines.text, {
          opener: '(',
          closer: ')',
          offset: offset
        });
        if (!argsClosure) this.fn.throwError(line, 'Malformed function arguments closure');
        var argsList = parseList(argsClosure.matchInner);
        var closure = extractClosure(lines.text, {
          offset: argsClosure.end + 1
        });
        if (closure) {
          collected = {
            [options.nodeDataKeyName]: {
              'name': _name,
              'line': line.index,
              'level': level,
              'type': 'function-definition',
              'datatype': 'function',
              'definer': 'function',
              'arguments': argsList,
              'start': line.startCharIndex,
              'end': closure.end,
              'static': _static,
              'async': _async,
              'parent': parent,
            }
          };
          if (closure.matchInner.trim().length > 0 && (options.maxDepth == null || (level + 1) <= (options.maxDepth))) Object.assign(collected, this.extract(lines.text, {
            offset: closure.start + 1,
            limit: closure.end - 1
          }, level + 1, collected[options.nodeDataKeyName]))
        } else {
          this.fn.throwError(line, 'Malformed function closure');
        }
        attributes.offset = collected[options.nodeDataKeyName]['end'] + 2; //2 = 1 the new line, 1 for the next char  
      }
      return collected;
    },
    assigneeAnonymousClass: (lines, line, attributes, level, parent) => {
      var {
        offset
      } = attributes;
      var collected = null;
      const {
        options
      } = this;
      const getFeatures = (line, parent) => {
        let assignee = line.text.replace(/^[^=]*=/, '').trim();
        let _name = null,
          _static = null,
          _definer = null,
          _extends = null;
        let s = line.text.split(' ');
        s.forEach(e => {
          e = e.trim();
        });
        if (parent && parent.datatype == 'class') {
          if (s[0] && s[0] == 'static' && s[1]) {
            _static = true;
            _name = s[1];
            _definer = 'const';
          } else {
            _static = false;
            _name = s[0];
            _definer = 'const';
          }
        } else {
          _definer = s[0];
          _name = s[1];
        }
        let a = assignee.split(' ');
        a.forEach(e => {
          e = e.trim();
        });
        if (a[1] && a[1] == 'extends' && a[2]) _extends = (a[2].split('{')[0] || "").trim();
        return {
          _static: _static,
          _name: _name,
          _definer: _definer,
          _extends: _extends
        }
      }
      const {
        _name,
        _definer,
        _static,
        _extends
      } = getFeatures(line, parent)
      // todo retrieve extends closure if exists
      // todo retrieve constructor arguments
      var closure = extractClosure(lines.text, {
        offset: offset
      });
      if (closure) {
        collected = {
          [options.nodeDataKeyName]: {
            'name': _name,
            'type': 'anonymous-class',
            'definer': _definer,
            'datatype': 'class',
            'line': line.index,
            'level': level,
            //'arguments':argsList, // todo from constructor if constructor present 
            'start': line.startCharIndex,
            'end': closure.end,
            'static': _static,
            'extends': _extends,
            'parent': parent,
          },
        }
        if (closure.matchInner.trim().length > 0 && (options.maxDepth == null || (level + 1) <= (options.maxDepth))) Object.assign(collected, this.extract(lines.text, {
          offset: closure.start + 1,
          limit: closure.end - 1
        }, level + 1, collected[options.nodeDataKeyName]))
      } else {
        this.fn.throwError(line, 'Malformed class closure');
      }
      return collected;
    },
    assigneeAnonymousFunction: (lines, line, attributes, level, parent) => {
      var {
        offset
      } = attributes;
      var collected = null;
      const {
        options
      } = this;
      let assignee = line.text.replace(/^[^=]*=/, '').trim();
      const getFeatures = (line, assignee, parent) => {
        let _async = assignee.startsWith('async');
        let _name = null,
          _static = null,
          _definer = null;
        let s = line.text.split(' ');
        s.forEach(e => {
          e = e.trim();
        });
        if (parent && parent.datatype == 'class') {
          if (s[0] && s[0] == 'static' && s[1]) {
            _static = true;
            _name = s[1];
          } else {
            _static = false;
            _name = s[0]
          }
        } else {
          _definer = s[0];
          _name = s[1];
        }
        // let _name = (parent && parent.datatype=='class') ?
        //   (_static==true)?   line.text.match(/^\s*([^\s=]+)/)?.[1] :  line.text.match(/\b\w+\b/)?.[1]  
        //   :
        //   line.text.match(/\b\w+\b/)?.[1]
        return {
          _static: _static,
          _async: _async,
          _name: _name, //  first word ,//  second word  
          _definer: (parent && parent.datatype == 'class') ? null : line.text.match(/^\s*([^\s]+)/)?.[1] // first word 
        }
      }
      const {
        _name,
        _definer,
        _async,
        _static
      } = getFeatures(line, assignee, parent)
      var argsClosure = extractClosure(lines.text, {
        opener: '(',
        closer: ')',
        offset: offset
      });
      if (!argsClosure) this.fn.throwError(line, 'Malformed function arguments closure');
      var argsList = parseList(argsClosure.matchInner);
      var closure = extractClosure(lines.text, {
        offset: argsClosure.end + 1
      });
      if (closure) {
        collected = {
          [options.nodeDataKeyName]: {
            'name': _name,
            'type': 'anonymous-function',
            'definer': _definer,
            'datatype': 'function',
            'line': line.index,
            'level': level,
            'arguments': argsList,
            'start': line.startCharIndex,
            'end': closure.end,
            'static': _static,
            "async": _async,
            'parent': parent,
          },
        }
        if (closure.matchInner.trim().length > 0 && (options.maxDepth == null || (level + 1) <= (options.maxDepth))) Object.assign(collected, this.extract(lines.text, {
          offset: closure.start + 1,
          limit: closure.end - 1
        }, level + 1, collected[options.nodeDataKeyName]))
      } else {
        this.fn.throwError(line, 'Malformed function closure');
      }
      return collected;
    },
    assigneeEnclosure: (opener, closer, excludes, lines, line, attributes, level, parent) => {
      var {
        offset
      } = attributes;
      const {
        options
      } = this;
      // fix here get features 
      var collected = null;
      const {
        _name,
        _static,
        _definer
      } = this.fn.getBasicAssigneeFeatures(line, parent)
      var end, datatype;
      var closure = extractClosure(lines.text, {
        opener: opener,
        closer: closer,
        excludes: excludes,
        offset: offset
      });
      if (closure) {
        // todo store match ... 
        end = closure.end
      } else {
        this.fn.throwError(line, 'Unclosed closure');
      }
      switch (opener) {
        case '{':
          datatype = 'object';
          break;
        case '[':
          datatype = 'array';
          break;
        case '`':
          datatype = 'string';
          break;
        default:
          datatype = null;
      }
      collected = {
        [options.nodeDataKeyName]: {
          'name': _name,
          'definer': _definer,
          'type': datatype + '-enclosure',
          'datatype': datatype,
          'line': line.index,
          'level': level,
          'start': line.startCharIndex,
          'end': end,
          'static': _static,
          'parent': parent
        }
      }
      return collected;
    },
    assigneeQuotedString: (input, lines, line, attributes, level, parent) => {
      var {
        offset
      } = attributes;
      const {
        options
      } = this;
      const quoteType = input[0];
      var collected = null;
      const {
        _name,
        _static,
        _definer
      } = this.fn.getBasicAssigneeFeatures(line, parent)
      var end;
      if (input.endsWith(quoteType) || input.endsWith(';')) {
        end = line.endCharIndex;
      } else {
        if (input.endsWith('+')) {
          var currentLine = input;
          var currentLineNumber = line.index;
          while (currentLine.endsWith('+')) {
            currentLineNumber++;
            currentLine = getLine(lines.list, currentLineNumber)
          }
          const currentLineEnd = getLineEndIndex(lines.list, currentLineNumber);
          end = currentLineEnd;
        } else {
          this.fn.throwError(line, 'Unclosed string literal closure');
        }
      }
      collected = {
        [options.nodeDataKeyName]: {
          'name': _name,
          'line': line.index,
          'level': level,
          'type': 'string-enclosure',
          'definer': _definer,
          'datatype': 'string',
          'start': line.startCharIndex,
          'end': end,
          'static': _static,
          'parent': parent
        }
      }
      return collected;
    },
    assigneeNumber: (input, line, attributes, level, parent) => {
      var {
        offset
      } = attributes;
      const {
        options
      } = this;
      //## number assignee
      var collected = null;
      const {
        _name,
        _static,
        _definer
      } = this.fn.getBasicAssigneeFeatures(line, parent)
      if (this.REGEX.NUMBER.test(input)) {
        collected = {
          [options.nodeDataKeyName]: {
            'name': _name, // second word 
            'line': line.index,
            'level': level,
            'definer': _definer, // first word 
            'type': 'number',
            'datatype': 'number',
            'start': line.startCharIndex,
            'end': line.endCharIndex,
            'static': _static,
            'parent': parent
          }
        };
      }
      return collected;
    }
  }
  fn = {
    stackMarker: (lines, line, inputString) => {
      // let markerNames = Object.keys(this.options.markers);
      let markerPatterns = Object.values(this.options.markers || {});
      markerPatterns.forEach((patternStr, i) => {
        const pattern = patternStr + '\\s*([^;]+)(?:;|$)';
        const match = (inputString.match(pattern) || [])[1]?.trim();
        if (match) {
          let markerName = Object.keys(this.options.markers)[i];
          if (!this.output.markers[markerName]) this.output.markers[markerName] = [];
          this.output.markers[markerName].push({
            marker: markerName,
            line: line.index,
            text: match
          })
        }
      });
    },
    getBasicAssigneeFeatures: (line, parent) => {
      let _name = null,
        _static = null,
        _definer = null;
      let s = line.text.split('=')[0].split(' ');
      s.forEach(e => {
        e = e.trim();
      });
      if (parent && parent.datatype == 'class') {
        _definer = 'const';
        if (s[0] == 'static') {
          _static = true;
          _name = s[1];
        } else {
          _name = s[0]
        }
      } else {
        _definer = s[0];
        _name = s[1];
      }
      return {
        _name: _name,
        _static: _static,
        _definer: _definer
      };
    },
    getDocBlock: (lines, line) => {
      if (line.index >= lines.list.length) line.index = lines.list.length - 1;
      let insideCommentBlock = false;
      let storedLines = [];
      let lineEnd, lineStart;
      for (let i = line.index - 1; i >= 0; i = i - 1) {
        if (!lines.list[i]) continue;
        const currentLineText = lines.list[i].trim();
        if (currentLineText.endsWith('*/')) {
          insideCommentBlock = true;
          lineEnd = i;
        }
        if (currentLineText.length > 0 && !currentLineText.startsWith('/*') && !insideCommentBlock) {
          return null;
        }
        if (insideCommentBlock) {
          storedLines.push(lines.list[i].trim());
          if (currentLineText.startsWith('/*')) {
            lineStart = i;
            var blockText = storedLines.reverse().join('\n');
          //  if (clear) blockText = blockText.replace(/\/\*\s*|\s*\*\/|\s*\*\s?/, '').trim()
            return {
              text: blockText,
              //lineStart: lineStart,
              //lineEnd: lineEnd,
              charStart: getLineStartIndex(lines.list, lineStart),
              charEnd: getLineEndIndex(lines.list, lineEnd)
            }
          }
        }
      }
      return null;
    },
    throwError: (line, text) => {
      let error = {
        subject: 'TurboDoc.StringParserJS',
        line: line.index,
        text: text
      };
      this.output.error = error;
      if (this.options.verbose) console.error(error);
      // process.end();
    },
    getRoute:(target)=>{
    
     var res= [];
     var current = target; 
     while(current!=null){ 
      res.push(current.name); 
      current = current.parent ? current.parent||null:null;
     } 
     return [...res].reverse().join('.');
   
    
 
    }
  }
  extract(input, attributes = {}, level = 0, parent = null) {
    const {
      options
    } = this;
    if (level == 0) {
      attributes = Object.assign({
        limit: null,
        offset: 0,
      }, attributes);
    }
    const lines = {
      list: getLines(input),
      text: input
    };
    var result = {};
    var sindex = 0;
    while (attributes.offset < input.length) {
      if (attributes.limit != null && attributes.offset > attributes.limit) break;
      let char = lines.text[attributes.offset];
      if (char == ' ' || char == '\s' || char == '\r' || char == '\n' || char == '\t') {
        attributes.offset++;
        continue;
      }
      var line = {}
      line.index = getLineNumber(lines.list, attributes.offset);
      line.text = (lines.list[line.index] || '').trim();
      line.startCharIndex = getLineStartIndex(lines.list, line.index);
      line.endCharIndex = getLineEndIndex(lines.list, line.index, false);
      lines.remainingText = input.substr(attributes.offset)
      // skip line comments todo make this not necesarily from the start 
      if (line.text.startsWith('//')) {
        if (this.options.markers) this.fn.stackMarker(lines, line, line.text.substring(2))
        attributes.offset = line.endCharIndex + 2;
        continue;
      }
      // skip comments closures 
      if (line.text.startsWith('/*')) {
        var closure = extractClosure(lines.text, {
          opener: '/*',
          closer: '*/',
          offset: line.startCharIndex,
          excludes: []
        })
        attributes.offset = closure.end + 1;
        continue;
      }
      var collected = null;
      // start capture of elements  
      if (!collected) collected = this.collect.definitionAssignedVLC(lines, line, attributes, level, parent);
      if (!collected) collected = this.collect.definitionVLC(lines, line, attributes, level, parent);
      if (!collected) collected = this.collect.definitionFunction(lines, line, attributes, level, parent);
      if (!collected) collected = this.collect.definitionClass(lines, line, attributes, level, parent);
      if (!collected) collected = this.collect.definitionPrototype(lines, line, attributes, level, parent);
      // capture docblock
      if (collected && options.captureBlocks) collected[this.options.nodeDataKeyName].block = this.fn.getDocBlock(lines, line, true); 
       // capture route
       if (collected && options.captureRoutes) collected[this.options.nodeDataKeyName].route =  this.fn.getRoute(collected[this.options.nodeDataKeyName]) ; 
       
       if (collected )collected[this.options.nodeDataKeyName].sindex =sindex;
      
       // apply filter
      if (collected && typeof options.filter === 'function' && !options.filter(collected, attributes.offset, lines, line, this)) collected = null;
      if (collected != null) {

        
         // on before store node
        if (typeof options.onBeforeStoreNode === 'function') collected = options.onBeforeStoreNode(collected, attributes.offset, lines, line, this);
        result[collected[options.nodeDataKeyName]['name']] = collected;
        // on before store node
        if (typeof options.onAfterStoreNode === 'function') options.onAfterStoreNode(collected, attributes.offset, lines, line, this);
        if (this.options.debug) {
          const debug = {
            time: (new Date().getTime() - this.output.debug.startTime),
            code: 'CAPTURE',
            line: line.index,
            type: collected[options.nodeDataKeyName].type,
            name: collected[options.nodeDataKeyName].name
          };
          this.output.debug.log.push(debug);
          if (options.verbose) console.log(debug)
        }
      sindex++; // increment sibling index
      } else {
        //console.log(attributes.offset,line.index, 'NONE') 
        attributes.offset++;
      }
    }
    return result;
  }
}  
const  parseStringJS=function(input, options) {
  return new  StringParserJS(input, options);
}

 




const { iterate:iterateObject  }=require('../common/objects'); 
const { iterate:iterateStruct ,readFile }=require('../common/filesystem');
 
const StructDrafterJS= class{ 

  constructor(uri,options={},parser=null,parserOptions={}){
 
        this.uri = uri; 
        this.parser = parser||StringParserJS;  
        this.parserOptions= parserOptions;
            //todo use deep merge instead of assign because of nested oftions  
   
        this.options = Object.assign({ 
        
           fileFilter: (filePath) => filePath.endsWith('.js'), // only allows js
         // fileFilter: (filePath) => path.basename(filePath)==='index.js', // only allows index.js
         // dirFilter: (dirPath) => dirPath !== '/path/to/your/folder/excludeThisDirectory', // it doesnt allow that dir
          summaryMaxDepth:0,
          initialDepth:0,
          layout:[
            'summary',
            'elements',
            'markers'
          ]
           }, options);  
               
        
          this.stack= this.generateStack();

 
          // todo make choosable
        
          this.output = new this.presets.Markup(this.uri,this.stack,this.options).output;
 

  }
  // stack everithing  each item is a file 
  generateStack(){
    var stack = [];
        const {options} = this;
      const {dirFilter,fileFilter}=options;
// Filtered filesystem iteration
 iterateStruct(this.uri, (elementUri,level) => {

  var codeStr = readFile(elementUri).data;

  var codeParsed = new this.parser(codeStr,this.parserOptions).output;

  if(codeParsed.error){ 
    return;
  }else{

    var stackElement = {
      uri:elementUri,
      elements:[],
      markers :{}
    };
     
   
    iterateObject( codeParsed.tree,(key,value)=>{
 
          if(key=='@')return;
          if(value && value['@']){ 
           let node = value['@']
           stackElement.elements.push(node);
           
          }
         });

         stackElement.markers= codeParsed.markers;
       stack.push(stackElement);
  }
  //
 

  // Your callback logic for each file and folder goes here
}, {fileFilter,dirFilter});

return stack;
  }


  presets={

    Markup:class{
      constructor(baseUri,stack,options){
        this.stack = stack; 
        this.options = options; 
        this.baseUri = baseUri;
        const {elements,summary,markers}= this.decodeStack();
 
        this.output = {
          elements:elements,
          summary:summary,
          markers:markers, 
        }
        this.output.rendered=this.renderText()
        
      }


      renderText(){
        let rendered = '';
        this.options.layout.forEach(e => { 
          if(typeof e==='string'  && this.output[e]){ 
            rendered += this.output[e];
          }else if(typeof e==='function'){
            rendered += e(this.output);
        }else{
          //
        }
      
      });
      return rendered;
      }
      
      decodeStack(){
        // export in html 
        var elements='#'.repeat(this.options.initialDepth+2)+" Subject docs  \n";
        var summary='#'.repeat(this.options.initialDepth+2)+" Table of contents  \n";
        var markers = '';
        this.stack.forEach((file ,i)=> {
 

          // elements 
          // file header model 
          var fileRoute = file.uri.replace(/\\/, '-').replace(/\.[^.]+$/, '').toLowerCase();
          var fileName = file.uri.substr(this.baseUri.length-1).replace(/\\/, '.').replace(/\.[^/.]+$/, '');
          // summary +=`${i}. [${fileName}](#${fileRoute})`+"  \n";
          summary +=this.models.summaryEntry(0,i,fileName,fileRoute);
           elements+= this.models.fileHeader(0,fileName,fileRoute,file);

          if(file.markers){
            var fileMarkers='';
            Object.keys(file.markers).forEach(key => { 
            file.markers[key].forEach(e => {
              fileMarkers+=`${key}: Line ${e.line}: ${e.text}  `
            });
          });
          }
            markers +=fileMarkers;
          
            // todo if markers on file ...

          file.elements.forEach(element => {
            var fullItemRoute = `${fileRoute}-${element.route}`.toLowerCase() ;
            
            // index model   // global summary
          if(this.options.summaryMaxDepth>=0 &&  this.options.summaryMaxDepth <= element.level)
          summary +=this.models.summaryEntry(element.level+1,element.sindex,element.name,fullItemRoute);
           
            // element model 
            elements+= this.models.elementEntry(element.level+1,element,fullItemRoute,fileName);
           });
 
        });
        return {elements:elements,summary:summary,markers:markers}
      }
      models={
        summaryEntry:(level,siblingIndex,text,link)=>{
          return '\t'.repeat(level)+`- ${siblingIndex}. [${text}](#${link})`+"  \n";

        },
        
        fileHeader:(level,fileName,fileRoute,file)=>{
          var str =  '#'.repeat(this.options.initialDepth+2+level+1) + ` ${fileName} <a id="${fileRoute}"></a>`+"  \n";
         if(file.markers && file.markers.doc) str+=file.markers.doc.map((e)=>{return e.text}).join("  \n")+"  \n";
         return str;
        },
        elementEntry:(level,element,fullItemRoute,fileName)=>{
          var str= '#'.repeat(this.options.initialDepth+2+level+1) + ` ${element.name} <a id="${fullItemRoute}"></a>`+"  \n";
          str +=fileName+'.'+element.route+"  \n";
          if(element.block) str+= "```js"+"  \n"+`${element.block.text}`+"  \n```  \n";
         
          
           return str;
          },
      }
    }
  }



}





// // TODO KILL NNU  make a draft from a single string 
// const StringDrafterJS = class{
//   constructor(input,options={},parser=null,parserOptions={}){
 
//     this.input = input; 
//     this.parser = parser||StringParserJS; 
     
//     this.parserOptions= parserOptions;
//     this.options = Object.assign({

//       // options by section  todo rename to models ! 
//       models:{
//         summary:{
          
//           head:(self)=>{return 'I am summary head'},
//           foot:null,
//           item:(self,node)=>{return `  ${node.sindex+'-'.repeat(node.level+1)} ${node.name} ${node.type}  ` }
 

//         },
//         body:{
//           head:(self)=>{return 'I am body head'},
//           foot:null,
//          // item:(self,node)=>{return node} , 
//           item:(self,node)=>{return `  ${node.sindex+'-'.repeat(node.level+1)} ${node.name} ${node.type}  ` }

//         }
         
//       },
//       layout:[
//         'title',
//         '@summary',
//         '@body'
//       ]
       


       
//        }, options);

//        this.output={
//         doc:'result here',
//         sections:{}
//       }
//       this.parse()
//      // console.log(JSON.stringify(this.parsed,null,2)); return;
//     this.build();

  
//   }
//   parse(){ 
//     this.parsed = new this.parser(this.input,this.parserOptions).output;

//   }
//   build (){
//     const {options} = this;
   
//     if(this.parsed.error){ console.error('TurboDoc.DocBuilder', 'Parse errors present.',this.parsed.error); return;}
//     if(this.parsed.tree==undefined  ){ console.error('TurboDoc.DocBuilder', 'No tree found.'); return;}

//     this.fn.captureModels('head');

//    iterate( this.parsed.tree,(key,value)=>{
 
//     if(key=='@')return;
//     if(value && value['@']){ 
//      let node = value['@']
 
//      this.fn.captureModels('item',node);
//       // // Capture summary entry 
//       // if(options.layout.includes('@summary')){
//       //   if(!this.output.sections.summary)  this.output.sections.summary=[];
//       //   let chunk =this.options.sections['@summary'](node,level,this)
//       //   if(chunk)this.output.sections.summary.push(chunk)
//       // }

//       // if(options.layout.includes('@body')){
//       //   if(!this.output.sections.body)  this.output.sections.body=[];
//       //   let chunk =this.options.sections['@body'](node,level,this)
//       //   if(chunk)this.output.sections.body.push(chunk)
//       // }
 
//     }
//    });
//   }
//   fn={
//       captureModels:(position,node)=>{ 
//       Object.keys(this.options.models).forEach(key => { 
//             if(!this.output.sections[key])  this.output.sections[key]=[];
//             let chunk = (typeof this.options.models[key][position]==='function')? this.options.models[key][position](this,node):this.options.models[key][position];
//             if(chunk)this.output.sections[key].push(chunk)
//           });
    
//   } 
//   }
// }
// const  draftStringJS=function(input, options) {
//   return new  StringDrafterJS(input, options);
// }







module.exports={ 
  StringParserJS:StringParserJS,
  parseStringJS:parseStringJS,
  StructDrafterJS:StructDrafterJS 
  }
