FROM node:16.13.1-alpine3.12

RUN npm install -g serve ganache-cli 

WORKDIR /app

RUN npm install hardhat  
RUN npm install --save-dev typescript ts-node @nomiclabs/hardhat-waffle
# RUN npm install -g express path
#export NODE_OPTIONS=--openssl-legacy-provider

COPY build /app/build
COPY scripts /app/scripts
COPY src/contracts /app/contracts
COPY src/artifacts /app/artifacts
COPY start.sh /app
COPY src/hardhat.config.ts /app

EXPOSE 8080

# start app
# CMD ["npm", "start"]
# CMD ["node", "server.js"]
# CMD ["ganache-cli"]
# CMD ["serve", "-s", "/app/build", "-l", "8080"]

CMD ["sh", "/app/start.sh"]
