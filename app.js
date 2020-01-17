var express = require('express');
var app = express();

var mysql = require('mysql');
/**
 * this middleware provides a consistent API
 * for mySQL connetions during request/response
 */
var myConnection = require('express-myconnection');
/**
 * Store database credential in a separate config.js file
 * Load the file/module and it values
 */

var config = require('./config');
var dbOptions = {
  host: config.database.host,
  user: config.database.user,
  password: config.database.password,
  port: config.database.port,
  database: config.database.db
};
/**
 * ada 3 cara yg dapat digunakan
 * 1. single: Creates single database connection which is never losed
 * 2. pool: Creates pool of connections, conn is auto release when response ends
 * 3. request: Creates new connection per new request, conn is auto close when response ends.
 */
app.use(myConnection(mysql, dbOptions, 'pool'));
/**
 * setting up the templating view engine
 */
app.set('view engine', 'ejs');
/**
 * import routes/index.js
 * import routes/users.js
 */
var index = require('./routes/index');
var users = require('./routes/users');

// Using express validator middleware for form validation
var expressValidator = require('express-validator');
app.use(expressValidator());

/**
 * body-parser module is used to read HTTP POST data
 * it's an express middleware that reads form;s imput
 * and store it as as javascript object
 */
var bodyParser = require('body-parser');
/**
 * bodyParser.urlencode() parses the text as URL encode data
 * (which is how browsers tend to send form data from regular forms set to POST)
 * and exposes the resulting object (containing the keys and values) on req.body
 */
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

/**
 * This module let us use HTTP verbs such as PUT or DELETE
 * in places where they are not supported
 */
var methodOverride = require('method-override');

/**
 * using custom logic to override method
 * there are other ways of overriding as well
 * like using header & using query value
 */
app.use(
  methodOverride(function(req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
      // look in urlencode POST bodies and delete it
      var method = req.body._method;
      delete req.body._method;
      return method;
    }
  })
);
/**
 * This module shows flash messages
 * generally used to show success or error messages
 *
 * Flash messages are stored in session
 * so, we also have to install an use
 * cookie-parser & session modules
 */
var flash = require('express-flash');
var cookieParser = require('cookie-parser');
var session = require('express-session');

app.use(cookieParser('keyboard cat'));
app.use(
  session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 }
  })
);
app.use(flash());

// ini akan merender sesuai
app.use('/', index);
app.use('/users', users);

app.listen(3000, () => {
  console.log('Server running at port 3000: http://127.0.0.1:3000');
});
