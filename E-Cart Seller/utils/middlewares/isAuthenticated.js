exports.isAuthenticated = async (req, res, next) => {
    if (!req.session.isLoggedIn) {
        console.log("Please login to continue...");
        await req.flash('error', "Please Login to continue!...");
        req.session.returnTo = req.originalUrl;
        req.session.method = req.method;
        return res.redirect('/login');
    } else {
        next();
    }
}