const membershipModel = require('../models/membership_M');
const productModel = require('../models/product_M'); 
const userModel = require('../models/user_M'); 

const assignMembership = async (user_id, studio_product_id, studio_id, startDateInput) => {
    const [[user]] = await userModel.getById(user_id);
    const [[product]] = await productModel.getById(studio_product_id);

    if (!user) {
        throw new Error('משתמש לא נמצא');
    }
    if (!product) {
        throw new Error('מנוי לא נמצא');
    }
    if (product.studio_id !== studio_id || !userModel.findStudiosAndRolesByUserId(user_id).then(res => res[0].some(s => s.studio_id === studio_id))) {
        console.warn(`User ${user_id} or Product ${studio_product_id} not in studio ${studio_id}`);
    }

    const start_date = startDateInput ? new Date(startDateInput) : new Date(); // היום, או תאריך שהאדמין בחר
    
    let expiry_date = null;
    if (product.duration_days) {
        expiry_date = new Date(start_date);
        expiry_date.setDate(expiry_date.getDate() + product.duration_days);
    }
    
    const visits_remaining = product.visit_limit; 
    const status = 'active'; 

    const [result] = await membershipModel.create({
        user_id,
        studio_id,
        studio_product_id,
        start_date,
        expiry_date,
        visits_remaining,
        status
    });

    const [[newMembership]] = await membershipModel.getById(result.insertId);
    return newMembership;
};

const getMembershipsByUser = async (user_id) => {
    // TODO: להוסיף לוגיקה שמעדכנת סטטוס אוטומטית
    // לדוגמה: אם expiry_date עבר, לשנות סטטוס ל-'expired'
    // אם visits_remaining == 0, לשנות סטטוס ל-'depleted'
    
    const [memberships] = await membershipModel.getByUserId(user_id);
    return memberships;
};


module.exports = {
    assignMembership,
    getMembershipsByUser
};