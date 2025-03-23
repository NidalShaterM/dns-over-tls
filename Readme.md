## Introduction
DNS protocol has been used for decades to translate domain names into IP addresses. However, by default, DNS queries are sent over plain text connections, making them vulnerable to eavesdropping and spoofing. This can lead to serious privacy and security concerns, especially when it comes to sensitive data such as online banking, e-commerce, and other sensitive information. To address these issues, the industry has developed a secure alternative, called DNS-over-TLS, which encrypts all requests between the client and the server.

In this code, we present a simple and effective solution to secure our DNS queries by implementing a DNS-over-TLS proxy. This proxy listens for incoming requests over both TCP and UDP, sends the query to a Cloudflare DNS server using self-signed certificate, and returns the response to the requester. This proxy not only ensures the privacy and security of our DNS queries but also helps to bypass any DNS-based Internet filtering.

We have multiple DNS-over-TLS servers like Cloudflare, Quad9, Google DNS and others, all of them are using the tls port 853, In our system we are using the Cloudflare one but feel free to update DNS_TLS_SERVER in the `app/config/config.js` file to test other ones from [DNS over TLS](
https://dnsprivacy.org/public_resolvers/)

I have chosen to build the system using NodeJS because I'm most familiar with it, the fact that it has many packages so I will find ones for tls connection and network programming that I needed in this project and also its Asynchronous, Event-driven Model,  which makes it well-suited for building scalable, high-performance network applications.

## Project Structure

To make the code more readable and scalable we structure it like the following:
```
dns-over-tls
|-- app (contains source code)
    |-- index.js (entry point)
    |-- lib
        |-- dns-handler.js (handles DNS requests)
        |-- query-sender.js (sends DNS queries to remote server)
        |-- logger.js (handles project logging)
    |-- config
        |-- config.js (configurations such as host, port, DNS server)
    |-- startup
        |-- logging.js (startup logging process)
    |-- certs (hold self-signed certificates)
        |-- cert.pem (certificate file)
        |-- key.pem (key file)
|-- Dockerfile (to build project docker image)
|-- Readme.md
```

## Run the project

Update `/etc/resolv.conf` file to use the local DNS Service:

`nameserver 127.0.0.1`

Create docker image by using Dockerfile:

`docker build -t dns-over-tls .`

Run the container by using that docker image we created in the previous step:

`docker run --ip=127.0.0.1 -p 53:53/tcp -p 53:53/udp -d dns-over-tls`

Make sure that the service is running on both TCP and UDP:

`netstat -nlp | grep 53`

Test TCP and UDP requests using nslookup:
UDP: 

`nslookup  yahoo.com.`

TCP: 

`nslookup "-set vc" yahoo.com.` or `nslookup yahoo.com 127.0.0.1 -port=53`


## Production Security Concerns

### High Availability: 
It is expected from this service to be used by all services that need domain translation in our system, so it should be optimized to handle a large number of requests, so we need to run multiple instances of the services and add auto scaling.

### Logging and Monitoring:
we can receive some malicious dns requests or high load from one source which can be a sign of a DoS attack so we should implement logging and monitoring of the proxy to detect and respond to any security incidents or attacks.

### External dependency: 
Although Cloudflare is a reliable service, but if anything happened with it, it will be a single point of failure for our service, so we should update our system to use other DNS-over-TLS servers like Quad9, Google DNS
or others in case of failure.


### MitM attack:
A man-in-the-middle (MitM) attack is a type of cyber attack where an attacker intercepts and alters the communication between two parties. In our system the attacker can spoof traffic between the client and the proxy service and add/edit datagram and send it over the TCP connection, we can solve this by adding mutual authentication between client and server.

### Certificate Management: 

In our system we created a self-signed certificates using openssl

`openssl req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem -nodes`

Also we are storing the certificates information in the source code, which is not a good practice at all, but we did to ease the testing process.
In production first we should use a trusted third party like let's Encrypt to create this files instead of self-signed ones, and regarding the storage of the certificate, for a monolithic server, the certificate files should be stored locally on the server itself, either in a file system directory or within an environment variable and in K8s we should store the certificate files in a secure and isolated manner, such as in a Kubernetes secret, also we should keep in mind other processes like regular monitoring and updating to ensure the certificates remain valid.

## Microservices-oriented Architecture Integration

To run our service in a microservice environment we need to:
- Start by creating a Docker image for the DNS-over-TLS proxy that includes the necessary dependencies and configuration files.
- Once the image is built, we can create a helm chart to deploy the service to k8s.
- Next, we need to configure the network settings for the container. Ensure that the container has access to the necessary network resources.
- We also need to configure the DNS-over-TLS proxy to use the appropriate DNS server and also setup the proper certificate files. This can be done in the K8s configurations and secrets.
- Once the DNS-over-TLS proxy deployment is up and running, we can configure other microservices to use it as the DNS server. we can do this by setting the appropriate environment variables in each of our microservice containers.
- To ensure service availability, we should have hpa configured for it to apply auto-scaling and to distribute traffic between the multiple pods, this way, if one pods fails, the others can continue to handle requests.
- To handle the mimt attack, the central proxy should be secured with mauth with other microservices, service-meshes like Linkerd could help us with this without over-complicating our microservices with it, we can also add Retry logic and other features from the service-mesh as well.
- Finally, we want to monitor the performance of the DNS-over-TLS proxy. we can add rules and charts to our Prometheus, Grafana, and Alertmanager to monitor performance and receive alerts in case of any issues.


## Improvements

- Security: Integrate with service-mesh like linkerd with mtls and retry logic enabled.
- Performance optimization: The code could be optimized for better performance, such as by implementing caching mechanism using a centralized Redis cache in the same VPC which can be used by all of our service instances.
- Automatic server failover: If the primary upstream server goes down, the proxy should be able to automatically failover to another server without any manual intervention.
- Supporting multiple protocols: Currently, the proxy supports only DNS-over-TLS. Supporting other DNS encryption protocols such as DNS-over-HTTPS would increase its versatility and functionality.
- Logging: add better error handling and logging: The ability to log errors and exceptions would help in identifying and fixing issues with the DNS server.

### Conclusion
In this project we implemented a solution to secure our DNS queries by implementing a DNS-over-TLS proxy, we talked about the security concerns and micro-service integration steps, and it was really fun and informative for me :)



