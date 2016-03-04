var Stats = require('./stats'),
  Images = require('./images'),
  async = require('async');
Comments = require('./comments');

module.exports = function(viewModel, callback) {
  async.parallel([
    function(next) {
       Stats(next);
    },
    function(next) {
      Images.popular(next);
    },
    function(next) {
      Comments.newest(next);
    }
  ],
    function(err, results) {
    console.log(results);
      viewModel.sidebar = {
        stats: results[0],
        popular: results[1],
        comments: results[2]
      };

      callback(viewModel);
    });
};
