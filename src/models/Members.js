const mongoose = require("mongoose");

const MembersSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    image: [{ type: String, required: true }],
    post: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Members", MembersSchema);
