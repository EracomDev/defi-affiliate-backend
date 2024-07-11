const advance_info = require("../../MODALS/advanceInfo");
const UserData = require("../../MODALS/userData");
const UserWallet = require("../../MODALS/userWallets");
const { INVALID_CREDENTIALS, INTERNAL_SERVER_ERROR, USERNAME_ALREADY_EXISTS, INVALID_USERNAME } = require("../../utils/errorMessages");
const form_validator = require("../../utils/form-validators");
const { registrationSuccess, loginSuccess } = require("../../utils/successMessages");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
class PROFILE {


    async register(req, res, next) {
        console.log(req.body)
        try {
            const { name, email, mobile, password, sponsor, user_name, country_code } = req.body;
            const { Registration } = await advance_info.findOne();
            const { is_mobile_required, is_email_required, is_password_required,is_sponsor_required } = Registration;
            const validUserNameResult = await form_validator.generateUserName(user_name||'demo');
            if (!validUserNameResult.status) {
                res.status(INVALID_USERNAME.code).json({...INVALID_USERNAME});
                return;
            }

            // Validate email if required
            const isEmail = is_email_required.value === "yes" ? await form_validator.isEmail(email) : { status: true };
            if (!isEmail.status) {
                res.status(400).json({isEmail});
                return;
            }

            // Validate mobile if required
            const isMobile = is_mobile_required.value === "yes" ? await form_validator.isMobile(mobile, country_code) : { status: true };
            if (!isMobile.status) {
                res.status(400).json({isMobile});
                return;
            }

            // Validate sponsor
            const sponsorData = await form_validator.sponsor(sponsor || 'demo');
            if (!sponsorData.status) {
                res.status(400).json({sponsorData});
                return;
            }

            // Check if username already exists
            const isUsernameExist = await UserData.findOne({ user_name: validUserNameResult.userName });
            if (isUsernameExist) {
                // next()
                res.status(USERNAME_ALREADY_EXISTS.code).json({...USERNAME_ALREADY_EXISTS});
                return;
            }

            // Generate password if required
            const isStrongPassword = is_password_required.value === "yes" ? await form_validator.generatePassword(password) : { status: true };
            if (!isStrongPassword.status) {
                res.status(400).json({isStrongPassword});
                return;
            }

            // Save user details
            const totalUsers = await UserData.find().count();
            const hashedPassword = is_password_required.value === "yes" ? await form_validator.hashPassword(isStrongPassword.password) : password;
            const user = new UserData({
                name,
                email,
                mobile,
                password: hashedPassword,
                user_name: validUserNameResult.userName,
                uid: totalUsers + 1,
                sponsor_Id: sponsorData.sponsor_Id,
                sponsor_Name: sponsorData.name,
                joining_date: new Date()
            });
            const User = await user.save();
            const payload = {
                uid: User.uid,
                user_name: User.user_name,
                role: 'user'
            };

            // Example secret key for signing the token
            const secretKey = process.env.JWT_KEY;
            const token = jwt.sign(payload, secretKey);
            // next()
            const wallet = new UserWallet({uid:User.uid})
            wallet.save()
            res.status(200).json({ ...registrationSuccess, token, User });
            return;
        } catch (error) {
            console.log(error)
            res.status(500).json({...INTERNAL_SERVER_ERROR})
            return;
        }
    }

   async registerWithDap(req, res, next) {
    console.log(req.body);
    try {
        const { sponsorWalletAddress, userWalletAddress } = req.body;

        // Ensure the required fields are present
        if (!sponsorWalletAddress || !userWalletAddress) {
            return res.status(400).json({ error: "Sponsor wallet address and user wallet address are required." });
        }

        // Validate the sponsor wallet address
        const sponsorData = await form_validator.sponsor(sponsorWalletAddress);
        console.log("sponsorData",sponsorData)
        if (!sponsorData.status) {
            return res.status(400).json(sponsorData);
        }


        // Check if username already exists
        const isUsernameExist = await UserData.findOne({ user_name: userWalletAddress });
        if (isUsernameExist) {
            return res.status(USERNAME_ALREADY_EXISTS.code).json({ ...USERNAME_ALREADY_EXISTS });
        }

        // Save user details
        const totalUsers = await UserData.countDocuments();
        const user = new UserData({
            user_name: userWalletAddress,
            uid: totalUsers + 1,
            sponsor_Id: sponsorData.sponsor_Id,
            wallet_address:userWalletAddress,
            joining_date: new Date()
        });
        const savedUser = await user.save();
        console.log("savedUser",savedUser)

        // Create a token for the user
        const payload = {
            uid: savedUser.uid,
            user_name: savedUser.user_name,
            role: 'user'
        };
        const secretKey = process.env.JWT_KEY;
        const token = jwt.sign(payload, secretKey);

        // Create a wallet for the user
        const wallet = new UserWallet({uid:savedUser.uid})
            wallet.save()

        // Respond with success
        return res.status(200).json({ ...registrationSuccess, token, user: savedUser });
    } catch (error) {
        console.error("error11111111111111111111111",error);
        return res.status(500).json({ ...INTERNAL_SERVER_ERROR });
    }
    }

