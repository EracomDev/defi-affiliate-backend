const mongoose = require('mongoose');
const dbName = process.env.DB_NAME;
const username = process.env.DB_USER;
const password = encodeURIComponent(process.env.DB_PASSWORD)
// mongodb://gamepitara:game%40458%40%2377@91.108.111.238:1322/?authSource=admin
// const uri = `mongodb://${username}:${password}@localhost:1322/${dbName}?authSource=admin`
const uri = `mongodb://127.0.0.1:27017/${dbName}`;

mongoose.set("strictQuery", false);
mongoose.connect(uri,{
   
    useNewUrlParser:true
}).then(()=>{
    console.log('mongoose connected successfully')
    // user_data.getAdvance()
}).catch((e)=>{
    console.log(e)
})
// mongodb+srv://eracom:eracom12345@cluster0.a5mjvlj.mongodb.net