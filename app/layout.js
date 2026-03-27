import "./globals.css";

export const metadata = {
  title: "Unwall – Your Clean Read Dashboard",
  description:
    "Save Medium articles, read them distraction-free, and get AI-powered summaries. Your personal reading dashboard.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
