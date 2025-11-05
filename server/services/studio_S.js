const studioModel = require('../models/studio_M');
const userModel = require('../models/user_M');
const { encWithSalt } = require('../middlewares/auth_Midd');

const getManagerDashboardDetails = async (managerId) => {
    const [studioDetails, [[userDetails]]] = await Promise.all([
        studioModel.getStudioByManagerId(managerId),
        userModel.getById(managerId)
    ]);

    if (!studioDetails) {
        const error = new Error("אינך מנהל של אף סטודיו או שהסטודיו לא נמצא.");
        error.status = 403;
        throw error;
    }

    return {
        user: { id: userDetails.id, full_name: userDetails.full_name, email: userDetails.email },
        studio: studioDetails
    };
};

const getDashboardStats = async (studioId) => {
    return studioModel.getDashboardStats(studioId);
};

const getTodaysSchedule = async (studioId) => {
    return studioModel.getTodaysScheduleByStudio(studioId);
};

const getFullSettings = async (studioId) => {
    const [details, hours] = await Promise.all([
        studioModel.getDetailsById(studioId),
        studioModel.getOperatingHours(studioId)
    ]);

    if (!details) {
        const error = new Error("הסטודיו לא נמצא.");
        error.status = 404;
        throw error;
    }

    return { details, hours };
};

const updateFullSettings = async (studioId, data) => {
    const { details, hours } = data;
    return studioModel.updateSettings(studioId, details, hours);
};

const getAllStudios = async () => {
    return studioModel.findAll();
};

const createStudio = async (studioData) => {
    const { createMode, existingAdminId, name, address, phone_number, ...adminData } = studioData;

    if (!name) {
        const error = new Error('שם הסטודיו הוא שדה חובה.');
        error.status = 400;
        error.field = 'name';
        throw error;
    }

    const existingStudio = await studioModel.getByName(name);
    if (existingStudio) {
        const error = new Error("סטודיו בשם זה כבר קיים במערכת");
        error.status = 409;
        error.field = 'name';
        throw error;
    }

    if (createMode === 'newAdmin') {
        const { admin_full_name, admin_email, admin_userName, admin_password } = adminData;
        if (!admin_full_name || !admin_email || !admin_userName || !admin_password) {
            const error = new Error('כל השדות עבור מנהל חדש הם חובה.');
            error.status = 400;
            throw error;
        }

        const existingEmail = await userModel.getByEmail(admin_email);
        if (existingEmail) {
            const error = new Error("כתובת האימייל שהוזנה כבר קיימת במערכת");
            error.status = 409;
            error.field = 'admin_email';
            throw error;
        }

        const existingUserName = await userModel.getByUserName(admin_userName);
        if (existingUserName) {
            const error = new Error("שם המשתמש תפוס, נסה שם אחר.");
            error.status = 409;
            error.field = 'admin_userName';
            throw error;
        }
        
        const password_hash = encWithSalt(admin_password);

        return studioModel.createStudioWithNewAdmin({
            studio_name: name, address, phone_number,
            admin_full_name, email: admin_email, password_hash, userName: admin_userName
        });
    } else if (createMode === 'existingUser') {
        if (!existingAdminId) {
            const error = new Error('אנא בחר משתמש קיים שישמש כמנהל.');
            error.status = 400;
            error.field = 'existingAdminId';
            throw error;
        }
        
        return studioModel.createStudioWithExistingAdmin({
            studio_name: name, address, phone_number,
            adminId: existingAdminId
        });
    } else {
        const error = new Error('אופן יצירת הסטודיו אינו חוקי.');
        error.status = 400;
        error.field = 'createMode';
        throw error;
    }
};

const updateStudio = async (id, studioData) => {
    const updatedStudio = await studioModel.update(id, studioData);
    if (!updatedStudio) {
        const error = new Error('הסטודיו לא נמצא או שלא בוצעו שינויים.');
        error.status = 404;
        throw error;
    }
    return updatedStudio;
};

const deleteStudio = async (id) => {
    const result = await studioModel.remove(id);
    if (result.affectedRows === 0) {
        const error = new Error('הסטודיו לא נמצא או שלא ניתן למחוק אותו (יתכן שיש נתונים מקושרים).');
        error.status = 404;
        throw error;
    }
    return { message: 'הסטודיו נמחק בהצלחה.' };
};

const assignNewAdmin = async ({ studioId, newAdminId }) => {
    if (!studioId || !newAdminId) {
        const error = new Error('מזהה סטודיו ומזהה מנהל חדש נדרשים.');
        error.status = 400;
        throw error;
    }
    
    const result = await studioModel.reassignAdmin(parseInt(studioId), parseInt(newAdminId));
    if (result.affectedRows === 0) {
        const error = new Error('הסטודיו או המשתמש החדש לא נמצאו, או שההרשאה לא השתנתה.');
        error.status = 404;
        throw error;
    }
    return { message: `מנהל חדש (ID: ${newAdminId}) שויך לסטודיו (ID: ${studioId}) בהצלחה.` };
};

module.exports = {
    getManagerDashboardDetails,
    getDashboardStats,
    getTodaysSchedule, 
    getFullSettings,     
    updateFullSettings,
    getAllStudios,
    createStudio,
    updateStudio,
    deleteStudio,
    assignNewAdmin
};