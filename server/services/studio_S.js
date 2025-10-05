const studioModel = require('../models/studio_M');
const userModel = require('../models/user_M');
const { encWithSalt } = require('../middlewares/auth_Midd'); // <-- הוספנו את הייבוא החסר

const getManagerDashboardDetails = async (managerId) => {
    const [studioDetails, [[userDetails]]] = await Promise.all([
        studioModel.getStudioByManagerId(managerId),
        userModel.getById(managerId)
    ]);

    if (!studioDetails) {
        const error = new Error("Forbidden: User is not an admin of any studio or studio not found.");
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
        const error = new Error("Studio not found.");
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
    const { 
        name, address, phone_number,
        admin_full_name, admin_email, admin_userName, admin_password
    } = studioData;

    if (!name || !admin_full_name || !admin_email || !admin_userName || !admin_password) {
        throw new Error('All fields for studio and admin are required.');
    }

    const existingEmail = await userModel.getByEmail(admin_email);
    if (existingEmail) throw new Error("האימייל שהוזן כבר קיים במערכת");

    const existingUserName = await userModel.getByUserName(admin_userName);
    if (existingUserName) throw new Error("שם המשתמש תפוס, נסה שם אחר.");

    const existingStudio = await studioModel.getByName(name);
    if (existingStudio) throw new Error("סטודיו בשם זה כבר קיים במערכת");
    
    const password_hash = encWithSalt(admin_password);

    return studioModel.createStudioAndAdmin({
        studio_name: name,
        admin_full_name,
        email: admin_email,
        password_hash,
        userName: admin_userName,
        address,
        phone_number
    });
};

const updateStudio = async (id, studioData) => {
    return studioModel.update(id, studioData);
};

const deleteStudio = async (id) => {
    return studioModel.remove(id);
};

const assignNewAdmin = async ({ studioId, newAdminId }) => {
    if (!studioId || !newAdminId) {
        throw new Error('Studio ID and New Admin ID are required.');
    }
    return studioModel.reassignAdmin(parseInt(studioId), parseInt(newAdminId));
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