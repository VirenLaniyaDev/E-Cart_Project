const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));

//--- Access Public directory for serving static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/data', express.static(path.join(__dirname, '../', 'E-Cart Seller', 'data')));
app.use('/data', express.static(path.join(__dirname, 'data')));

//--- Set View engine and view for rendering .ejs template
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'public', 'views'));

const appConfig = require('./configurations/appConfig.json');   // Importing app configuration file (.json)

//--- Managing sessions
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

//--- Defining User object in every request made by seller
const User = require('./models/user').User;
const userInstance = (req, res, next) => {
    if (req.session.userId) {
        User.findByUserId(req.session.userId)
            .then(user => {
                req.user = new User(user.name, user.email, user.password, user.cart, user.address, user.mobile, user.gender, user.profilePicture, user._id);
                next();
            })
            .catch(err => { throw err });
    } else {
        next();
    }
}
app.use(userInstance);

//--- Use Connect flash
const flash = require('connect-flash');
app.use(flash());

//--- Locals Middleware
const locals = require('./utils/middlewares/locals');
app.use(locals);    // Using locals

//--- Route handling
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authenticationRoutes');
const productRoutes = require('./routes/productRoutes');
app.use(userRoutes);
app.use(authRoutes);
app.use(productRoutes);

//--- Error handling : Page not found
const errorRoutes = require('./routes/errorRoutes');
app.use(errorRoutes);

// App starts listening after database connection successfully made 
const connect_db = require('./services/connect_database');
const port = require('./configurations/appConfig.json').port || 3000;  // Importing port from appSettings.json
connect_db.mongoConnect(() => {
    app.listen(port, (err) => {
        if (err)
            throw err;
        console.log(`Server is listening(${port})...`);
    })
})