import "./globals.css";

export const metadata = {
  title: "Photo Gallery",
  description: "Log in to view the photo gallery.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
