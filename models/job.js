const mongoose=require('mongoose')

const jobSchema=new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
     description:{
        type:[String],
        required:true
    },
    
    location:{
        type:String,
        required:true 
    },
    
  appliedUsers: [{
  type: mongoose.Schema.Types.ObjectId,
  ref: 'user',
}],
     company:{
        type:String,
        required:true
    },
     category:{
        type:String,
        enum:["part-time","full-time","remote"],
        required:true 
    },
    skill:{
        type:[String],
        required:true 
    },
    salaryRange:{
        type:String,
        required:true
    },
    postedBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
        required:true 
    },
    recruiter:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user" 
    },
    deadline:{
        type:Date 
    }
},{timestamps:true})



module.exports=mongoose.model("job",jobSchema)