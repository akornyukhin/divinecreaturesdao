#!/bin/sh

ganache-cli > /app/build/static/ganache-log.log &

cd /app
# npx hardhat compile
npx hardhat run /app/scripts/deployAll.js

serve -s /app/build -l 8080