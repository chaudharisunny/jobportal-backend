const mongoose=require('mongoose')
const bcrypt=require('bcrypt')

const userSchema=new mongoose.Schema({
    username:{
        type:String,
        required:true
    },
     email:{
        type:String,
        required:true
    },
     password:{
        type:String,
        required:true
    },
     roll:{
        type:String,
        enum:["applicant","recruiter"],
        default:"applicant"
    },
    phone:{
        type:String
    },
    resume:{
        type:String
    },
    company:{
        type:String
    }
},{timestamps:true})


userSchema.pre('save',async function(next){
    if(!this.isModified('password'))return next();

    try {
        const saltRounds=10
        this.password=await bcrypt.hash(this.password,saltRounds)
    } catch (error) {
        next(error)
    }
})

userSchema.methods.comparePassword=async function(candidatePassword){
    return await bcrypt.compare(candidatePassword,this.password)
}

module.exports=mongoose.model("user",userSchema)