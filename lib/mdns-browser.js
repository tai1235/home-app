const mdns = require('mdns');
const EventEmitter = require('events');
const debug = require('debug')('MDNSBrowser');

class MDNSBrowser extends EventEmitter {
    constructor() {
        super();
        this.browser = mdns.createBrowser(mdns.tcp('hap'), {
            resolverSequence: [
                mdns.rst.DNSServiceResolve(),
                mdns.rst.getaddrinfo({families: [4] })
            ]
        });

        this.browser.on('serviceUp', service => {
            debug('service up: ', service);
            if (service.name.includes('Home Hub')) {
                console.log('Home Hub service up at address', service.addresses);
                this.emit('hub_up', service.addresses);
            }
        });

        this.browser.on('serviceDown', service => {
            debug('service down: ', service);
            if (service.name.includes('Home Hub')) {
                console.warn('Home Hub service down at address', service.addresses);
                this.emit('hub_down', service.addresses);
            }
        });

        this.browser.on('error', e => {
            console.error(e.message);
        });

        this.browser.start();
    }
}

module.exports = MDNSBrowser;