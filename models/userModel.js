import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false }, // Not required for OAuth users
  googleId: { type: String, unique: true, sparse: true }, // Google OAuth ID
  authProvider: { type: String, enum: ['local', 'google'], default: 'local' },
  favorites: { type: [String], default: [] }, // Favori coin ID'leri
  lastActivity: { type: Date, default: Date.now }, // Son aktivite zamanı
});

// Şifreyi hashleme
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Kullanıcı kaydı
userSchema.statics.signup = async function (name, email, password) {
  const user = new this({ name, email, password });
  await user.save();
  return user;
};

// Kullanıcı girişi
userSchema.statics.login = async function (email, password) {
  const user = await this.findOne({ email });
  if (user) {
    // Check if user signed up with Google
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

// Google OAuth login/signup
userSchema.statics.googleAuth = async function (googleId, email, name) {
  // Check if user exists with this Google ID
  let user = await this.findOne({ googleId });
  
  if (user) {
    // Update last activity and return existing user
    user.lastActivity = Date.now();
    await user.save();
    return user;
  }
  
  // Check if user exists with this email (signed up with email/password)
  user = await this.findOne({ email });
  
  if (user) {
    // Link Google account to existing user
    user.googleId = googleId;
    user.authProvider = 'google';
    user.lastActivity = Date.now();
    await user.save();
    return user;
  }
  
  // Create new user with Google
  user = new this({
    name,
    email,
    googleId,
    authProvider: 'google',
  });
  await user.save();
  return user;
};

// Modeli tekrar tanımlamamak için kontrol ekliyoruz
const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
