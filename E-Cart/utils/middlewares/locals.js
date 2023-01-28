locals = (req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.searchString = req.query.search ? req.query.search : '';
    if (req.user) {
        res.locals.userName = req.user.name;
        res.locals.profilePicture = req.user.profilePicture;
        res.locals.cartItems = req.user.cart.items.length;
        next();
    } else {
        next();
    }
}

module.exports = locals;