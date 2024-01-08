const Http = require('http');
const Https = require('https');
const tls = require('tls');
const acme = require('@cocreate/acme')
const fs = require('fs');

let server = {
    acme: new acme(),
    http: Http.createServer(),
    https: Https.createServer({ SNICallback: sniCallback })
};

function loadCertificates(domain) {
    try {
        return {
            key: fs.readFileSync(`/etc/certificates/${domain}/private-key.pem`),
            cert: fs.readFileSync(`/etc/certificates/${domain}/fullchain.pem`),
        };
    } catch (error) {
        console.error("Error loading certificates for domain:", domain);
        throw error;  // Or handle it by returning default certificates
    }
}

async function sniCallback(domain, cb) {
    try {
        console.log('sni')
        await server.acme.checkCertificate(domain);

        const sslContext = tls.createSecureContext(loadCertificates(domain));
        cb(null, sslContext);

    } catch (error) {
        console.error("Error in SNI callback for domain:", domain, error);
        cb(error);  // handle error or use default context
    }
}

module.exports = server;
