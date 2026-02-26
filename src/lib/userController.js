import jwt from "jsonwebtoken";
import User from "@/models/userModel";
import { setCookie } from "cookies-next";

const createToken = (userId) => {
  return jwt.sign({ _id: userId }, process.env.SECRET, { expiresIn: "3d" });
};

export const signupUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "All fields must be filled." });
  }

  try {
    const user = await User.signup(email, password);
    
    if (!user) {
      return res.status(400).json({ error: "Signup failed, user not created." });
    }

    const token = createToken(user._id);

    setCookie("token", token, {
      req,
      res,
      httpOnly: true,
      maxAge: 3 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({ email });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "All fields must be filled." });
  }

  try {
    const user = await User.login(email, password);

    if (!user) {
      return res.status(400).json({ error: "Login failed." });
    }

    const token = createToken(user._id);

    setCookie("token", token, {
      req,
      res,
      httpOnly: true,
      maxAge: 3 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({ email });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};
