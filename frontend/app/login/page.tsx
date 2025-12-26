import AcmeLogo from '@/app/ui/pong-logo';
import LoginForm from '@/app/ui/login-form'; // Ensure this uses ButtonGlimmer
import PongWars from '@/app/ui/pong-wars';
import Starfield from '@/app/ui/starfield';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden font-sans">
      {/* 1. Background Starfield Script */}
      <Starfield />

      {/* 2. Global Header Bar: Horizontal Symmetry */}
      <header className="relative z-20 w-full border-b border-white/10 bg-black/60 backdrop-blur-md px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-6">
            {/* Branding - Clean Black Box matching Dashboard Sidebar */}
            <div className="flex items-center justify-center bg-black p-2 rounded-md border border-white/20">
              <div className="w-20 text-white md:w-24">
                <AcmeLogo />
              </div>
            </div>

            {/* Vertical Divider for Hierarchy */}
            <div className="hidden h-8 w-[1px] bg-white/20 md:block" />

            {/* Contextual Text */}
            <div className="hidden md:flex flex-col">
              <h1 className="text-lg font-bold leading-none text-white">Welcome back</h1>
              <p className="text-[10px] uppercase tracking-widest text-blue-400 mt-1 font-bold">
                Authentication Required
              </p>
            </div>
          </div>
          
          <Link href="/signup" className="text-xs font-bold text-white/70 hover:text-white transition-colors uppercase tracking-widest">
            Create Account
          </Link>
        </div>
      </header>

      {/* 3. Main Content: Symmetrical Layout */}
      <section className="relative z-10 flex flex-1 items-center justify-center px-6">
        <div className="flex w-full max-w-7xl flex-col items-center justify-between gap-12 lg:flex-row">
          
          {/* Left Column: Login Form (Dashboard Style Card) */}
          <div className="w-full max-w-[400px]">
            <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-2xl">
              {/* Ensure your LoginForm.tsx uses the ButtonGlimmer for the submit button */}
              <LoginForm />
            </div>
          </div>

          {/* Right Column: Pong Wars Animation */}
          <div className="hidden flex-1 items-center justify-center lg:flex">
             <div className="relative aspect-square w-full max-w-[500px] overflow-hidden rounded-2xl border border-white/10 bg-black/40 shadow-2xl">
                <PongWars />
             </div>
          </div>
        </div>
      </section>

      {/* 4. Footer */}
      <footer className="relative z-20 p-8 text-center text-[10px] uppercase tracking-tighter text-slate-500">
        © 2025 42 PONG • Secure Dashboard Access
      </footer>
    </main>
  );
}