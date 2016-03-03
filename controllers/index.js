var express = require('express'),
  router = express.Router(),
  sidebar = require('../helpers/sidebar'),
  ImageModel = require('../models').Image,
  image = require('./image');


router.use('/images', image);

router.get('/', function(req, res) {
  var viewModel = {
    images: []
  };

  ImageModel.find({}, {}, {
      sort: {
        timestamp: -1
      }
    },
    function(err, images) {
      if (err) {
        throw err;
      }

      viewModel.images = images;
      sidebar(viewModel, function(viewModel) {
        res.render('index', viewModel);
      });
    });
});

module.exports = router;
