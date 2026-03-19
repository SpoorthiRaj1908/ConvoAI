import mongoose from "mongoose";


const msgSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ["user", "assistant"],
    required: true
  },

  content: {
    type: String,
    required: true
  },

  timestamp: {
    type: Date,
    default: Date.now
  }

});



const threadSchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  threadid: {
    type: String,
    required: true,
    unique: true
  },

  title: {
    type: String,
    default: "new chat"
  },

  messages: [msgSchema]

}, {
  timestamps: true
});



export default mongoose.model("Thread", threadSchema);