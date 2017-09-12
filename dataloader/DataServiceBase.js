var request = require('request-promise-native');

async function sendRequest(options) {

    //console.log('RDF req ', JSON.stringify(options));

    //var reqPromise = "request sent";

    var reqPromise = request(options)
        .catch(function (errors) {
            var err = {
                'status': 'error',
                'msg': 'RDF request failed due to technical reasons',
                'reason': errors
            };

            //console.error('EXCEPTION:', JSON.stringify(err, null, 2));
            return err;
        })
        .catch(function (err) {
            //console.error(err);
        });

    return await reqPromise;
}

module.exports = {
    sendRequest: sendRequest
}