cd wallet
yarn build
cd ..
cd sdk/package
rm -rf node_modules && yarn && tsc

cd ../examples/asset-webpack-ts
rm -rf node_modules && yarn && yarn upgrade manta.js && yarn serve

#yarn upgrade manta.js && yarn start