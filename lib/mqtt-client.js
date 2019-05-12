const mqtt = require('mqtt');
const EventEmitter = require('events');
const debug = require('debug')('MQTTClient');

class MQTTClient extends EventEmitter {
    constructor(host) {
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
        });

        this.process();
    }

    process() {
        this.client.on('message', (topic, message) => {
            let topicLevel = topic.split('/');
            debug('ON-' + topicLevel[3].toUpperCase() + '[' + topicLevel[4] + ']: ' + message);
            this.emit('message-received', topicLevel[3], topicLevel[4], message);
        });
    }

    close() {
        this.connected = false;
        this.client.end();
    }
}

module.exports = MQTTClient;