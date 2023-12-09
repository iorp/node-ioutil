 
/**
 * Extracts a closure from a string based on provided opener and closer characters.
 *
 * @param {string} str - The input string from which to extract the closure.
 * @param {Object} options - Options for the extraction operation.
 * @param {string} options.opener - The opening character of the closure. Defaults to '{'.
 * @param {string} options.closer - The closing character of the closure. Defaults to '}'.
 * @param {number} options.offset - The starting position in the string. Defaults to 0.
 * @param {Array} options.excludes - Array of exclusion pairs represented as arrays. Defaults to [
 *                                    ['"', '"'],
 *                                    [`'`, `'`],
 *                                    ['`', '`'],
 *                                    ['/*', '*\/'],
 *                                    ['//', '\n']
 *                                  ].
 * @returns {string|null} - The extracted closure or null if no closure is found.
 */
 
function extractClosure(str, options={}) { 
    options=   Object.assign({
        opener :'{', closer : '}', offset: 0, excludes : [
            ['"', '"'],
            [`'`, `'`],
            ['`', '`'],
            ['/*', '*/'],
            ['//', '\n']
        ]
    },options);
    var {opener , closer, offset, excludes }= options;

    let start = -1;
    let level = 0;
    let exclusion = null;
    let q= false; // if opener==closer acts like a is open flag
    let k =false; // if opener==closer acts like a is opened in this cicle flag
    // Adjust the string based on the offset
    str = str.substring(offset);

    // Loop through each character in the adjusted string
    for (let i = 0; i < str.length; i++) {
        k=false;
        // Look for exclusion openers and closers
        if (exclusion === null) {
            // Exclusion starter
            for (let j = 0; j < excludes.length; j++) {
                const [exclusionStart, exclusionEnd] = excludes[j];

                // Exclusion starter
                if (str.substring(i, i + exclusionStart.length) === exclusionStart &&
                    !(exclusionStart.length === 1 && str.substring(i - 1) === '\\')) {
                    exclusion = j;
                    break;
                }
            }
        } else {
            // Exclusion ender
            const [exclusionStart, exclusionEnd] = excludes[exclusion];

            if (str.substring(i, i + exclusionEnd.length) === exclusionEnd &&
                !(exclusionEnd.length === 1 && str.substring(i - 1) === '\\')) {
                exclusion = null;
            }
        }

        if (exclusion !== null) continue;

 

        // Find main opener and closer 
        if (str.substring(i, i + opener.length) === opener  && str.substring(i - 1) != '\\')   {
           
            if(opener==closer){
                if(!q){
                    k=true;
                    q=true;
                    level++; if (start < 0) start = i;
                }
                
            }else{ 
            level++;  if (start < 0) start = i;
        }
        }

       // if (str.substring(i, i + closer.length) === closer) {
        if (str.substring(i, i + closer.length) === closer  && str.substring(i - 1) != '\\')   {
            if(opener==closer){
                if(!k){  
                    level--; 
                }
            }else{
                    level--;
                }
             
         }


        //  console.log(i,level,str[i])
        if (level === 0 && start >= 0) {
            var match = str.substring(start, i + closer.length);
            // Return the extracted content
            // if(!inclusive) match = match.slice(1, -1);

            return {
                match:match,
                matchInner:match.trim().slice(1, -1),
                start:offset+start, // global 
                end:offset+i + closer.length-1,// global 
                ostart:start, // within offset 
                oend:i + closer.length-1,// within offset 
            } 
        }
    }

    // Return null if no closure is found
    return  null
}

/**
 * Extracts a tree structure representing nested closures from a string.
 *
 * @param {string} str - The input string containing closures.
 * @param {Object} options - Configuration options for the extraction.
 * @param {Object} options.collector - A function that collects closure information.
 * @param {string} options.opener - The opening symbol of the closure.
 * @param {string} options.closer - The closing symbol of the closure.
 * @param {number} options.offset - An offset to adjust the positions of closures.
 * @param {Array<Array<string>>} options.excludes - Excluded patterns to ignore within closures.
 * @param {number} globalOffset - Additional global offset for position calculations.
 * @param {number} globalDepth - Additional depth for position calculations.
 * @returns {Object} - A tree structure representing the extracted closures.
 */
