// Dependencies
const MDNSBrowser = require('./lib/mdns-browser');
const MQTTClient = require('./lib/mqtt-client');

let mdnsBrowser = new MDNSBrowser();
let mqttClients = [];

mdnsBrowser.on('hub_up', addresses => {
    for (let address of addresses) {
        mqttClients.push(new MQTTClient(address));
    }
});

mdnsBrowser.on('hub_down', addresses => {
    for (let address of addresses) {
        for (let i in mqttClients) {
            if (mqttClients[i].connectionInfo.host === address) {
                mqttClients[i].close();
                mqttClients.splice(i, 0);
                break;
            }
        }
    }
});