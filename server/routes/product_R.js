const express = require('express');
const router = express.Router();
const productController = require('../controllers/product_C');
const { isLoggedIn, requireRole } = require('../middlewares/auth_Midd');

router.use(isLoggedIn, requireRole('admin', 'owner'));
router.get('/', productController.getProducts);
router.post('/', productController.createProduct);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;