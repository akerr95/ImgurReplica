var fs = require('fs'),
  path = require('path'),
  sidebar = require('../helpers/sidebar'),
  express = require('express'),
  router = express.Router(),
  Models = require('../models'),
  multer = require('multer'),
  md5 = require('md5'),
  upload = multer({
    dest: 'public/upload/temp'
  });


router.get('/:image_id', function(req, res) {
  var viewModel = {
    image: {},
    comments: {}
  };

  Models.Image.findOne({
      filename: {
        $regex: req.params.image_id
      }
    },
    function(err, image) {
      if (err) {
        throw err;
      }
      if (image) {
        image.views = image.views + 1;
        viewModel.image = image;
        image.save();
        Models.Comment.find({
            image_id: image._id
          }, {}, {
            sort: {
              'timestamp': 1
            }
          },
          function(err, comments) {
            if (err) {
              throw err;
            }

            viewModel.comments = comments;

            sidebar(viewModel, function(viewModel) {
              res.render('image', viewModel);
            });
          }
        );
      } else {
        res.redirect('/');
      }
    });
});
router.post('/', upload.single('file'), function(req, res) {
  var saveImage = function() {
    var possible = 'abcdefghijklmnopqrstuvwxyz0123456789',
      imgUrl = '';

    for (var i = 0; i < 6; i += 1) {
      imgUrl += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    Models.Image.find({
      filename: imgUrl
    }, function(err, images) {
      if (images.length > 0) {
        saveImage();
      } else {
        var tempPath = req.file.path,
          ext = path.extname(req.file.originalname).toLowerCase(),
          targetPath = path.resolve('./public/upload/' + imgUrl + ext);

        if (ext === '.png' || ext === '.jpg' || ext === '.jpeg' || ext === '.gif') {
          fs.rename(tempPath, targetPath, function(err) {
            if (err) throw err;
            var newImg = new Models.Image({
              title: req.body.title,
              filename: imgUrl + ext,
              description: req.body.description
            });
            newImg.save(function(err, image) {
              res.redirect('/images/' + image.uniqueId);
            });
          });
        } else {
          fs.unlink(tempPath, function(err) {
            if (err) throw err;

            res.status(500).json({
              error: 'Only image files are allowed'
            }); //res.json(500, {error: 'Only image files are allowed.'});
          });
        }
      }
    });

  };

  saveImage();
});
router.post('/:image_id/like', function(req, res) {
  Models.Image.findOne({
      filename: {
        $regex: req.params.image_id
      }
    },
    function(err, image) {
      if (!err && image) {
        image.likes = image.likes + 1;
        image.save(function(err) {
          if (err) {
            res.json(err);
          } else {
            res.json({
              likes: image.likes
            });
          }
        });
      }
    });
});
router.post('/:image_id/comment', function(req, res) {
  Models.Image.findOne({
      filename: {
        $regex: req.params.image_id
      }
    },
    function(err, image) {
      if (!err && image) {
        var newComment = new Models.Comment(req.body);
        newComment.gravatar = md5(newComment.email);
        newComment.image_id = image._id;
        newComment.save(function(err, comment) {
          if (err) {
            throw err;
          }

          res.redirect('/images/' + image.uniqueId + '#' + comment._id);
        });
      } else {
        res.redirect('/');
      }
    });
});
router.delete('/:image_id',function(req, res) {
    Models.Image.findOne({
        filename: {
          $regex: req.params.image_id
        }
      },
      function(err, image) {
        if (err) {
          throw err;
        }

        fs.unlink(path.resolve('./public/upload/' + image.filename),
          function(err) {
            if (err) {
              throw err;
            }

            Models.Comment.remove({
                image_id: image._id
              },
              function(err) {
                image.remove(function(err) {
                  if (!err) {
                    res.json(true);
                  } else {
                    res.json(false);
                  }
                });
              });
          });
      });
});
module.exports = router;
