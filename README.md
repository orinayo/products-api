# Products-API
## Setup
1. Navigate to the folder you want to clone the repo into.

2. Clone the project locally using the command ```git clone https://github.com/orinayo/products-api.git```

3. Navigate to the folder via terminal and run npm install

4. Once the dependencies have been downloaded you can run ```npm start``` or ```npm run server``` to start the app.

## Checklist
1. Make sure your mongodb service is up and running.

2. Create an account with Cloudinary.

3. Create a dev.js file in the config folder to hold your dev keys.

4.  ``` mongoURI: 'mongodb://localhost:27017/ProductAPI',```
    ``` port: 3001, ````
    ``` cloudinaryName: <yourCloudinaryCloudName>,```
    ``` cloudinaryApiKey: <yourCloudinaryApiKey>,```
    ``` cloudinaryApiSecret: <yourCloudinaryApiSecret>```

## Testing 
### To test the Products API
Run the command ```npm run test``` or ```npm run test-watch``` in your terminal.
You can also visit https://lit-basin-96922.herokuapp.com to interact with the client side.

## Docs
You can find the api docs at http://localhost:3001/api/v1/docs
