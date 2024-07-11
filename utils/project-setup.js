const advance_info = require("../MODALS/advanceInfo");
const UserData = require("../MODALS/userData");
const UserWallet = require("../MODALS/userWallets");

class SETUP{
    async save_advance(){
        const advance = new advance_info()
       return await advance.save()
    }
    async save_first_user(){
        const user = new UserData({
            name:'demo',
            email:'demo@gmail.com',
            mobile:'1111111111',
            password: 'test',
            user_name: '0x451cD5F1ad5faf32978dF01B155BC03905b1aeb0',
            uid: 1,
            sponsor_Id: 0,
            sponsor_Name: 'demo',
            joining_date: new Date()
        })

      const savedUser =  await user.save()
        const wallet = new UserWallet({ uid: savedUser.uid});
        return await wallet.save();
       
    }
}

const project_setup = new SETUP();
module.exports = project_setup;