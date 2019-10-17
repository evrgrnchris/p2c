// app/routes.js
var User = require('../app/model/user');
var bcrypt   = require('bcrypt-nodejs');


module.exports = function(app, passport,db,dbuser) {

    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================
    app.get('/', function(req, res) {
        //res.render('index.ejs'); // load the index.ejs file
        res.render('login.ejs', { message: req.flash('loginMessage') }); 
        
    });

    // =====================================
    // LOGIN ===============================
    // =====================================
    // show the login form
    app.get('/login', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('login.ejs', { message: req.flash('loginMessage') }); 
    });

    // process the login form
    app.post('/login', passport.authenticate('local', {
        successRedirect : '/profile',
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));
    
 
    
    

    // =====================================
    // SIGNUP ==============================
    // =====================================
    // show the signup form
    app.get('/signup', /*isAdminUser, */function(req, res) {
    
    //app.get('/signup', function(req, res) {
    	
        // render the page and pass in any flash data if it exists
        res.render('signup.ejs', { message: req.flash('signupMessage') });
    });

    // process the signup form
    /*app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));*/
    function setUserPass(user, pass) {
    	  User.username = user;
    	  //User.password = bcrypt.hashSync(pass, bcrypt.genSaltSync(8), null);
    	  User.password = pass;
    	  User.timestamp = Date.now();
    }
    
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/login', // redirect to the secure profile section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));
    

    // =====================================
    // PROFILE SECTION =====================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/profile', isLoggedIn, function(req, res) {
		//console.log("Caller Form - "+req.session.username);
		
    	res.render('p2cform.html', { volunteer: req.session.username });
    });

    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', function(req, res) {
        req.logOut();
        res.redirect('/');
    });
	
	app.post('/submitform', isLoggedIn, function(request, response) {
        //console.log("Submit Form - "+request.sessionID);
    
        
        
    var name = sanitizeInput(request.body.name).replace(" ","-");
   
    var phone = sanitizeInput(request.body.phone);
   
    var age;
    var sex;
    var id = (name+"-"+phone).toLowerCase();
    //console.log("Doc ID: "+id);
    //console.log(request.body.jsondata);
    //var jsonData =(request.body.jsondata).replace('\"jsondata\":\"\",','');
    var jsonData =request.body.jsondata;
    //console.log("data: "+jsonData);
    db.insert(JSON.parse(jsonData),id, function(err, doc) {
        if (err) {
            console.log(err);
            response.sendStatus(500);
        } else{
        	response.render('submit_success.ejs');
        	//response.sendStatus(200);
        }
            
        	
        response.end();
    });
   
    });
};

function sanitizeInput(str) {
    return String(str).replace(/&(?!amp;|lt;|gt;)/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/login');
}

function isAdminUser(req, res, next) {
    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated() && req.session.username =="chris.hembrom")
        return next();

    // if they aren't redirect them to the home page
    res.render('login.ejs', { message: 'For Signup, please login as admin user!' });
}

