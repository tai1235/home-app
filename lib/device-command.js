const DeviceCommand = {
    createSyncRequest: () => {
        return JSON.stringify({
            type: 'devices',
            action: 'sync',
            data: {}
        });
    },

    createSearchRequest: (act) => {
        act = typeof act === 'number' &&
            [0, 1].indexOf(act) > -1 ?
            act : -1;

        if (act !== -1) {
            return JSON.stringify({
                type: 'devices',
                action: 'search',
                data: { act }
            });
        }
    },

    createControlRequest: (eui64, endpoint, value) => {
        eui64 = typeof eui64 === 'string' &&
            eui64.trim().length > 0 ?
            eui64 : false;
        endpoint = typeof endpoint === 'number' &&
            endpoint > 0 ?
            endpoint : false;
        value = typeof value === 'object' ?
            value : false;

        if (eui64 && endpoint && value) {
            return JSON.stringify({
                type: 'devices',
                action: 'control',
                data: {
                    devices: [{ eui64, endpoint, value }]
                }
            });
        }
    },
};

module.exports = DeviceCommand;