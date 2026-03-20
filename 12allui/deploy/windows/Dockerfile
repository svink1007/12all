# Base image with Node.js 14.16.1
FROM node:14.16.1

# Set working directory inside container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Update package.json by removing node-sass and modifying devDependencies
RUN npm install jq -g && \
    jq 'del(.dependencies["node-sass"])' package.json | sponge package.json && \
    jq '.devDependencies = {
      "@types/react-google-recaptcha": "^2.1.5",
      "@typescript-eslint/eslint-plugin": "^5.6.0",
      "@typescript-eslint/parser": "^5.6.0",
      "ajv": "^8.17.1",
      "eslint": "^7.32.0",
      "sass": "^1.79.4",
      "typescript": "^3.7.5"
    }' package.json | sponge package.json

# Install project dependencies
RUN npm install

# Copy rest of the application code
COPY . .

# Expose port (if your app runs on a specific port, e.g., 3000)
EXPOSE 3000

# Default command
CMD ["npm", "start"]
