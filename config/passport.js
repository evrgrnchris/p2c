// config/passport.js

// load all the things we need
var LocalStrategy   = require('passport-local').Strategy;
var bcrypt   = require('bcrypt-nodejs');

// load up the user model
var User            = require('../app/model/user');

// expose this function to our app using module.exports
module.exports = function(passport,db,dbuser) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
	// used to serialize the user for the session
    passport.serializeUser(function(user, done) {
    	
    	
        done(null, user.username);
    });
    

    // used to deserialize the user
    
    passport.deserializeUser(function(id, done) {
    	//console.log("passport.deserializeUser-"+id);
    	dbuser.get(id, function(err, user) {
            done(err, user);
        });
    });
    

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'
    function setUserPass(user, pass) {
  	  User.username = user;
  	  //User.password = bcrypt.hashSync(pass, bcrypt.genSaltSync(8), null);
  	  User.password = pass;
  	  User.timestamp = Date.now();
    }
    
    passport.use('local-signup', new LocalStrategy({
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, username, password, done) {
    	//console.log("local-signup:"+username+"|"+password);
        // asynchronous
        // User.findOne wont fire unless data is sent back
        process.nextTick(function() {

        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        	dbuser.get(username, function(err, user) {
            // if there are any errors, return the error
            	
            // check to see if theres already a user with that email
            if (user) {
                return done(null, false, req.flash('signupMessage', 'That username is already taken.'));
            } 
        	
            else if (err && err.error=="not_found"){
            	// if there is no user with that email
                // create the user
            	//console.log("Create new user");
            	setUserPass(username,password);
                

                // save the user
            	dbuser.insert(User,username, function(err, doc) {
                    if (err)
                        throw err;
                    return done(null, User);
                });
            }
            
            else {

            	console.log(err);
                return done(err);
                }

        });    

        });

    }));
    
    passport.use(new LocalStrategy({
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    		  function(req, username, password, done) {
    			  
    			  
    			  dbuser.get(username, function(err, user) {
    		            // if there are any errors, return the error before anything else
    		            if (err)
    		                return done(err);

    		            // if no user is found, return the message
    		            if (!user)
    		                return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash

    		            // if the user is found but the password is wrong
    		            if (user.password != password)
    		                return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata

    		            // all is well, return successful user
    		            //console.log(user);
    		            req.session.username=username;
    		            return done(null, user);
    		        });
    			 
    		  }
    ));

};
