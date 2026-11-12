// frontend/app/(public)/layout.tsx

import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="flex-grow pt-4 md:pt-6 pb-8 md:pb-12">
        {children}
      </main>
      <Footer />
    </>
  );
}