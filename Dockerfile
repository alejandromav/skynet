FROM node:9

# Arguments
ARG MONGODB_URL

# Exclude the NPM cache from the image
VOLUME /root/.npm

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Copy npm config
# COPY .docker.npmrc /root/.npmrc

# Install app dependencies
COPY package.json /usr/src/app/
RUN npm i

# Bundle app source
COPY . /usr/src/app

# Environment variables
ENV NODE_ENV "production"
ENV PORT 80
ENV MONGODB_URL=$MONGODB_URL

# Compile app source
RUN npm run build:docker

CMD [ "npm", "run", "start:docker" ]
