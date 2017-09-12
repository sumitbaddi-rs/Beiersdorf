require("babel-register");
require("babel-polyfill");

var bulkLoad = require('./BulkLoad');
const readline = require('readline');
var config = require('./config/config');

var pwd = '../';

var quiteModeEnabled = config.quiteLoadConfig.enabled;

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

if (quiteModeEnabled) {
    var quiteLoadConfig = config.quiteLoadConfig;

    console.log('Quite mode is enabled...loading with below options: ');

    console.log('Tool config: ', JSON.stringify(config.toolConfig, null, 2));

    console.log('Quite load config: ', JSON.stringify(config.quiteLoadConfig, null, 2));

    rl.question('Do you confirm to start (y/n):', (c) => {
        if(c.toLowerCase() == 'y') {
            bulkLoad.startLoadingData(quiteLoadConfig.sourcePath, quiteLoadConfig.loadOptions, quiteLoadConfig.tenantId, 'N');
        } else {
            console.log('Load cancelled, please review the quite load settings and try again.');
        }
        rl.close();
    });
}
else {
    console.log("Hi, there! let us start the load..."); ``
    console.log('we are going to load config for: ', JSON.stringify(config.toolConfig, null, 2));

    // console.log("\nYou have below data folders available in the configured path---------------\n");
    // list.forEach(function (item) {
    //     var isInIgnoreList = ignoreList.find(i => i == item);

    //     if (!isInIgnoreList) {
    //         console.log(item);
    //     }
    // }, this);
    // console.log("\n----------------------------------------------------------------------------\n");

    rl.question('1. Can you provide me source path:', (sourcePath) => {
        console.log("\n");
        rl.question("2. Good, next question, whats' the tenant Id:", (tenantId) => {
            console.log("\nYou have below options to choose from---------------------------------------\n");
            console.log("all");
            console.log("tenant-config");
            console.log("foundation");
            console.log("authorizationmodel");
            console.log("governancemodel");
            console.log("entitymodels");
            console.log("contexts");
            console.log("contextualmodel");
            console.log("referencemodel");
            console.log("referencedata");
            console.log("referencedatawithrelationships");
            console.log("data");
            console.log("uiconfig");
            console.log("matchconfig");
            console.log("rsconnectprofiles");
            console.log("healthcheck");
            console.log("\n----------------------------------------------------------------------------\n");
            rl.question('3. What option you like:', (option) => {
                bulkLoad.startLoadingData(
                    sourcePath, 
                    { "foldersToRun": [option], "fileNamesToRun": [], "fileNamesToExclude": []}, 
                    tenantId, 
                    'N');
                rl.close();
            });
        });
    });
}


