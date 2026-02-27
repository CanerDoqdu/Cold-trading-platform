import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcrypt';

/* ── Interfaces ───────────────────────────────────────────── */

export interface IUser {
  name: string;
  email: string;
  password?: string;
  googleId?: string;
  authProvider: 'local' | 'google';
  avatar?: string;
  favorites: string[];
  lastActivity: Date;

  /* Email verification */
  emailVerified: boolean;
  emailVerifyToken?: string | null;
  emailVerifyExpires?: Date | null;

  /* 2FA (TOTP) */
  totpSecret?: string | null;
  totpEnabled: boolean;
  backupCodes: string[];

  /* Password reset */
  resetPasswordToken?: string | null;
  resetPasswordExpires?: Date | null;

  /* Terms of Service */
  tosAcceptedAt?: Date | null;
  tosVersion?: string | null;

  /* Account lockout */
  failedLoginAttempts: number;

  /* Paper trading balance — integer minor units (USD cents) stored as string */
  paperBalanceMinor: string;

  /* NFT watchlist — collection slugs the user is tracking */
  nftWatchlist: string[];

  /* Soft delete */
  deletedAt?: Date | null;

  /* Mongoose version key for optimistic locking */
  __v: number;

  createdAt: Date;
  updatedAt: Date;
}

export interface IUserDocument extends IUser, Document {
  _id: mongoose.Types.ObjectId;
}

export interface IUserModel extends Model<IUserDocument> {
  signup(name: string, email: string, password: string): Promise<IUserDocument>;
  login(email: string, password: string): Promise<IUserDocument>;
  googleAuth(googleId: string, email: string, name: string): Promise<IUserDocument>;
}

/* ── Schema ───────────────────────────────────────────────── */

const userSchema = new Schema<IUserDocument, IUserModel>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: false },
    googleId: { type: String, default: undefined },
    authProvider: { type: String, enum: ['local', 'google'], default: 'local' },
    avatar: { type: String, default: undefined },
    favorites: { type: [String], default: [] },
    lastActivity: { type: Date, default: Date.now },

    // Email verification
    emailVerified: { type: Boolean, default: false },
    emailVerifyToken: { type: String, default: null },
    emailVerifyExpires: { type: Date, default: null },

    // 2FA
    totpSecret: { type: String, default: null },
    totpEnabled: { type: Boolean, default: false },
    backupCodes: { type: [String], default: [] },

    // Password reset
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },

    // Terms of Service
    tosAcceptedAt: { type: Date, default: null },
    tosVersion: { type: String, default: null },

    // Account lockout
    failedLoginAttempts: { type: Number, default: 0 },

    // Paper trading balance (USD cents as string — $10,000.00 default)
    paperBalanceMinor: { type: String, default: '1000000' },

    // NFT watchlist (collection slugs)
    nftWatchlist: { type: [String], default: [] },

    // Soft delete
    deletedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    optimisticConcurrency: true,
  },
);

/* ── Indexes ──────────────────────────────────────────────── */

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ googleId: 1 }, { unique: true, sparse: true });
userSchema.index({ emailVerifyToken: 1 }, { sparse: true });
userSchema.index({ resetPasswordToken: 1 }, { sparse: true });
userSchema.index({ deletedAt: 1 });

/* ── Middleware ────────────────────────────────────────────── */

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (this.isModified('password') && this.password) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

/* ── Statics ──────────────────────────────────────────────── */

userSchema.statics.signup = async function (
  name: string,
  email: string,
  password: string,
): Promise<IUserDocument> {
  const user = new this({ name, email, password });
  await user.save();
  return user;
};

userSchema.statics.login = async function (
  email: string,
  password: string,
): Promise<IUserDocument> {
  const user = await this.findOne({ email });
  if (user) {
    if (user.authProvider === 'google' && !user.password) {
      throw new Error('Please use Google Sign In for this account');
    }
    if (user.password) {
      const match = await bcrypt.compare(password, user.password);
      if (match) return user;
    }
  }
  throw new Error('Invalid email or password');
};

userSchema.statics.googleAuth = async function (
  googleId: string,
  email: string,
  name: string,
): Promise<IUserDocument> {
  let user = await this.findOne({ googleId });
  if (user) {
    user.lastActivity = new Date();
    await user.save();
    return user;
  }

  user = await this.findOne({ email });
  if (user) {
    user.googleId = googleId;
    user.authProvider = 'google';
    user.lastActivity = new Date();
    await user.save();
    return user;
  }

  user = new this({ name, email, googleId, authProvider: 'google' });
  await user.save();
  return user;
};

/* ── Export ────────────────────────────────────────────────── */

const User: IUserModel =
  (mongoose.models.User as IUserModel) ||
  mongoose.model<IUserDocument, IUserModel>('User', userSchema);

export default User;
