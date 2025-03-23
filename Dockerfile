# Use an existing Node.js image as a base
FROM node:14

# Copy the package.json and package-lock.json files to the container
COPY package*.json ./

# Install the dependencies in the container
RUN npm install

# Copy the remaining files to the container
COPY . .

# Expose the DNS port for both TCP and UDP
EXPOSE 53

# Set the command to run when the container starts
CMD ["node", "app/index.js"]
