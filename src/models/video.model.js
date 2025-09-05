import mongoose,{Schema} from "mongoose";

const videoSchema = Schema({
  videoFile:{
    type: String, //cloudinary
    required:true
  },
  thumbnail : {
    type:String,
  },
  title:{
    type:String,
    required : true
  },
  description:{
    type:String,
    required:true,
  },
  duration:{
    type: Number,
    required: true,
  },
  views:{
    type: Number,
    default:0,
    required: true,
  },
  isPublished:{
    type:Boolean,
    required:true,
  },
},
{
  timestamps:true
})

export const video = mongoose.model('video',videoSchema)