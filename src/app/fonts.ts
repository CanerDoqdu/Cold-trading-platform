import { Titillium_Web } from "next/font/google";

const titillium_Web = Titillium_Web({
  weight: ["400"],
  style: ["normal"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-titillium_web",
  preload: true,
});
export default titillium_Web;
