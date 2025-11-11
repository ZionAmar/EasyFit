const membershipService = require('../services/membership_S');

const getMembershipsForUser = async (req, res, next) => {
    try {
        const { userId } = req.params;
        
        // TODO: אבטחה - ודא שלמשתמש המחובר (req.user) יש הרשאה לראות את המנויים האלה
        // (למשל, אם הוא אדמין, או אם זה המשתמש עצמו)
        // if (req.user.id !== parseInt(userId) && !req.user.roles.includes('admin')) {
        //     const error = new Error('גישה נדחתה.');
        //     error.status = 403;
        //     throw error;
        // }

        const memberships = await membershipService.getMembershipsByUser(userId);
        res.status(200).json(memberships);
    } catch (err) {
        next(err);
    }
};

const assignMembership = async (req, res, next) => {
    try {
        const { studioId } = req.user; 
        const { user_id, studio_product_id, start_date } = req.body;

        if (!user_id || !studio_product_id) {
            const error = new Error("נדרש מזהה משתמש ומזהה מוצר.");
            error.status = 400;
            throw error;
        }

        const newMembership = await membershipService.assignMembership(
            user_id, 
            studio_product_id, 
            studioId, 
            start_date 
        );
        
        res.status(201).json(newMembership);
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getMembershipsForUser,
    assignMembership
};