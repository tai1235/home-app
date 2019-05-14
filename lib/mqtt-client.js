const mqtt = require('mqtt');
const EventEmitter = require('events');
const debug = require('debug')('MQTTClient');
const DeviceCommand = require('./device-command');
const helpers = require('./helpers');

class MQTTClient extends EventEmitter {
    constructor(host, callback) {
        super();
        this.connectionInfo = {
            host: host,
            port: 8883,
            username: 'doantotnghiep',
            password: 'datn1234',
            protocol: 'mqtt'
        };

        this.connected = false;

        this.hubTopics = {
            request: 'user/' + this.connectionInfo.username + '/hub/request/',
            response: 'user/' + this.connectionInfo.username + '/hub/response/',
            status: 'user/' + this.connectionInfo.username + '/hub/status/'
        };
        this.appTopics = {
            request: 'user/' + this.connectionInfo.username + '/app/request/',
            response: 'user/' + this.connectionInfo.username + '/app/response/',
            control: 'user/' + this.connectionInfo.username + '/app/control/'
        };

        this.client = mqtt.connect(this.connectionInfo);

        this.client.on('connect', () => {
            this.connected = true;
            debug('Connected to hub broker');
            this.client.subscribe([
                this.hubTopics.request + '+',
                this.hubTopics.status + '+'
            ]);
            let request = DeviceCommand.createSyncRequest();
            this._sendRequest(helpers.createRandomString(10), request);
            callback();
        });

        this.client.on('message', (topic, message) => {
            let topicLevel = topic.split('/');
            if (topicLevel[3] === 'response') {
                this.client.unsubscribe(topic);
            }
            debug('ON_' + topicLevel[3].toUpperCase() + '[' + topicLevel[4] + ']: ' + message);
            this.emit('message-received', topicLevel[3], topicLevel[4], JSON.parse(message.toString()));
        });
    }

    _sendRequest(id, message) {
        this.client.subscribe(this.hubTopics.response + id, () => {
            this.client.publish(this.appTopics.request + id, message);
        });
    }

    sendDevicesSearch(act) {
        let request = DeviceCommand.createSearchRequest(act);
        if (request !== undefined) {
            let id = helpers.createRandomString(10);
            console.log('REQUEST [' + id + ']: ' + request);
            this._sendRequest(id, request);
        } else {
            debug('Invalid input params');
        }
    }

    sendDevicesControl(eui64, endpoint, value) {
        let request = DeviceCommand.createControlRequest(eui64, endpoint, value);
        if (request !== undefined) {
            let id = helpers.createRandomString(10);
            console.log('REQUEST [' + id + ']: ' + request);
            this._sendRequest(id, request);
        } else {
            debug('Invalid input params');
        }
    }

    sendDevicesSync() {
        let request = DeviceCommand.createSyncRequest();
        if (request !== undefined) {
            let id = helpers.createRandomString(10);
            console.log('REQUEST [' + id + ']: ' + request);
            this._sendRequest(id, request);
        } else {
            debug('Invalid input params');
        }
    }

    close() {
        this.connected = false;
        this.client.end();
    }
}

module.exports = MQTTClient;