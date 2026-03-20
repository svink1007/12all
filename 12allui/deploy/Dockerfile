# Use Node.js version 18.0.0
FROM node:18.0.0

# Accept build arguments (must come after FROM)
ARG REACT_APP_BUILD_VERSION
ARG REACT_APP_BUILD_DATE
ARG REACT_APP_GIT_BRANCH

# Set them as environment variables for the build
ENV REACT_APP_BUILD_VERSION=$REACT_APP_BUILD_VERSION
ENV REACT_APP_BUILD_DATE=$REACT_APP_BUILD_DATE
ENV REACT_APP_GIT_BRANCH=$REACT_APP_GIT_BRANCH

# Set working directory inside the container
WORKDIR /app

# Install Python and other dependencies
RUN apt-get update && \
    apt-get install -y python3 make g++ curl vim && \
    [ -e /usr/bin/python ] || ln -s /usr/bin/python3 /usr/bin/python

# Install specific version of Yarn
RUN npm install -g yarn@1.22.22 --force

# Copy package.json and yarn.lock
COPY package.json yarn.lock ./

####
####  for hub.one2all.tv project
####
COPY deploy/.env.production  ./.env.production

# Install dependencies with Yarn
RUN yarn install

# Copy the rest of the application code
COPY . .

# Expose port (if your app runs on a specific port, e.g., 3000)
EXPOSE 3000

# Default command
CMD ["yarn", "run", "serve:production"]
