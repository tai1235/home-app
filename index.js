// Dependencies
const MDNSBrowser = require('./lib/mdns-browser');
const MQTTClient = require('./lib/mqtt-client');
const ModelQuery = require('./lib/model-query');
const inquirer = require('inquirer');

let mdnsBrowser = new MDNSBrowser();
let mqttClient;

mainLoop = () => {
    inquirer
        .prompt([
            {
                type: 'list',
                name: 'command',
                message: 'Choose your action ..',
                choices: [
                    'search device',
                    'control device',
                    'get device info',
                    'sync device',
                    'exit'
                ]
            }
        ])
        .then(answer => {
            switch (answer.command) {
                case 'search device': {
                    inquirer
                        .prompt([{
                            type: 'list',
                            name: 'act',
                            message: 'Enter action ..',
                            choices: [ 'start', 'stop' ]
                        }])
                        .then(answer => {
                            if (mqttClient.connected) {
                                let act = answer.act === 'start' ? 1 : 0
                                mqttClient.sendDevicesSearch(parseInt(act));
                            }
                            console.log();
                            mainLoop();
                        })
                } break;
                case 'control device': {
                    inquirer
                        .prompt([
                            {
                                type: 'list',
                                name: 'device',
                                message: 'Choose device to control ..',
                                choices: [
                                    ...ModelQuery.getWritableDevices(),
                                    'exit'
                                ]
                            }
                        ])
                        .then(answer => {
                            if (answer.device === 'exit') {
                                console.log();
                                mainLoop();
                            } else {
                                let device = JSON.parse(answer.device);
                                if (device.type === 'Switch') {
                                    inquirer
                                        .prompt([
                                            {
                                                type: 'list',
                                                name: 'on',
                                                message: 'Choose state ..',
                                                choices: ['on', 'off']
                                            }
                                        ])
                                        .then(answer => {
                                            if (mqttClient.connected)
                                                mqttClient.sendDevicesControl(
                                                    device.eui64,
                                                    device.endpoint,
                                                    {on: answer.on === 'on'});
                                            console.log();
                                            mainLoop();
                                        })
                                } else if (device.type === 'Light') {
                                    inquirer
                                        .prompt([
                                            {
                                                type: 'list',
                                                name: 'on',
                                                message: 'Choose state ..',
                                                choices: ['on', 'off']
                                            }
                                        ])
                                        .then(answer => {
                                            if (answer.on === 'on') {
                                                inquirer
                                                    .prompt([
                                                        {
                                                            type: 'input',
                                                            name: 'brightness',
                                                            message: 'Choose brightness ..'
                                                        }
                                                    ])
                                                    .then(answer => {
                                                        if (mqttClient.connected)
                                                            mqttClient.sendDevicesControl(
                                                                device.eui64,
                                                                device.endpoint,
                                                                {
                                                                    on: true,
                                                                    brightness: parseInt(answer.brightness)
                                                                });
                                                        console.log();
                                                        mainLoop();
                                                    })
                                            } else {
                                                if (mqttClient.connected)
                                                    mqttClient.sendDevicesControl(
                                                        device.eui64,
                                                        device.endpoint,
                                                        {on: false});
                                                console.log();
                                                mainLoop();
                                            }
                                        })
                                }
                            }
                        })
                } break;
                case 'get device info': {
                    inquirer
                        .prompt([
                            {
                                type: 'list',
                                name: 'device',
                                message: 'Choose device ..',
                                choices: [
                                    ...ModelQuery.getAllDevices(),
                                    'exit'
                                ]
                            }
                        ])
                        .then(answer => {
                            if (answer.device === 'exit') {
                                console.log();
                                mainLoop();
                            } else {
                                let device = JSON.parse(answer.device);
                                console.log('RESULT: ' + ModelQuery.getDeviceInfo(device.eui64, device.endpoint));
                                console.log();
                                mainLoop();
                            }
                        });
                } break;
                case 'sync device': {
                    if (mqttClient.connected)
                        mqttClient.sendDevicesSync();
                    console.log();
                    mainLoop();
                } break;
                case 'exit': {
                    process.exit(0);
                } break;
                default: {
                    console.log();
                    mainLoop()
                }
            }
        });
};

mdnsBrowser.on('hub_up', addresses => {
    mqttClient = new MQTTClient(addresses[0], () => {
        mqttClient.on('message-received', (method, id, message) => {
            if (method === 'response') {
                if (message.data.statusCode === 0) {
                    let data = message.data.returnData;
                    if (message.type === 'devices' && message.action === 'sync') {
                        ModelQuery.syncDevice(data.devices);
                    }
                }
            } else if (method === 'status') {

            }
        });

        mainLoop()
    });
});

mdnsBrowser.on('hub_down', addresses => {
    for (let address of addresses) {
        if (mqttClient.connectionInfo.host === address && mqttClient.connected) {
            mqttClient.close();
        }
    }
});