function extractClosureTree(str, options = {}, globalOffset = 0,globalDepth = 0) {
    options = Object.assign({
        collector: (collected, closure, options, globalOffset,globalDepth) => {
            collected[Object.keys(collected).length] = {
                '@match': closure.match,
                '@matchInner': closure.matchInner,
                '@start': closure.start + globalOffset,
                '@end': closure.end + globalOffset,
                '@depth':globalDepth,
                ...extractClosureTree(closure.match.slice(1, -1), { ...options, offset: 0 }, globalOffset + closure.start + options.opener.length,globalDepth+1),
                // the children can be grouped in a key
                // children:extractClosureTree(closure.match.slice(1, -1),{...options,offset:0},globalOffset+closure.start+options.opener.length)//+1 because we have sliced the closure symbol recurse(closure.match.slice(1, -1),level+1)
                // the children can be spread
                //...extractClosureTree(closure.match.slice(1, -1),{...options,offset:0},globalOffset+closure.start+options.opener.length,globalDepth+1)//+1 because we have sliced the closure symbol recurse(closure.match.slice(1, -1),level+1)
   
           
            };
        },
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

    var { opener, closer, offset, excludes } = options;
    var i = 0;
    var collected = {};

    while (i < str.length) {
        var closure = extractClosure(str, { ...options, offset: i });
        if (!closure) {
            break;
        } else {
            options.collector(collected, closure, options, globalOffset,globalDepth);
            i = closure.end + 1;
        }
    }

    return collected;
}



/**
 * Parses a string into a list of items separated by a specified separator.
 *
 * @param {string} str - The input string to be parsed into a list.
 * @param {Object} options - Options for the parsing operation.
 * @param {string} options.separator - The separator character between list items. Defaults to ','.
 * @param {number} options.offset - The starting position in the string. Defaults to 0.
 * @param {Array} options.excluders - Array of exclusion pairs represented as arrays. Defaults to [
 *                                      ['"', '"'],
 *                                      [`'`, `'`],
 *                                      ['`', '`'],
 *                                      ['{', '}'],
 *                                      ['[', ']'],
 *                                      ['(', ')']
 *                                    ].
 * @returns {Array} - An array containing the parsed items from the input string.
 */
function parseList(str, options={}) {
    var {separator = ",", offset = 0, excluders = [
        ['"', '"'],
        [`'`, `'`],
        ['`', '`'],
        ['{', '}'],
        ['[', ']'],
        ['(', ')']
    ]}= options;
    /**
     * Checks if the character at the given position is part of an exclusion pair.
     * If so, returns the content of the exclusion pair; otherwise, returns an empty string.
     *
     * @param {string} str - The input string.
     * @param {number} i - The current position in the string.
     * @returns {string} - The content of the exclusion pair or an empty string.
     */
    const excludedChars = (str, i) => {
        let c = str[i];

        for (let j = 0; j < excluders.length; j++) {
            let e = excluders[j];

            if (c == e[0]) {
          
                let closure = extractClosure(str, e[0], e[1], i,[]);
               
                if (closure!= null) { 
                    return closure.match ;
                }
            }
        }

        return '';
    }

    let exclusion = null;
    let out = [];
    let accumulator = '';

    for (let i = 0; i < str.length; i++) {
        let c = str[i];
 
        let excluded = excludedChars(str, i);
  

        if (excluded.length > 0) {
            i += excluded.length - 1;
            accumulator = accumulator + excluded;
            continue;
        }
        
        //if (c === separator) {
        if (str.substring(i, i + separator.length) === separator  && !(separator.length && str.substring(i - 1) === '\\'))   {
        
            out.push(accumulator);
            accumulator = '';
            i+=separator.length-1;
            continue;
        } else {
            accumulator += c;
        }
    }

    // Push the last accumulated argument (if any)
    if (accumulator.length > 0) {
        out.push(accumulator);
    }

    return out;
}
  

 /**
 * Searches for matches in an input string using a regular expression.
 *
 * @param {RegExp} regex - The regular expression pattern.
 * @param {string} inputString - The input string to search for matches.
 * @returns {Array<Object>} - An array of match details.
 * @property {string} match - The original matched string (found at match[0]).
 * @property {number} start - The starting index of the match.
 * @property {number} end - The ending index of the match.
 */
function searchr(regex, inputString) {
  const matches = [];
   
  let match;
  while ((match = regex.exec(inputString)) !== null) {
    matches.push({ 
      match: match[0], 
      start: match.index,
      end: match.index + match[0].length, 
    });
  }

  return matches;
}
 
 /**
 * Get the line number in a multiline string for a given character index.
 *
 * @param {string|string[]} lines - The multiline string or the lines string array.
 * @param {number} charIndex - The index of the character for which to find the line number.
 * @returns {number} - The line number (1-indexed) or -1 if the character is beyond the end of the string.
 */
function getLineNumber(lines, charIndex) {
    // Split the string into lines
    if(typeof lines ==='string') lines = lines.split('\n');
    if(!Array.isArray(lines)) {console.error('getLineNumber','lines must be string or [string]')}
     

    let currentLineIndex = 0;
    let currentLineLength = 0;

    for (let i = 0; i < lines.length; i++) {
        currentLineLength += lines[i].length + 1; // Add 1 for the newline character

        if (currentLineLength > charIndex) {
            // The character is in the current line
            return currentLineIndex; 
        }

        currentLineIndex++;
    }

    // Character is beyond the end of the string
    return -1;
}
/**
 * Get the line content in a multiline string for a given line index.
 *
 * @param {string|string[]} lines - The multiline string or the lines string array.
 * @param {number} lineIndex - The index of the line for which to find the line content of.
 * @returns {number} - The line number (1-indexed) or -1 if the character is beyond the end of the string.
 */

function getLine(lines,lineIndex){
 // Split the string into lines
 if(typeof lines ==='string') lines = lines.split('\n');
 if(!Array.isArray(lines)) {console.error('getLineNumber','lines must be string or [string]')}
    return lines[lineIndex]
}
// // Example usage:
// const multilineString = "Line 1\nLine 2\nLine 3\n";
// const characterIndex = 10; // Index of '2' in "Line 2"
// const lineNumber = getLineNumber(multilineString, characterIndex);

// console.log(lineNumber); // Output: 2

/**
 * Get the character index of the end of a specified line in a multiline string.
 *
 * @param {string|string[]} lines - The multiline string.
 * @param {number} lineIndex - The index of the line for which to find the character index (1-indexed).
 * @param {boolean} inclusive - Whether the ending character index should be inclusive (default is false).
 * @returns {number} - The character index of the end of the specified line or -1 if the line index is out of range.
 */
function getLineEndIndex(lines, lineIndex, inclusive = true) {
    // Split the string into lines
    if (typeof lines === 'string') lines = lines.split('\n');
    if (!Array.isArray(lines)) {
        console.error('getLineEndIndex', 'lines must be string or string[]');
        return -1;
    }

    if (lineIndex < 0 || lineIndex >= lines.length) {
        console.error('getLineEndIndex','Out if range, it must be in range', 0,':',lines.length-1,'. And its ',lineIndex);

        return -1;
    }

    let currentLineIndex = 0;
    let currentLineLength = 0;

    for (let i = 0; i < lines.length; i++) {
        if (currentLineIndex === lineIndex) {
            // Found the specified line
            const endIndex = currentLineLength + lines[i].length;
            return inclusive ? endIndex : Math.max(endIndex - 1, 0); // Ending character index
        }

        currentLineLength += lines[i].length + 1; // Add 1 for the newline character
        currentLineIndex++;
    }

    // Line index is out of range, return the end of the last line
    return currentLineLength;
}



/**
 * Get the starting character index of a specified line in a multiline string.
 *
 * @param {string|string[]} lines - The multiline string.
 * @param {number} lineIndex - The index of the line for which to find the starting character index (1-indexed).
 * @returns {number} - The starting character index of the specified line or -1 if the line index is out of range.
 */
function getLineStartIndex(lines, lineIndex) {
    // Split the string into lines
    if(typeof lines ==='string') lines = lines.split('\n');
    if(!Array.isArray(lines)) {
        console.error('getLineStartIndex','lines must be string or string[]');
        return -1;
    }
 

    if (lineIndex < 0 || lineIndex >= lines.length) {
        // Line index is out of range
        console.error('getLineStartIndex','Out if range, it must be in range', 0,':',lines.length-1,'. And its ',lineIndex);

        return -1;
    }

    let currentLineIndex = 0;
    let currentLineLength = 0;

    for (let i = 0; i < lines.length; i++) {
        if (currentLineIndex === lineIndex) {
            // Found the specified line
            return currentLineLength;
        }

        currentLineLength += lines[i].length + 1; // Add 1 for the newline character
        currentLineIndex++;
    }

    // Line index is out of range
    return -1;
}

// // Example usage:
// const multilineString = "Line 1\nLine 2\nLine 3\n";
// const targetLineIndex = 2;
// const startIndex = getLineStartIndex(multilineString, targetLineIndex);

// console.log(startIndex); // Output: 7



/**
 * Split a multiline string into an array of lines.
 *
 * @param {string|string[]} line - The multiline string.
 * @param {number} [from=0] - The starting index of the range (inclusive).
 * @param {number|null} [to=null] - The ending index of the range (exclusive). If null, it goes until the end of the string.
 * @returns {string[]} - An array containing individual lines of the input string within the specified range.
 */
function getLines(lines, from = 0, to = null) {
    if(typeof lines ==='string') lines = lines.split('\n');
    if(!Array.isArray(lines)) {console.error('getLines','lines must be string or [string]')}
  
    
    if (to === null) {
        return lines.slice(from);
    } else {
        return lines.slice(from, to);
    }
}
/**
 * Get a specified number of lines from a multiline string starting at a given index.
 *
 * @param {string} str - The multiline string.
 * @param {number} startIndex - The starting index to begin retrieving lines.
 * @param {number} lineCount - The number of lines to retrieve.
 * @returns {string[]} - An array containing the requested lines.
 */
function getLinesFromIndex(str, startIndex, lineCount) {
    const lines = str.split('\n');
    const result = [];

    for (let i = startIndex; i < lines.length && i < startIndex + lineCount; i++) {
        result.push(lines[i]);
    }

    return result;
}

// // Example usage:
// const multilineString = "Line 1\nLine 2\nLine 3\nLine 4\nLine 5\n";
// const allLines = getLines(multilineString);
// console.log(allLines);
// // Output: [ 'Line 1', 'Line 2', 'Line 3', 'Line 4', 'Line 5', '' ]

// const startIndex = 2;
// const linesToRetrieve = 3;
// const selectedLines = getLinesFromIndex(multilineString, startIndex, linesToRetrieve);
// console.log(selectedLines);
// // Output: [ 'Line 3', 'Line 4', 'Line 5' ]

  
module.exports={
     extractClosure:extractClosure,
     parseList:parseList,
     searchr:searchr,
     extractClosureTree:extractClosureTree,
     getLineNumber:getLineNumber,
     getLineStartIndex:getLineStartIndex,
     getLineEndIndex:getLineEndIndex,
     getLines:getLines,
     getLine:getLine
}

