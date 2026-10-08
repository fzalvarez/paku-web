import { Header } from "./Header";
import { Footer } from "./Footer";
import { TopRibbon } from "./TopRibbon";

interface MainLayoutProps {
  children: React.ReactNode;
}

/**
 * Layout principal que envuelve las páginas con Header y Footer.
 * TODO: Añadir providers si son necesarios (temas, auth, etc.).
 */
export function MainLayout({ children }: MainLayoutProps) {
  return (
    <>
      <TopRibbon />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
