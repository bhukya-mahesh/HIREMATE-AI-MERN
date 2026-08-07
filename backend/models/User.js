import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    // Basic Information
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    // Academic Details
    branch: {
      type: String,
      default: "ECE",
    },

    semester: {
      type: Number,
      default: 6,
    },

    // Resume
resume: {
  filename: { type: String },
  path: { type: String },
  uploadedAt: { type: Date }
},

    // Skill Profile
    skillProfile: {
      known: [
        {
          type: String,
        },
      ],

      gaps: [
        {
          type: String,
        },
      ],

      roadmap: [
        {
          topic: String,

          day: Number,

          done: {
            type: Boolean,
            default: false,
          },
        },
      ],
    },

    // AI Resume Match
    resumeMatchScore: {
      type: Number,
      default: 0,
    },

    // Daily Motivation
    streak: {
      type: Number,
      default: 0,
    },

    lastActiveDate: Date,
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);

  this.password = await bcrypt.hash(this.password, salt);

  next();
});

userSchema.methods.matchPassword = function (enteredPassword) {
  return bcrypt.compare(
    enteredPassword,
    this.password
  );
};

export default mongoose.model(
  "User",
  userSchema
);