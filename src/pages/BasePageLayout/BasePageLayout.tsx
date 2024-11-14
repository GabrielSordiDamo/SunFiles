import Header from "@/components/Header/Header.tsx";
import Footer from "@/components/Footer/Footer.tsx";
import { ReactNode } from "react";

interface BaseLayoutProps {
  children: ReactNode;
}
const BasePageLayout = ({ children }: BaseLayoutProps) => {
  return (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark text-neutral-900 dark:text-neutral-50">
      <Header />
      <main className="flex-grow   ">{children}</main>
      <Footer />
    </div>
  );
};

export default BasePageLayout;
