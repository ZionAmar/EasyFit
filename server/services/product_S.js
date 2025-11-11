const productModel = require('../models/product_M');

const createProduct = async (studio_id, productData) => {
    const { name, price, visit_limit = null, duration_days = null } = productData;

    if (!name || !price) {
        const error = new Error("שם ומחיר הם שדות חובה.");
        error.status = 400;
        throw error;
    }

    if (price < 0) {
        const error = new Error("מחיר חייב להיות מספר חיובי.");
        error.status = 400;
        throw error;
    }

    const [result] = await productModel.create({ ...productData, studio_id });
    const [[newProduct]] = await productModel.getById(result.insertId);
    return newProduct;
};

const getProductsByStudio = async (studio_id) => {
    const [products] = await productModel.getByStudioId(studio_id);
    return products;
};

const updateProduct = async (id, productData, studio_id) => {
    const [[product]] = await productModel.getById(id);
    if (!product) {
        const error = new Error('מוצר לא נמצא.');
        error.status = 404;
        throw error;
    }
    if (product.studio_id !== studio_id) {
        const error = new Error('גישה נדחתה. אין לך הרשאה לערוך מוצר זה.');
        error.status = 403;
        throw error;
    }

    const updatedData = { ...product, ...productData };
    
    await productModel.update(id, updatedData);
    const [[updatedProduct]] = await productModel.getById(id);
    return updatedProduct;
};

const deleteProduct = async (id, studio_id) => {
    const [[product]] = await productModel.getById(id);
    if (!product) {
        const error = new Error('מוצר לא נמצא.');
        error.status = 404;
        throw error;
    }
    if (product.studio_id !== studio_id) {
        const error = new Error('גישה נדחתה.');
        error.status = 403;
        throw error;
    }

    await productModel.setActiveStatus(id, false);
    return { message: 'המוצר הושבת בהצלחה.' };
};

module.exports = {
    createProduct,
    getProductsByStudio,
    updateProduct,
    deleteProduct
};