const {promptForConfirm}=require('./../../../src/common/terminal');

// Example usage:
(async () => {
    const result = await promptForConfirm("Do you want to continue?", ['y', 'n'], 'n');
    console.log(`User chose: ${result}`);
})();
