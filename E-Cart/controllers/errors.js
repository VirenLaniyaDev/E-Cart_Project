exports.e404_pageNotFound = (req, res) =>{
    res.render('error', {
        pageTitle: "404: Page not found",
        error_status_code: 404
    })
}

exports.e400_badRequest = (req, res) =>{
    res.render('error', {
        pageTitle: "400: Bad Request",
        error_status_code: 400
    })
}