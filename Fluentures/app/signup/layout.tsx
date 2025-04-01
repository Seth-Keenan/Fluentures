export default function RootLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    return (
      <html lang="en" data-theme="retro">
        <body>
          {children}
        </body>
      </html>
    );
  }  