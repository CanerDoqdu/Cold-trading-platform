import connectToDatabase from "../../../lib/dbConnect"; // MongoDB bağlantısı
import User from "../../../models/userModel"; // Model dosya yolunu kontrol edin
import jwt from "jsonwebtoken";
import cookie from "cookie";

const createToken = (_id) => {
  return jwt.sign({ _id }, process.env.SECRET, { expiresIn: "3d" });
};

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "All fields must be filled." });
    }

    try {
      await connectToDatabase(); // MongoDB bağlantısını başlat
      const user = await User.signup(email, password); // Kullanıcı kaydet

      if (!user) {
        return res
          .status(400)
          .json({ error: "Signup failed, user not created." });
      }

      const token = createToken(user._id); // Token oluştur
      res.setHeader(
        "Set-Cookie",
        cookie.serialize("token", token, {
          httpOnly: true,
          maxAge: 3 * 24 * 60 * 60,
          path: "/",
        })
      );

      // Başarıyla kayıt olduktan sonra, istemciye başarı durumunu döndür
      return res.status(200).json({ _id: user._id, email: user.email });
    } catch (error) {
      console.error("Signup error:", error.message);
      return res.status(400).json({ error: error.message });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
