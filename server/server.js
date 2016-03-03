var express = require('express'),
  config = require('./configure'),
  mongoose = require('mongoose');
  app = express();
app.set('port', process.env.PORT || 3300);
app.set('views','./views');
app = config(app);
mongoose.connect('mongodb://localhost/imgPloadr');
mongoose.connection.on('open', function() {
console.log('Mongoose connected.');
});

app.listen(app.get('port'), function() {
  console.log('Server up: http://localhost:' + app.get('port'));
});
