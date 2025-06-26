const mongoose=require('mongoose')

const applicationSchema=new mongoose.Schema({
     job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'job',
    required: true
  },
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },

  resume: {
  data: Buffer,
  contentType: String,
  name: String
},
  appliedAt: {
    type: Date,
    default: Date.now
  }
},{timestamps:true})



module.exports=mongoose.model("application",applicationSchema)