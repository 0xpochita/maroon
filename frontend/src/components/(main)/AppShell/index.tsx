import { Suspense } from "react";
import { CategoryNav } from "../CategoryNav";
import { Footer } from "../Footer";
import { TopBar } from "../TopBar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <TopBar />
      <Suspense>
        <CategoryNav />
      </Suspense>
      <main className="mx-auto w-full max-w-[1440px] flex-1 px-6 py-6">
        {children}
      </main>
      <Footer />
    </div>
  );
}
