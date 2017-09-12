var fs = require('fs');
var sleep = require('system-sleep');

var serviceConfig = require('./config/serviceConfig.json');
var dataIndexConfig = require('./config/dataIndexConfig.json');
var indicesConfig = require('./config/indicesConfig.json');
var config = require('./config/config');

var dataService = require('./DataService');

var logPath = './logs';

var counters = {};

var duplicateIds = [];
var uniqueIds = new Set();

function getListOfDir(dirFullPath) {
    return fs.readdirSync(dirFullPath);
}

function startLoadingData(sourcePath, loadOptions, tenant, flush) {

    var selectedFolders = getSelectedFolderNames(loadOptions);
    if (sourcePath && selectedFolders && selectedFolders.length) {

        var timestamp = Date.now();

        if (!fs.existsSync(logPath)) {
            fs.mkdirSync(logPath);
        }

        var tenantLogDir = logPath + '/' + tenant;
        if (!fs.existsSync(tenantLogDir)) {
            fs.mkdirSync(tenantLogDir);
        }

        deleteAndCreateIndices(tenant, loadOptions, flush).then(function (results) {
            
            console.log("\nStarted loading data from : " + sourcePath + " for tenant : " + tenant);
            
            var delayBetweenModelObjects = config.toolConfig.delayBetweenModelObjects;

            if (checkIndicesStatus(results)) {
                selectedFolders.forEach(function (selectedFolder) {
                    sleep(delayBetweenModelObjects);
                    if (selectedFolder) {
                        var tenantDataLogDir = tenantLogDir + '/' + timestamp ;

                        if (!fs.existsSync(tenantDataLogDir)) {
                            fs.mkdirSync(tenantDataLogDir);
                        }

                        logPath = tenantDataLogDir + '/' + selectedFolder;
                        fs.mkdirSync(logPath);
                        var dir = sourcePath + selectedFolder + "/";       
                        var files = getListOfDir(dir);

                        console.log("\n----------------------------- Logs for " + selectedFolder + " -----------------------------------\n");
                        if (files && files.length > 0) {
                            files.forEach(function (file) {
                                var load = true;
                                if (loadOptions.fileNamesToRun && loadOptions.fileNamesToRun.length > 0) {
                                    if (loadOptions.fileNamesToRun.indexOf(file) < 0) {
                                        load = false;
                                    }
                                }

                                if (loadOptions.fileNamesToExclude && loadOptions.fileNamesToExclude.length > 0) {
                                    if (loadOptions.fileNamesToExclude.indexOf(file) >= 0) {
                                        load = false;
                                    }
                                }

                                if (load && file != ".DS_Store" && file != "tenantserviceconfig_template.json") {
                                    console.log("reading file: " + file);
                                    var fileData = fs.readFileSync(dir + file);
                                    var fileDataAsString = fileData.toString();
                                    
                                    fileDataAsString = applyTemplateVariables(fileDataAsString, selectedFolder, config.toolConfig);

                                    if(fileDataAsString) {
                                        var loaded = loadData(tenant, file, JSON.parse(fileDataAsString));
                                    }
                                }
                            }, this);
                        } else { }

                        if (counters) {
                            console.log('Total RDF requests generated: ', JSON.stringify(counters, null, 3));                            
                            console.log("Unique IDs : " +uniqueIds.size);
                            console.log("Duplicate IDs : " +duplicateIds.length);
                            duplicateIds.sort();
                            for (var i=0; i<duplicateIds.length;i++)
                            {
                                console.log(duplicateIds[i]);
                            }
                        }
                    }
                }, this);
            } else {
                console.log("Error in deleting and creating indices. logs:" + JSON.stringify(indicesResults));
            }
        }, this);
    }
}

async function loadData(tenant, fileName, fileData) {
    var loaded = false;

    if (fileData) {
        console.log("loading file: " + fileName);

        var serviceName;
        var data;
        var dataIndex;
        if (fileData.metaInfo) {
            if (fileData.metaInfo.dataIndex) {
                dataIndex = fileData.metaInfo.dataIndex;
                serviceName = getServiceName(dataIndex);
            } else {
                console.error(fileName + ": file doesn't contains data index in meta info.");
            }

            if (fileData.metaInfo.collectionName) {
                data = fileData[fileData.metaInfo.collectionName];
            } else {
                console.error(fileName + ": file doesn't contains data index in meta info.");
            }
        } else {
            console.error(fileName + ": file doesn't contains meta info.");
        }

        if (serviceName && data) {                        

            for (var i=0; i<data.length; i++)
            {                                
                if(!uniqueIds.has(data[i].id))
                {
                    uniqueIds.add(data[i].id);
                }
                else
                {
                    duplicateIds.push(data[i].id);
                }
            }

            loaded = await sendDataToService(fileName, dataIndex, serviceName, tenant, data);

            if (loaded) {
                console.log(fileName + " loaded successfully.\n");
            } else {
                console.log(fileName + " has issues. Please check logs.\n");
            }
        }
    }

    return await loaded;
}

