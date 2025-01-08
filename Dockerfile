# Use an official Node.js image as the base image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and package-lock.json (if available) for dependency installation
COPY package*.json ./

# Install the dependencies (both production and development)
RUN npm install

# Copy the source code into the working directory
COPY . .

# Expose the port your app will run on
EXPOSE 3000

# Run the app using the specified entry point
CMD ["node", "src/index.js"]
