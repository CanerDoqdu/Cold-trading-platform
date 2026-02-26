import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false },
  googleId: { type: String, unique: true, sparse: true },
  authProvider: { type: String, enum: ['local', 'google'], default: 'local' },
  favorites: { type: [String], default: [] },
  lastActivity: { type: Date, default: Date.now },

  // ── Email verification ───────────────
  emailVerified: { type: Boolean, default: false },
  emailVerifyToken: { type: String, default: null },
  emailVerifyExpires: { type: Date, default: null },

  // ── 2FA (TOTP) ──────────────────────
  totpSecret: { type: String, default: null },        // encrypted
  totpEnabled: { type: Boolean, default: false },
  backupCodes: { type: [String], default: [] },        // hashed one-time codes

  // ── Password reset ──────────────────
  resetPasswordToken: { type: String, default: null }, // hashed token
  resetPasswordExpires: { type: Date, default: null },

  // ── Terms of Service ────────────────
  tosAcceptedAt: { type: Date, default: null },
  tosVersion: { type: String, default: null },

  // ── Account lockout (reference field) 
  failedLoginAttempts: { type: Number, default: 0 },
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// User signup
userSchema.statics.signup = async function (name, email, password) {
  const user = new this({ name, email, password });
  await user.save();
  return user;
};

// User login
userSchema.statics.login = async function (email, password) {
  const user = await this.findOne({ email });
  if (user) {
    if (user.authProvider === 'google' && !user.password) {
      throw Error("Please use Google Sign In for this account");
    }
    const match = await bcrypt.compare(password, user.password);
    if (match) {
      return user;
    }
  }
  throw Error("Invalid email or password");
};

// Google OAuth authentication
userSchema.statics.googleAuth = async function (googleId, email, name) {
  let user = await this.findOne({ googleId });
  
  if (user) {
    user.lastActivity = Date.now();
    await user.save();
    return user;
  }
  
  user = await this.findOne({ email });
  
  if (user) {
    user.googleId = googleId;
    user.authProvider = 'google';
    user.lastActivity = Date.now();
    await user.save();
    return user;
  }
  
  user = new this({
    name,
    email,
    googleId,
    authProvider: 'google',
  });
  await user.save();
  return user;
};

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;