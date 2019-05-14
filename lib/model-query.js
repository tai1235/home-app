let Devices = require('../model/devices');
let path = require('path');
let fs = require('fs');

const devicesPath = path.join(__dirname, '../model/devices.json');

const EndpointType = {
    '0x0100': 'Switch',
    '0x0101': 'Light',
    '0x000A': 'Contact Sensor',
    '0x0403': 'Motion Sensor',
    '0x0106': 'Light Sensor',
    '0x0302': 'Temperature Sensor',
    '0x0301': 'Humidity Sensor',
    '0x0017': 'Battery',
    '0x0104': 'Smart Button',
};

const ModelQuery = {};

ModelQuery.syncDevice = devices => {
    let fd = fs.openSync(devicesPath, 'w');
    if (fd) {
        fs.writeFileSync(fd, JSON.stringify(devices));
        return true;
    } else {
        return false;
    }
};

ModelQuery.getWritableDevices = () => {
    let writableDevice = [];
    for (let device of Devices) {
        if (['0x0100', '0x0101'].indexOf(device.type) > -1) {
            writableDevice.push(JSON.stringify({
                eui64: device.eui64,
                endpoint: device.endpoint,
                type: EndpointType[device.type]
            }));
        }
    }
    return writableDevice;
};

ModelQuery.getDeviceInfo = (eui64, endpoint) => {
    for (let device of Devices) {
        if (device.eui64 === eui64 && device.endpoint === endpoint) {
            return JSON.stringify(device);
        }
    }
};

ModelQuery.getAllDevices = () => {
    let devices = [];
    for (let device of Devices) {
        devices.push(JSON.stringify({
            eui64: device.eui64,
            endpoint: device.endpoint,
            type: EndpointType[device.type]
        }));
    }
    return devices;
};

module.exports = ModelQuery;