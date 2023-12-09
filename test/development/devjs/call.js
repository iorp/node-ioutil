//
const {runCommand}=require('../../../src/development/devjs');
// GreetCommand.js
class GreetCommand {
    constructor(args) {
      this.args = args;
      this.execute();
    }
  
    execute() {
      console.log(`Hello, ${this.args[0]}!`);
    }
  }
  
  // HelpCommand.js
  class HelpCommand {
    constructor(args) {
      this.args = args;
      this.execute();
    }
  
    execute() {
      console.log("Displaying help information...");
    }
  }
  
 
const classCollection = {
  greet: GreetCommand,
  help: HelpCommand,
  // Add more commands as needed
};
 
// Example usage:
const commandKey = process.argv[2]; // Assuming the command key is provided as the third argument
const result = call(classCollection, commandKey, 3); // Assuming command-line arguments start from index 3

// No need to call result.execute() since the behavior is handled in the constructor
