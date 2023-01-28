const path = require('path');
const express = require('express');
const app = express();

//--- Parsing data and files
const bodyParser = require('body-parser');  // For parsing data
app.use(bodyParser.urlencoded({ extended: false }));    // Initialize body-parser

//--- Serving static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/data', express.static(path.join(__dirname, 'data')));

//--- Set View engine and view for rendering .ejs template
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'public', 'views'));

const appConfig = require('./configurations/appConfig.json');   // Importing app configuration file (.json)

//--- Managing Sessions
const session = require('express-session');
// Importing connect-mongodb-session third party package to store sessions in MongoDB database
const MongoDBStore = require('connect-mongodb-session')(session);
// Storing information that where session will be stored
const store = MongoDBStore({
    uri: appConfig.session.uri,
    collection: appConfig.session.collection
})
// At least when server starts listening session should initiated
app.use(session({
    secret: appConfig.session.secret_key,  // It is a key used for signing and/or encrypting cookies set by the application to maintain session state
    resave: false,  // resave means session will be reset on every request, but we don't need this so we provide false
    saveUninitialized: false,     // ensures that no session gets saved for the request
    store: store
}))

//--- Defining Seller object in every request made by seller
const Seller = require('./models/seller').Seller;
const sellerInstance = (req, res, next) => {
    if (req.session.sellerId) {
        Seller.findBySellerId(req.session.sellerId)
            .then(seller => {
                req.seller = new Seller(seller.name, seller.business_name, seller.mobile, seller.email, seller.password, seller.about_seller, seller.business_GSTIN, seller.business_address, seller.bank_name, seller.bank_account_no, seller.bank_IFSC, seller.profilePicture, seller._id);
                next();
            })
            .catch(err => { throw err });
    } else {
        next();
    }
}
app.use(sellerInstance);

//--- Use Connect flash
const flash = require('connect-flash');
app.use(flash());

//--- Locals Middleware
const locals = require('./utils/middlewares/locals');
app.use(locals);    // Using locals

//--- Route handling
const sellerRoutes = require('./routes/sellerRoutes.js');
const authRoutes = require('./routes/authenticationRoutes.js');
app.use(sellerRoutes);
app.use(authRoutes);

//--- Error handling : Page not found
const errorRoutes = require('./routes/errorRoutes');
app.use(errorRoutes);

// App starts listening after database connection successfully made 
const connect_db = require('./services/connect_database');
const port = appConfig.port || 3001;  // Importing port from appSettings.json
connect_db.mongoConnect(() => {
    app.listen(port, (err) => {
        if (err)
            throw err;
        console.log(`Server is listening(${port})...`);
    })
})