# Use Node as Base Image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json first (for better caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all code to container
COPY . .

# Expose port
EXPOSE 5000

# Run Application (using the script defined in package.json)
CMD ["npm", "start"]