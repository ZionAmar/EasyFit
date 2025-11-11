const productService = require('../services/product_S');

const createProduct = async (req, res, next) => {
    try {
        const { studioId } = req.user; 
        const product = await productService.createProduct(studioId, req.body);
        res.status(201).json(product);
    } catch (err) {
        next(err);
    }
};

const getProducts = async (req, res, next) => {
    try {
        const { studioId } = req.user;
        const products = await productService.getProductsByStudio(studioId);
        res.status(200).json(products);
    } catch (err) {
        next(err);
    }
};

const updateProduct = async (req, res, next) => {
    try {
        const { studioId } = req.user;
        const { id } = req.params;
        const product = await productService.updateProduct(id, req.body, studioId);
        res.status(200).json(product);
    } catch (err) {
        next(err);
    }
};

const deleteProduct = async (req, res, next) => {
    try {
        const { studioId } = req.user;
        const { id } = req.params;
        const result = await productService.deleteProduct(id, studioId);
        res.status(200).json(result);
    } catch (err) {
        next(err);
    }
};

module.exports = {
    createProduct,
    getProducts,
    updateProduct,
    deleteProduct
};