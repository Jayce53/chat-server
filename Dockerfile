FROM node:latest

# Set working directory
WORKDIR /usr/server

# Copy essential files needed for installing node modules
COPY package.json yarn.lock tsconfig.json ./

# Install dependencies
RUN yarn install --verbose

#RUN echo $(ls -1 /usr/server) >> x

# We're going to expose 9229 for debugging node apps
EXPOSE 9229
# ENV DEBUG socket.io*

COPY entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/entrypoint.sh
ENTRYPOINT ["entrypoint.sh"]

# Start command for the application using ES6 modules and TypeScript
# CMD ["node_modules/.bin/tsx", "--inspect-brk=0.0.0.0:9229", "src/server.ts"]