function applyTemplateVariables(fileDataAsString, selectedFolder, toolConfig) {
    if (!toolConfig.templateVariables) {
        return fileDataAsString;
    }

    var option = selectedFolder.replace(/[0-9\-]/g, '');

    var optionSpecificVariables = toolConfig.templateVariables[option];

    if (!optionSpecificVariables) {
        return fileDataAsString;
    }
    
    var templateVariables = optionSpecificVariables;

    if (!templateVariables) {
        return fileDataAsString;
    }

    //console.log('templateVariables ', JSON.stringify(templateVariables));

    var variableNames = Object.keys(templateVariables);
    for(var variableName of variableNames) {
        var pattern = "{{" + variableName + "}}";
        var replaceValue = templateVariables[variableName];
        fileDataAsString = fileDataAsString.replace(pattern, replaceValue);
    }

    return fileDataAsString;
}

async function sendDataToService(fileName, dataIndex, serviceName, tenant, data) {
    var serviceUrl;
    var dataIndexInfo;

    var logFileName = logPath + '/' + fileName + '.log';

    //console.log(logFileName);

    if (counters[dataIndex] === undefined) {
        //console.log('counters are undefined for data index', dataIndex);
        counters[dataIndex] = 0;
    }

    //truncateFile(logFileName);

    //console.log(logFileName);
    var serConfig = serviceConfig.services[serviceName + "/create"];

    if (serConfig) {
        serviceUrl = serConfig.url;
    } else {

    }
    if (dataIndexConfig) {
        dataIndexInfo = dataIndexConfig[dataIndex];
    }
    else {
    }

    var delay = config.toolConfig.delay;
    //console.log(delay);

    if (serviceUrl && dataIndexInfo) {
        data.forEach(async function (dataObj) {
            var res = {};
            var requestObj = {
                'includeRequest': false,
                'dataIndex': dataIndex
            };

            requestObj[dataIndexInfo.name] = dataObj;

            sleep(delay); // sleep for 100 ms

            if (counters[dataIndex] !== undefined) {
                counters[dataIndex] = counters[dataIndex] + 1;
            }

            //console.log('req ', JSON.stringify(requestObj, null, 2));

            res = await dataService.sendDataRequest(tenant, serviceUrl, requestObj);

            if (res) {
                var response = res[dataIndexInfo.responseObjectName];               

                if (response) {
                    writeLog(logFileName, response.status, res);
                }
                else {
                    writeLog(logFileName, 'error', res);
                }
            }

        }, this);
        return await true;
    } else {
        console.error("service URL or data index info is not available.");
        return await false;
    }
}

async function deleteAndCreateIndices(tenantId, selectedFolder, flush) {

    var results = [];
    var promise;
    
    if(flush == "y" || flush == "Y") {
        console.log("deleting indices...");

        promise = deleteIndices(tenantId, selectedFolder).then(function (result) {
            results = result;
            
            if (checkIndicesStatus(result)) {
                sleep(3000);
                results = createIndices(tenantId, selectedFolder);
            } else {
                console.log("error while deleting indices" + JSON.stringify(results));
            }
        });

        await Promise.resolve(promise);
    }

    return results;
}

async function deleteIndices(tenantId, selectedFolder) {

    var results = [];
    var promises = [];
    if (tenantId && selectedFolder) {
        var indices = getIndices(selectedFolder);
        if (indices && indices.length) {
            indices.forEach(function (index) {
                var req = dataService.deleteIndicesRequest(tenantId, index).then(function (result) {
                    console.log(result);
                    results.push(result);
                });
                promises.push(req);
            }, this);
        }
    }

    await Promise.all(promises);
    return results;
}

async function createIndices(tenantId, selectedFolder) {

    var results = [];
    var promises = [];
    if (tenantId && selectedFolder && indicesConfig) {
        var indices = getIndices(selectedFolder);
        if (indices && indices.length) {
            indices.forEach(function (index) {
                var indexConfig = indicesConfig[index];
                var req = dataService.createIndicesRequest(tenantId, index, indexConfig).then(function (result) {
                    console.log(result);
                    results.push(result);
                });
                promises.push(req);
            }, this);
        }
    }

    await Promise.all(promises);
    return results;
}

