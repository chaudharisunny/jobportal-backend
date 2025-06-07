const mongoose=require('mongoose')

const profileSchema=new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    },
    email:{
        type:String
    },
    phone:{
        type:String
    },
    location:{
        type:String
    },
    resume:{
        type:String
    },
    skill:{
        type:[String]
    },
    education:{
        type:String
    }
},{timestamps:true})


module.exports=mongoose.model("profile",profileSchema)