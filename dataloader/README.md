# Riversand Technologies -  Data loader Tool

# Setup

## Prerequisites

Below steps are needed only for the first time when you setup data loader tool

1. Install node.js server from https://nodejs.org/en/download/
If installing on MAC OS open Terminal and run 
        `echo $PATH`
        Copy the Path returned
        Set the updated path using the command `PATH=<<old copied path>>:/usr/local/bin/node:/usr/local/bin/npm`

## Install local dependencies

This MUST should be done within a command window opened at the `dataplatform-sampledata/dataloader` folder path

1. Install local npm dependencies
    
    `npm install`

## Steps to load data:

1. Goto `config.js` inside config/ folder.

    ![Tool config image](images/tool-config.jpg?raw=true)

    set config as below,
    
    ```javascript
    var toolConfig = {
        "webUrl": "http://0.0.0.0:8085", // Netty API server's url
        "elasticUrl": "http://0.0.0.0:9200", // Elastic server's url
        "delay": 100,
        "delayBetweenModelObjects": 10000
    }
    ```

2. There are two ways to run data loader tool.

    1. Run tool in terminal with following command,
        `node index.js`

        on startup of tool it will show two things,
          - Server details where it will start loading data as per toolConfig.
          - List of folders where data are present to be loaded in a proper folder structure.

            ![Tool setup](images/step-1.jpg?raw=true)

        Follow up all the question like,

            1. Can you provide me source path:
                - Provide the exact source path to load data from that folder. Example: `c:/dataplatform-jcpenney/`
            2. Good, next question, whats' the tenant Id:
                - Provide tenant id for which tenant data should be loaded.
                - After providing tenant id it will show list of options to load, like
                    ![Tool setup steps](images/step-2.jpg?raw=true)
            3. What option you like:
                - Provide any one option from listed options.
                - After this, tool will start loading data.

    2. Set all the necessary parameters to load data as below,
        Go to `config.js` and update `quiteLoadConfig` inside it,

        ![Quite load config setup](images/quite-load-config.jpg?raw=true)

        `quiteLoadConfig` contains all parameters which are required to load data.
        ```javascript
        var quiteLoadConfig = {
            "enabled": true, // This has to be set has true
            "sourcePath": "/Users/jariwalav/rs/customer-seed-jcpenney/", // Provide the source path from where data has to be loaded
            "tenantId": "jcp", // Provide tenant id for which tenant data should be loaded
            "option": "foundation", // Provide an option to load data as per below screen shot
        }
        ```

        options

        ![Data load options](images/data-load-options.jpg?raw=true "options")

        After setting `quiteLoadConfig` run below command,
            `node index.js`

        Tool will start loading data as per config settings.

    
Note: for logs got to `logs` folder

- Inside log folder there wll be tenant specific folders. 
    for ex. if user has loaded data for `t1` tenant it will have t1 folder inside and each tenant folder contains log details inside timestamp based folders.
