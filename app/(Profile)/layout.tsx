import "../globals.css";
import titillium_Web from "../fonts";
import { AuthContextProvider } from "@/context/AuthContext";

export const metadata = {
  title: 'Profile - COLD',
  description: 'Manage your COLD profile and account settings',
}

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${titillium_Web.variable}`}>
      <body className="bg-black antialiased" suppressHydrationWarning>
        <AuthContextProvider>
          {children}
        </AuthContextProvider>
      </body>
    </html>
  )
}
