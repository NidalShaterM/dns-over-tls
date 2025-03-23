const dgram = require('dgram');
const net = require('net');
const { DNS_PORT, HOST } = require('./config/config');
const { handleRequest } = require('./lib/dns-handler');
require("./startup/logging")();

/**
   * Creat a TCP Socket on localhoist and port 53
   * - Handle TCP requests
   * - Call handlRequest function
   * - Define a callback to return the resposne to the client
*/
const TCPServer = net.createServer(socket => {
    socket.on('data', data => {
        handleRequest(data, 'TCP', (result) => {
            socket.write(result);
            socket.end();
        });
    });
});
TCPServer.listen(DNS_PORT, HOST);

/**
   * Creat a UDP Socket on localhoist and port 53
   * - Handle UDP requests
   * - Call handlRequest function
   * - Define a callback to return the resposne to the client
*/
const UDPServer = dgram.createSocket('udp4');
UDPServer.on('message', (data, rinfo) => {
    const clientAddress = rinfo.address;
    const clientPort = rinfo.port;
    handleRequest(data, 'UDP', (udpResult) => {
        UDPServer.send(udpResult, 0, udpResult.length, clientPort, clientAddress);
    });
});
UDPServer.bind(DNS_PORT, HOST);
