const Https = require('https');
const Http = require('http');
const fs = require('fs');
const tls = require('tls');

// Load certificates or handle them dynamically via SNI
function loadCertificates(domain) {
    try {
        return {
            key: fs.readFileSync(`certificates/${domain}/private.key`),
            cert: fs.readFileSync(`certificates/${domain}/certificate.crt`),
        };
    } catch (error) {
        console.error("Error loading certificates for domain:", domain);
        throw error; // Or handle it by returning default certificates
    }
}

function sniCallback(domain, cb) {
    try {
        const sslContext = tls.createSecureContext(loadCertificates(domain));
        cb(null, sslContext);
    } catch (error) {
        console.error("Error in SNI callback for domain:", domain, error);
        cb(error); // handle error or use default context
    }
}

// Create HTTPS server
const https = Https.createServer({ SNICallback: sniCallback });

// Create HTTP server
const http = Http.createServer();

module.exports = { https, http };

