// Update following to configure tool
// 1. webUrl: provide url of the RDF API server to connect to for loading models and data
// 2. templateVariables: provide template variables and their values for each option. 
//      All template variable should be present in file content with pattern {{TEMPLATE_VARIABLE}}. Example: {{ENVNAME}}
//      Here is sample for "templateVariables"
//      "templateVariables": {
//          "rsconnectprofiles": {
//              "ENVNAME": "qa2-us-east-1",
//              "AWSREGIONNAME": "us-east-1",
//              "AWSCREDENTIALSTYPE": "AMAZON_EC2_INSTANCE_PROFILE"
//          },
//          "config": {
//              "TENANT_WEBSITE_URL": "www.jcpenney.com"
//          },
//          "entitymodels": {
//              "BLAH_KEY": "blah-value"
//          },
//          "governancemodel": {
//              "BLAH_KEY": "blah-value"
//          }
//      }
// 3. delay and delayBetweenModelObjects to add delay beween two RDF calls

var toolConfig = {
	"webUrl": "http://manage.qa-eu1.riversand-dataplatform.com:8085",
	"templateVariables": {
		"rsconnectprofiles": {
			"ENVNAME": "qa-eu-central-1",
			"AWSREGIONNAME": "eu-central-1",
			"AWSCREDENTIALSTYPE": "AMAZON_EC2_INSTANCE_PROFILE",
			"TENANT": "bsdf"
		}
	},
	"elasticUrl": "http://192.168.0.85:9200",
	"delay": 10,
	"delayBetweenModelObjects": 1000
}

// We have multiple options to select as shown below
// 1. option = all - to load kind of models, data and configs
// 2. option = entitymodels - to load entitymodels only
// 3. option = allmodels - to load all models including entitymodels, governance model and context model. This will not load reference data
// 4. option = contextsandmodel - to load only contexts and contextual model
// 5. option = fullreferencedata - to load referencedata and referencedatawithrelationships

var quiteLoadConfig = {
	"enabled": true,
<<<<<<< Updated upstream
	"sourcePath": "C:/a/git/Beiersdorf/seeddata-bsdf/",
=======
	"sourcePath": "/Users/nikhilbhatia/github/Beiersdorf/seeddata-bsdf/",
>>>>>>> Stashed changes
	"tenantId": "bsdf",
	"loadOptions": {
		"foldersToRun": ["foundation"],
		"fileNamesToRun": [
			
		],
		"fileNamesToExclude": [
		]
	}
}

module.exports = {
	toolConfig: toolConfig,
	quiteLoadConfig: quiteLoadConfig
}