
# ioutiln (node-ioutil)
ioutil library for node.

##   Developer notes 
 

###   Build 
1. Build after edits.
Script postbuild will perform a npm link , see postbuild scripts at [package](./package.json).
  ```bash
   npm run build
   ```
2. Eventually link.
  ```bash
   npm link
   ```

 
## Tests 

```bash
node test/common/terminal/promptForConfirm.js

node test/common/filesystem/remove.js
node test/common/filesystem/copy.js
node test/common/filesystem/generateHierarchy.js
node test/common/filesystem/readFile.js 
node test/common/filesystem/writeFile.js 
node test/common/filesystem/iterate.js 
node test/common/filesystem/makeTree.js 

node test/common/network/httpRequest.js

 
node test/common/strings/extractClosure.js 
node test/common/strings/extractClosureTree.js  
node test/common/strings/parseList.js 
node test/common/strings/searchr.js 
 
 node test/common/objects/iterate.js 
 node test/common/objects/get.js 
 node test/common/objects/set.js 
 node test/common/objects/remove.js 
 node test/common/objects/toggle.js  
 node test/common/objects/deepMerge.js 
 node test/common/objects/deepClone.js 

  node test/common/arrays/get.js 
  node test/common/arrays/set.js 
  node test/common/arrays/recurse.js 

 
node test/development/devjs/call.js greet Gatete
node test/development/devjs/readEnvFile.js
node test/development/devjs/writeEnvFile.js
node test/development/devjs/initEnv.js
 
node test/development/turbodoc/stringParser.js
node test/development/turbodoc/structDrafter.js


 node test/plugins/fson.js 

```




npm publish --force