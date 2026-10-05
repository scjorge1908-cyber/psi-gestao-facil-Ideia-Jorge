import "./globals.css";

export const metadata = {
  title: "Psi Gestão Fácil",
  description: "Gestão simples para psicólogas(os) independentes",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
