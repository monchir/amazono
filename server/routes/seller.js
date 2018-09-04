const router = require('express').Router();
const Product = require('../models/product');

const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const s3 = new aws.S3({accessKeyId: "AKIAJNQ7XE5SRJF4SF4Q", secretAccessKey: "f1Pb5ehiwmpihTmFWudvrbOxkuu8pv/mF4cGJvQZ"});

const faker = require('faker');

const checkJWT = require('../middlewares/check-jwt');

const upload = multer({
    storage: multerS3({
      s3: s3,
      bucket: 'amazonoowebapplication',
      metadata: function (req, file, cb) {
        cb(null, {fieldName: file.fieldname});
      },
      key: function (req, file, cb) {
        cb(null, Date.now().toString())
      }
    })
  });


router.route('/products')
    .get(checkJWT, (req, res, next) => {
        console.log('Here');
        console.log(req.decoded.user._id);
        Product.find({ owner: req.decoded.user._id })
        .populate('owner')
        .populate('category')
        .exec((err, products) => {
            if (products) {
                res.json({
                    success: true,
                    message: "Products",
                    products: products
                });
            } else {
                res.status(404).json({
                    message: err
                })
            }
        });
    })
    .post([checkJWT, upload.single('product_picture')],(req, res, next)=>{
        let product = new Product();
        product.owner = req.decoded.user._id;
        product.category = req.body.categoryId;
        product.title = req.body.title;
        product.price = req.body.price;
        product.description = req.body.description;
        product.image = req.file.location;
        product.save();
        res.json({
            success: true,
            message: 'Successfully added the product'
        });
    });
// just for texting
router.get('/faker/text',(req, res, next) =>{
    for (i = 0; i < 20; i++) {
        let product  = new Product();
        product.category = "5b87b823fa1c9036f0987a2d";
        product.owner = "5b7e9bd4a741b43b34cf862a";
        product.image = faker.image.cats();
        product.title = faker.commerce.productName();
        product.description = faker.lorem.words();
        product.price = faker.commerce.price();
        product.save();
    }
    res.json({
        message: "succesfully added 20 pictures"
    })
})

module.exports = router;
