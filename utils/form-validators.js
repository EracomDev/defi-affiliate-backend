const advance_info = require("../MODALS/advanceInfo");
const UserData = require("../MODALS/userData");
const validator = require("email-validator");
const PhoneNumber = require('libphonenumber-js');

const bcrypt = require('bcrypt');
const passwordStrength = require('password-strength');
const { INVALID_USERNAME, EMAIL_ALREADY_EXISTS, INVALID_EMAIL, MOBILE_NUMBER_ALREADY_EXISTS, INVALID_MOBILE_NUMBER, SPONSOR_NOT_ACTIVE, INVALID_SPONSOR, PASSWORD_TOO_SHORT, PASSWORD_TOO_WEAK } = require("./errorMessages");
const hashPassword = async (plaintextPassword) => {
    const hash = await bcrypt.hash(plaintextPassword, 10);
    return hash;
};

const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

function generateString(length) {
    let result = "";
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
class FORM_VALIDATORS {
    async hashPassword(plaintextPassword) {
        const hash = await bcrypt.hash(plaintextPassword, 10);
        return hash;
    };
    async generateUserName(userName) {
        try {
            const { Registration } = await advance_info.findOne();
            const { user_gen_method, user_gen_prefix, user_gen_digit } = Registration;
            if (userName) {
                if (user_gen_method.value === "automatic") {
                    const number =
                        Math.floor(
                            Math.random() * ((10 ** (user_gen_digit.value) - 1) - 10 ** (user_gen_digit.value - 1) + 1) + 10 ** (user_gen_digit.value - 1)
                        );
                    const userNmae = `${user_gen_prefix.value}${number}`;
                    return { status: true, userName: userNmae };
                } else if (user_gen_method.value === "manual") {
                    var alfanum = /^[0-9a-zA-Z]+$/;
                    if (userName.match(alfanum)) {
                        return { status: true, userName };
                    } else {
                        throw INVALID_USERNAME;
                    }
                }
            } else {
                throw INVALID_USERNAME;
            }
        } catch (error) {
            throw error;
        }
    }
    async isEmail(email) {
        try {
            const { Registration } = await advance_info.findOne();
            const isEmail = await validator.validate(email);
            if (isEmail) {
                const email_users = await UserData.find({ email }).count();
                if (email_users < Registration.email_users.value) {
                    return { status: true };
                } else {
                    throw EMAIL_ALREADY_EXISTS;
                }
            } else {
                throw INVALID_EMAIL;
            }
        } catch (error) {
            throw error;
        }
    }
    async isMobile(mobile, countryCode) {
        try {
            const phoneNumber = await PhoneNumber(mobile, countryCode); // Change the country code according to your needs
            const { Registration } = await advance_info.findOne();
            console.log('phoneNumber', phoneNumber,mobile,countryCode)
            if (phoneNumber) {
                const mobile_users = await UserData.find({ mobile }).count();
                if (mobile_users >= Registration.mobile_users.value) {
                    throw MOBILE_NUMBER_ALREADY_EXISTS;
                }
                return { status: true };
            } else {
                throw INVALID_MOBILE_NUMBER;
            }
        } catch (error) {
            throw error;
        }
    }
    async sponsor(sponsor) {
        try {
            const { Registration } = await advance_info.findOne();
            const { is_sponsor_active_required,is_sponsor_required } = Registration;
            console.log("is_sponsor_required",is_sponsor_required)
            let sponsor_Data;

            if (is_sponsor_required.value=='no') {
                const spo = await UserData.findOne({ uid: 1 });
                sponsor_Data=spo;
            }else{
            const spo = await UserData.findOne({ user_name: sponsor });
            sponsor_Data=spo
            }

            if (sponsor_Data) {
                if (is_sponsor_active_required.value === "yes") {
                    if (sponsor_Data.status == 1) {
                        return { status: true, sponsor_Id: sponsor_Data.uid, name: sponsor_Data.name };
                    } else {
                        throw SPONSOR_NOT_ACTIVE;
                    }
                } else {
                    return { status: true, sponsor_Id: sponsor_Data.uid, name: sponsor_Data.name };
                }
            } else {
                return INVALID_SPONSOR;
            }
        } catch (error) {
            return  error;
        }
    }
    async generatePassword(password) {
        try {
            const { Registration } = await advance_info.findOne();
            const { pass_gen_method, pass_gen_fun, pass_gen_digit, is_password_required } = Registration;

            if (is_password_required.value === "yes") {
                if (pass_gen_method.value === "automatic") {
                    return generateString(pass_gen_digit.value);
                } else if (pass_gen_method.value === "manual") {
                    if (pass_gen_fun.value === "basic") {
                        if (password && password.length >= 4) {
                            return { status: true, password };
                        } else {
                            throw PASSWORD_TOO_SHORT;
                        }
                    } else if (pass_gen_fun.value === "strong") {
                        if (password && password.length >= 8) {
                            return { status: true, password };
                        } else {
                            throw PASSWORD_TOO_SHORT;
                        }
                    } else if (pass_gen_fun.value === "strongest") {
                        const isStrong = await passwordStrength(password);
                        if (isStrong === "Strong") {
                            return { status: true, password };
                        } else {
                            throw PASSWORD_TOO_WEAK;
                        }
                    }
                }
            } else {
                return { status: true, password: null };
            }
        } catch (error) {
            throw error;
        }
    }

}
const form_validator = new FORM_VALIDATORS();
module.exports = form_validator;