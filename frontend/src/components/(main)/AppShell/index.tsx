import { CategoryNav } from "../CategoryNav";
import { TopBar } from "../TopBar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <TopBar />
      <CategoryNav />
      <div className="mx-auto w-full max-w-[1440px] px-6 py-6">{children}</div>
    </div>
  );
}
