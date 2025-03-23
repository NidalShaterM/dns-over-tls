const tls = require('tls');
const fs = require('fs');
const path = require('path');
const { DNS_TLS_SERVER, DNS_TLS_PORT } = require('../config/config');
const logger = require('./logger');

/**
   * This function will 
   * - Receive DNS requests
   * - Handle TLS connection with the DNS-over-TLS service
   * - Return the response to the dns-handler using the callback
   *
   * @param {Object} dnsQuery - input
   * @param {Function} callback - used to return the response to the dns-handler
   */

const sendQuery = (dnsQuery, callback) => {
  try {
    /*
     Here we are using self-signed certificates
     In production we will use certificates files from certbot or other services
    */
    let pwd = path.dirname(require.main.filename);
    const context = tls.createSecureContext({
      servername: DNS_TLS_SERVER,
      key: fs.readFileSync(pwd + '/certs/key.pem'),
      cert: fs.readFileSync(pwd + '/certs/cert.pem')
    });
    const options = {
      host: DNS_TLS_SERVER,
      port: DNS_TLS_PORT,
      secureContext: context
    };

    const tlsSock = tls.connect(options, () => {
      const preLength = Buffer.from([0x00, dnsQuery.length]);
      const query = Buffer.concat([preLength, dnsQuery]);
      tlsSock.write(query);
    });

    tlsSock.on('data', data => {
      tlsSock.end();
      callback(data);
    });

  } catch (error) {
    logger.error(error);
  }


};

module.exports = {
  sendQuery
};
