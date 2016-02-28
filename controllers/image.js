var fs = require('fs'),
    path = require('path'),
    sidebar = require('../helpers/sidebar'),
    express = require('express'),
      router = express.Router(),
      multer  = require('multer'),
    upload = multer({ dest: 'public/upload/temp' });


router.get('/:image_id', function(req, res){
  var viewModel = {
      image: {
          uniqueId:       1,
          title:          'Sample Image 1',
          description:    'This is a sample.',
          filename:       'sample1.jpg',
          views:          0,
          likes:          0,
          timestamp:      Date.now
      },
      comments: [
          {
              image_id:   1,
              email:      'test@testing.com',
              name:       'Test Tester',
              gravatar:   'http://www.gravatar.com/avatar/9a99fac7b524fa443560ec7b5ece5ca1?d=monsterid&s=45',
              comment:    'This is a test comment...',
              timestamp:  Date.now()
          },{
              image_id:   1,
              email:      'test@testing.com',
              name:       'Test Tester',
              gravatar:   'http://www.gravatar.com/avatar/9a99fac7b524fa443560ec7b5ece5ca1?d=monsterid&s=45',
              comment:    'Another followup comment!',
              timestamp:  Date.now()
          }
      ]
  };

  sidebar(viewModel, function(viewModel) {
      res.render('image', viewModel);
  });
});
router.post('/',upload.single('file'), function(req, res){
  var saveImage = function() {
      var possible = 'abcdefghijklmnopqrstuvwxyz0123456789',
          imgUrl = '';

      for(var i=0; i < 6; i+=1) {
          imgUrl += possible.charAt(Math.floor(Math.random() * possible.length));
      }

      var tempPath = req.file.path,
          ext = path.extname(req.file.originalname).toLowerCase(),
          targetPath = path.resolve('./public/upload/' + imgUrl + ext);

      if (ext === '.png' || ext === '.jpg' || ext === '.jpeg' || ext === '.gif') {
          fs.rename(tempPath, targetPath, function(err) {
              if (err) throw err;

              res.redirect('/images/' + imgUrl);
          });
      } else {
          fs.unlink(tempPath, function (err) {
              if (err) throw err;

              res.status(500).json({error:'Only image files are allowed'});//res.json(500, {error: 'Only image files are allowed.'});
          });
      }
  };

  saveImage();
});
router.post('/:image_id/like', function(req, res) {
    res.json({likes: 1});
});
router.post('/:image_id/comment', function(req, res){
    res.send('The image:comment POST controller');
});

module.exports = router;
