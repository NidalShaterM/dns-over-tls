// This is a simple file we used to store our config
// In production we should store configs in K8s configmap, AWS app config or other configuration centralizing management tool.

const DNS_TLS_SERVER = '1.1.1.1';
const DNS_TLS_PORT = '853';

const DNS_PORT = 53;
const HOST = '0.0.0.0';

module.exports = {
  DNS_TLS_SERVER,
  DNS_TLS_PORT,
  DNS_PORT,
  HOST
};