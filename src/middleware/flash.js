// Stores a one-time message in the session and exposes it to the next request.
// Usage:
//  Set:  req.flash('You must be logged in to do that.')
//  Read: automatically available as `flash` in all Pug templates

function flashMiddleware(req, res, next) {
    // Expose any pending flash message to Pug templates
    res.locals.flash = req.session.flash || null;

    // Clear it after reading so it only shows once
    delete req.session.flash;

    // Attach a setter for controllers/routes to use
    req.flash = (message) => {
        req.session.flash = message;
    };

    next();
}

module.exports = flashMiddleware;