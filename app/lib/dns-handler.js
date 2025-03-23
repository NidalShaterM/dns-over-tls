const dnsPacket = require('dns-packet');
const { sendQuery } = require('./query-sender');
const logger = require('./logger');


/**
   * This function will 
   * - Handle TCP/UDP requests
   * - Call sendQuery function (to send it to DNS over tls service)
   * - Return the resposne to the client using the callback
   *
   * @param {Object} data - input
   * @param {String} protocol - TCP or UDP
   * @param {Function} callback - used to return the response to client
   */

const handleRequest = (data,protocol, callback) => {
  // For TCP data, we sliced off the first two bytes that represent the length of the data in the DNS message, because we will add them later in sendQuery
  // When using TCP as the transport protocol for DNS, the length of the DNS message is included in the first two bytes as a 16-bit value.
  if (protocol=='TCP') data = data.slice(2);
   // Log the sent Request
  logger.info(dnsPacket.decode(data));
  sendQuery(data, response => {
    const rcode = response.slice(2, 4).toString('hex');
    if (parseInt(rcode, 16) === 1) {
      logger.err(new Error('Not a DNS query'));
    } else {
      // For UDP response, we sliced off the first two bytes that represent the length of the data in the DNS message. since UDP is not expecting them on the client side.
      let result = (protocol=='UDP') ? response.slice(2) : response;
      callback(result);
      // Log the Received Response
      logger.info(dnsPacket.decode(response.slice(2)));
    }
  });
};

module.exports = {
  handleRequest
};
