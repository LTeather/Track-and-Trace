const router   = require('express').Router();
const passport = require('passport');

router.get('/', passport.authenticate('discord'));
router.get('/redirect', passport.authenticate('discord', { 
    failureRedirect: '/index',
    successRedirect: '/dashboard'
}));
router.get('/logout', (req, res) => {
    if(req.user) {
        req.logout();
        res.redirect('/index');
    } else {
        res.redirect('/index');
    }
});

function isAuthorized(req, res, next) {
    if(req.user) {
        //console.log("User is logged in.");
        next();
    }
    else {
        //console.log("User is not logged in.");
        res.redirect('/index');
    }
}


module.exports = router;