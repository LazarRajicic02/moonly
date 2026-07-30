import { AppNav } from '@/components/app-nav';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-luna-hero lg:flex">
      <AppNav />
      <div className="mx-auto w-full max-w-lg flex-1 px-4 pb-32 pt-5 lg:max-w-5xl lg:px-10 lg:pb-10 lg:pt-10">
        {children}
      </div>
    </div>
  );
}