    async loginWithDap(req, res) {
        const {user_name} = req.body;
        try {
            const user = await UserData.findOne({ user_name });
            if (!user) {
                return res.status(401).json({ ...INVALID_CREDENTIALS });
            }
            const payload = {
                uid: user.uid,
                user_name: user.user_name,
                role: 'user'
            };
            // Example secret key for signing the token
            const secretKey = process.env.JWT_KEY;
            const token = jwt.sign(payload, secretKey);
            res.status(200).json({ ...loginSuccess, token, user });
        } catch (error) {
            console.error('Error during login:', error);
            res.status(500).json({ ...INTERNAL_SERVER_ERROR });
        }
    }
    async login(req, res) {
        const { user_name, password } = req.body;
        try {
            const user = await UserData.findOne({ user_name });
            if (!user) {
                return res.status(401).json({ ...INVALID_CREDENTIALS });
            }
            const passwordMatch = await bcrypt.compare(password, user.password);
            if (!passwordMatch) {
                return res.status(401).json({ ...INVALID_CREDENTIALS });
            }
            const payload = {
                uid: user.uid,
                user_name: user.user_name,
                role: 'user'
            };

            // Example secret key for signing the token
            const secretKey = process.env.JWT_KEY;
            const token = jwt.sign(payload, secretKey);
            res.status(200).json({ ...loginSuccess, token, user });
        } catch (error) {
            console.error('Error during login:', error);
            res.status(500).json({ ...INTERNAL_SERVER_ERROR });
        }
    }
    async get_profile(req, res) {
        try {
            const {uid} = req.user;
           const {user_name,name,email,mobile,status,sponsor_Name,joining_date,Activation_date} = await UserData.findOne({uid})
           if(!user_name){
            res.status(500).json({INTERNAL_SERVER_ERROR})
           }
           res.status(200).json({user_name,name,email,mobile,status,sponsor_Name,joining_date,Activation_date})
        } catch (error) {
            console.log(error)
            res.status(500).json({INTERNAL_SERVER_ERROR})
        }
    }
    async updatePassword(req, res) {
        try {
            const { uid } = req.user; // Assuming the user is authenticated and `req.user` is populated
            const { currentPassword, newPassword } = req.body;

            // Fetch the user from the database
            const user = await UserData.findOne({ uid });
            if (!user) {
                return res.status(401).json({ ...INVALID_CREDENTIALS });
            }

            // Validate the current password
            const passwordMatch = await bcrypt.compare(currentPassword, user.password);
            if (!passwordMatch) {
                return res.status(401).json({ ...INVALID_CREDENTIALS });
            }

            // Validate the new password
            const isStrongPassword = await form_validator.generatePassword(newPassword);
            if (!isStrongPassword.status) {
                return res.status(400).json({ isStrongPassword });
            }

            // Hash the new password
            const hashedNewPassword = await form_validator.hashPassword(isStrongPassword.password);

            // Update the password in the database
            user.password = hashedNewPassword;
            await user.save();

            res.status(200).json({ message: "Password updated successfully." });
        } catch (error) {
            console.error('Error during password update:', error);
            res.status(500).json({ ...INTERNAL_SERVER_ERROR });
        }
    }
    async updateProfile(req, res) {
        try {
            const { uid } = req.user; // Assumes the user is authenticated and `req.user` is populated
            const { name, email, mobile, user_name, country_code } = req.body;
            
            // Find the user by UID
            const user = await UserData.findOne({ uid });
            if (!user) {
                return res.status(401).json({ ...INVALID_CREDENTIALS });
            }
            
            // Validate user_name
            if (user_name) {
                const validUserNameResult = await form_validator.generateUserName(user_name);
                if (!validUserNameResult.status) {
                    return res.status(INVALID_USERNAME.code).json({ ...INVALID_USERNAME });
                }
                
                // Check if the username is taken by another user
                const isUsernameExist = await UserData.findOne({ user_name: validUserNameResult.userName, uid: { $ne: uid } });
                if (isUsernameExist) {
                    return res.status(USERNAME_ALREADY_EXISTS.code).json({ ...USERNAME_ALREADY_EXISTS });
                }
                user.user_name = validUserNameResult.userName;
            }

            // Validate email
            if (email) {
                const isEmail = await form_validator.isEmail(email);
                if (!isEmail.status) {
                    return res.status(400).json({ isEmail });
                }
                user.email = email;
            }

            // Validate mobile
            if (mobile) {
                const isMobile = await form_validator.isMobile(mobile, country_code);
                if (!isMobile.status) {
                    return res.status(400).json({ isMobile });
                }
                user.mobile = mobile;
            }

            // Update name
            if (name) {
                user.name = name;
            }

            // Save the updated user
            await user.save();

            res.status(200).json({ message: "Profile updated successfully.", user });
        } catch (error) {
            console.error('Error during profile update:', error);
            res.status(500).json({ ...INTERNAL_SERVER_ERROR });
        }
    }
}
const profile = new PROFILE();
module.exports = profile;