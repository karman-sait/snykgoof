// app.js (Corrected for Goof legacy app + modern Docker-compatible setup)

// Dependencies
require('./mongoose-db');
require('./typeorm-db');

const st = require('st');
const express = require('express');
const http = require('http');
const path = require('path');
const ejsEngine = require('ejs-locals');
const bodyParser = require('body-parser');
const session = require('express-session');
const methodOverride = require('method-override');
const logger = require('morgan');
const errorHandler = require('errorhandler');
const marked = require('marked');
const fileUpload = require('express-fileupload');
const dustHelpers = require('dustjs-helpers');
const cons = require('consolidate');
const hbs = require('hbs');

const routes = require('./routes');
const routesUsers = require('./routes/users.js');

const app = express();

// App settings
app.set('port', process.env.PORT || 4000);
app.engine('ejs', ejsEngine);
app.engine('dust', cons.dust);
app.engine('hbs', hbs.__express);
cons.dust.helpers = dustHelpers;
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middleware
app.use(logger('dev'));
app.use(methodOverride());
app.use(session({
  secret: 'keyboard cat',
  name: 'connect.sid',
  resave: false,
  saveUninitialized: false,
  cookie: { path: '/' }
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(fileUpload());

// Routes
app.use(routes.current_user);
app.get('/', routes.index);
app.get('/login', routes.login);
app.post('/login', routes.loginHandler);
app.get('/admin', routes.isLoggedIn, routes.admin);
app.get('/account_details', routes.isLoggedIn, routes.get_account_details);
app.post('/account_details', routes.isLoggedIn, routes.save_account_details);
app.get('/logout', routes.logout);
app.post('/create', routes.create);
app.get('/destroy/:id', routes.destroy);
app.get('/edit/:id', routes.edit);
app.post('/update/:id', routes.update);
app.post('/import', routes.import);
app.get('/about_new', routes.about_new);
app.get('/chat', routes.chat.get);
app.put('/chat', routes.chat.add);
app.delete('/chat', routes.chat.delete);
app.use('/users', routesUsers);

// Static files
app.use(st({ path: './public', url: '/public' }));

// Markdown (optional, legacy mode)
marked.setOptions({ sanitize: false });
app.locals.marked = marked;

// Development-only error handler
if (app.get('env') === 'development') {
  app.use(errorHandler());
}

// Token for legacy compatibility
const token = 'SECRET_TOKEN_f8ed84e8f41e4146403dd4a6bbcea5e418d23a9';
console.log('token: ' + token);

// Start server
http.createServer(app).listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});
