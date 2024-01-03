const Https = require('https');
const Http = require('http');
const fs = require('fs');
const tls = require('tls');
const acme = require('@cocreate/acme')

let server = {
    acme: new acme(),  // Initially an empty object or some placeholder functionality

    loadCertificates(domain) {
        try {
            return {
                key: fs.readFileSync(`/etc/certificates/${domain}/private-key.pem`),
                cert: fs.readFileSync(`/etc/certificates/${domain}/fullchain.pem`),
            };
        } catch (error) {
            console.error("Error loading certificates for domain:", domain);
            throw error;  // Or handle it by returning default certificates
        }
    },

    async sniCallback(domain, cb) {
        try {
            console.log('sni')
            await server.acme.checkCertificate(domain);  // Referencing `this.acme` 

            const sslContext = tls.createSecureContext(server.loadCertificates(domain));
            cb(null, sslContext);
        } catch (error) {
            console.error("Error in SNI callback for domain:", domain, error);
            cb(error);  // handle error or use default context
        }
    },

    https: null,  // Will be set after defining `sniCallback`
    http: Http.createServer()
};

// Creating the HTTPS server with the SNI callback
server.https = Https.createServer({ SNICallback: server.sniCallback });

module.exports = server;
