import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
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
    const match = await bcrypt.compare(password, user.password);
    if (match) {
      return user;
    }
  }
  throw Error("Invalid email or password");
};

// Modeli tekrar tanımlamamak için kontrol ekliyoruz
const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