function getServiceName(dataIndex) {
    if (!dataIndex) {
        return "NA";
    };

    if (dataIndex == "entityData") {
        return "entityservice";
    } else if (dataIndex == "entityGovernData") {
        return "entitygovernservice";
    } else if (dataIndex == "entityModel") {
        return "entitymodelservice";
    } else if (dataIndex == "config") {
        return "configurationservice";
    } else if (dataIndex == "binaryObject") {
        return "binaryobjectservice";
    } else if (dataIndex == "dataObject") {
        return "rsconnectservice";
    }
     else {
        return "entityservice";
    }
}

function getSelectedFolderNames(loadOptions) {
    var foldersToRun = loadOptions.foldersToRun;
    var selectedFolders = [];

    for(var folderToRun of foldersToRun) {
        switch (folderToRun.toLowerCase()) {
            case "all":
                selectedFolders.push(
                    "00-seeddata", "10-foundation", "11-authorizationmodel", "12-governancemodel", "13-entitymodels", "20-contextualmodel", "21-contexts",
                    "30-referencemodel", "31-referencedata", "50-uiconfig", "51-matchconfig", "61-rsconnectprofiles", "80-rsdamprofiles", "101-healthcheck");
                break;
            case "allmodels":
                selectedFolders.push(
                    "00-seeddata", "10-foundation", "11-authorizationmodel", "12-governancemodel", "13-entitymodels", "20-contexts", "21-contextualmodel",
                    "30-referencemodel");
                break;
            case "contextsandmodel":
                selectedFolders.push(
                    "20-contextualmodel", "21-contexts");
                break;
            case "referencedataandmodel":
                selectedFolders.push(
                    "30-referencemodel", "31-referencedata");
                break;
            case "seeddata":
                selectedFolders.push("00-seeddata");
                break;
            case "foundation":
                selectedFolders.push("10-foundation");
                break;
            case "authorizationmodel":
                selectedFolders.push("11-authorizationmodel");
                break;
            case "governancemodel":
                selectedFolders.push("12-governancemodel");
                break;
            case "entitymodels":
                selectedFolders.push("13-entitymodels");
                break;
            case "contextualmodel":
                selectedFolders.push("20-contextualmodel");
                break;
            case "contexts":
                selectedFolders.push("21-contexts");
                break;
            case "referencemodel":
                selectedFolders.push("30-referencemodel");
                break;
            case "referencedata":
                selectedFolders.push("31-referencedata");
                break;
            case "referencedatawithrelationships":
                selectedFolders.push("32-referencedatawithrelationships");
                break;
            case "fullreferencedata":
                selectedFolders.push("31-referencedata", "32-referencedatawithreltionships");
                break;
            case "data":
                selectedFolders.push("40-data");
                break;
            case "uiconfig":
                selectedFolders.push("50-uiconfig");
                break;
            case "matchconfig":
                selectedFolders.push("51-matchconfig");
                break;
            case "rsconnectprofiles":
                selectedFolders.push("61-rsconnectprofiles");
                break;
            case "rsdamprofiles":
                selectedFolders.push("80-rsdamprofiles");
                break;
            case "healthcheck":
                selectedFolders.push("101-healthcheck");
                break;
        }
    }
    
    return selectedFolders;
}

function getIndices(selectedFolder) {

    var indices = [];
    switch (selectedFolder.toLowerCase()) {
        case "all":
            indices.push("entitywriteindex", "entitymanagemodelwriteindex", "configurationwriteindex");
            break;
        case "model":
            indices.push("entitymanagemodelwriteindex");
            break;
        case "data":
            indices.push("entitywriteindex");
            break;
        case "config":
            indices.push("configurationwriteindex");
            break;
    }

    return indices;
}

function checkIndicesStatus(results, flush) {

    if(!flush) {
        return true;
    }

    var status = false;

    if (results && results.length) {
        results.forEach(function (result) {
            if (result && result.acknowledged) {
                if (!result.acknowledged) {
                    return false;
                }
            } else {
                return false;
            }
        }, this);

        return true;
    }

    return false;
}

function writeLog(logFile, status, res) {
    var timestamp = Date().toLocaleString();
    var message = timestamp + ":" + status.toUpperCase() + ":" + JSON.stringify(res) + "\r\n";
    //console.log(message);
    fs.appendFileSync(logFile, message);
}

function truncateFile(fileName) {
    if (fs.existsSync(fileName)) {
        fs.truncateSync(fileName, 0, function () { console.log('done') });
    }
}


module.exports = {
    getListOfDir: getListOfDir,
    startLoadingData: startLoadingData
}