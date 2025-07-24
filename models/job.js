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


// For full-text search
jobSchema.index({ title: 'text', company: 'text' });

// For fast filtering
jobSchema.index({ category: 1 });
jobSchema.index({ skill: 1 });
jobSchema.index({ createdAt: -1 }); // Helps sort recent jobs

module.exports=mongoose.model("job",jobSchema)