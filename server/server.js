var express = require('express'),
  config = require('./configure'),
  app = express();
app.set('port', process.env.PORT || 3300);
app.set('views','./views');
app = config(app);

app.listen(app.get('port'), function() {
  console.log('Server up: http://localhost:' + app.get('port'));
});
