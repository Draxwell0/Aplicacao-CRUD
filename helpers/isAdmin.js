module.exports = {
    isAdmin: function(req, res, next){
        if(req.isAuthenticated() && req.user.admin == 1){
            return next();
        }

        req.flash('error_msg', 'Você precisa ser um admin para entrar');
        res.redirect('/');

    }
};