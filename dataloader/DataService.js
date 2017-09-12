var dataServiceBase = require('./DataServiceBase');
var config = require('./config/config');

async function sendDataRequest(tenantId, serviceUrl, req) {

    var url = config.toolConfig.webUrl + '/' + tenantId + '/api' + serviceUrl;

    //console.log('req ', JSON.stringify(req));

    if(serviceUrl == "/rsConnectService/process"){
        url = url.replace("8085","9095");
    }

    if(req && req.configObject && req.configObject.type == "tenantserviceconfig") {
        //console.log('tenant config');
        url = config.toolConfig.webUrl + '/dataplatform/api/configurationservice/create';
    }

    var options = _prepareOptions(url, "POST", req);
    var result = await dataServiceBase.sendRequest(options);

    return await result;
}

async function createIndicesRequest(tenantId, index, indexConfig) {
    var url = config.toolConfig.elasticUrl + '/' + tenantId + index;

    var options = _prepareOptions(url, "PUT", indexConfig);
    var result = await dataServiceBase.sendRequest(options);
    console.log(index + "create");
    console.log(JSON.stringify(result));
    return await result;
}

async function deleteIndicesRequest(tenantId, index) {
    var url = config.toolConfig.elasticUrl + '/' + tenantId + index;
    var options = _prepareOptions(url, "DELETE", "");
    var result = await dataServiceBase.sendRequest(options);
    console.log(index + "delete");
    console.log(JSON.stringify(result));    
    return result;
}

function _prepareOptions(url, method, req) {
    var options = {
        url: url,
        method: method,
        headers: {
            "Cache-Control": "no-cache",
            "version": 8.1,
            "content-type": "application/json",
            "connection": "close",
            "x-rdp-userid": 'system',
            "x-rdp-username": 'system',
            "x-rdp-useremail": 'admin@jcp.com',
            "x-rdp-userroles": '["admin"]',
            "x-rdp-ownershipdata": '',
            "x-rdp-clientid": 'copClient'
        },
        body: req,
        json: true,
        simple: false,
        timeout: 5000
    };

    return options;
}


module.exports = {
    sendDataRequest: sendDataRequest,
    createIndicesRequest: createIndicesRequest,
    deleteIndicesRequest: deleteIndicesRequest
}