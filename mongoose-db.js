var mongoose = require('mongoose');
var cfenv = require("cfenv");
var Schema = mongoose.Schema;

var Todo = new Schema({
  content: Buffer,
  updated_at: Date,
});

mongoose.model('Todo', Todo);

var User = new Schema({
  username: String,
  password: String,
});

mongoose.model('User', User);

// CloudFoundry env vars
var mongoCFUri = cfenv.getAppEnv().getServiceURL('goof-mongo');
console.log(JSON.stringify(cfenv.getAppEnv()));

// Default Mongo URI is local
const DOCKER = process.env.DOCKER
if (DOCKER === '1') {
  var mongoUri = 'mongodb://goof-mongo/express-todo';
} else {
  var mongoUri = process.env.MONGO_URI || 'mongodb://localhost/express-todo';
}


// CloudFoundry Mongo URI
if (mongoCFUri) {
  mongoUri = mongoCFUri;
} else if (process.env.MONGOLAB_URI) {
  // Generic (plus Heroku) env var support
  mongoUri = process.env.MONGOLAB_URI;
} else if (process.env.MONGODB_URI) {
  // Generic (plus Heroku) env var support
  mongoUri = process.env.MONGODB_URI;
}

console.log("Using Mongo URI " + mongoUri);

mongoose.connect(mongoUri);

User = mongoose.model('User');
User.find({ username: 'admin@snyk.io' }).exec(function (err, users) {
  if (err) {
    console.error("Error querying users:", err);
    return;
  }

  console.log("Users found:", users);
  
  if (!users || users.length === 0) {
    console.log('No admin user found, creating...');
    new User({ username: 'admin@snyk.io', password: 'SuperSecretPassword' }).save(function (err, user, count) {
      if (err) {
        console.log('Error saving admin user:', err);
      }
    });
  }
});
