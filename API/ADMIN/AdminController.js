const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Admin = require('../../MODALS/Admin');
const { loginSuccess, registrationSuccess } = require('../../utils/successMessages');
const { INTERNAL_SERVER_ERROR,INVALID_CREDENTIALS } = require('../../utils/errorMessages');

class ADMIN {
    async login(req, res) {
        const {username,password} = req.body;
        // console.log(req.body)
        try {
            const admin = await Admin.findOne({ username });
            if (!admin) {
                // console.log('here',"***************")

                return res.status(401).json({ ...INVALID_CREDENTIALS });
            }

            const isMatch = await bcrypt.compare(password, admin.password);
            if (!isMatch) {
                // console.log('here',"==========", isMatch)
                return res.status(401).json({ ...INVALID_CREDENTIALS });
            }

            const payload = {
                uid: admin.uid,
                user_name: admin.username,
                role: 'admin'
            };

            // Example secret key for signing the token
            const secretKey = process.env.JWT_KEY;
            const token = jwt.sign(payload, secretKey);
            res.status(200).json({ ...loginSuccess, token, admin });
        } catch (error) {
            console.error(error);
            res.status(500).json({ ...INTERNAL_SERVER_ERROR });
        }
    }
    async createAdmin(req, res) {
        const { username, password } = req.body;
        try {
            // Check if admin with the same username already exists
            const existingAdmin = await Admin.findOne({ username });
            if (existingAdmin) {
                return res.status(400).json({ message: 'Admin with this username already exists' });
            }

            // Hash the password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create new admin
            const newAdmin = new Admin({ username, password: hashedPassword ,uid:1});
            await newAdmin.save();

            res.status(201).json({ ...registrationSuccess, admin: newAdmin });
        } catch (error) {
            console.error(error);
            res.status(500).json({ ...INTERNAL_SERVER_ERROR });
        }
    }
}
const AdminController = new ADMIN();
module.exports = AdminController;
