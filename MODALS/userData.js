const mongoose = require("mongoose");
const Activity = require("./Activity");
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: false,
  },
  email: {
    type: String,
    required: false,
  },
  mobile: {
    type: String,
    unique: false,
  },
  password: {
    type: String,
    required: false,
  },
  status: {
    type: Number,
    default: 0,
  },
  uid: {
    type: Number,
    unique: true,
  },
  user_name: {
    type: String,
    unique: true,
  },
  sponsor_Id: {
    type: Number,
    // required:true
  },
  sponsor_Name:{
    type: String,
  },
  joining_date: {
    type: Date,
    
  },
  Activation_date: {
    type: Date,
    default: null,
  },
  allowedActivities: {type:Array}
});
userSchema.pre('save', async function(next) {
  const allowedActivities = await Activity.find({ allowed_for:{ $in: ['user'] }});
  const activityIds = allowedActivities.map(activity => activity.a_id);
  this.allowedActivities = activityIds;
  next();
});
const UserData = new mongoose.model("UserData", userSchema);
module.exports = UserData;
