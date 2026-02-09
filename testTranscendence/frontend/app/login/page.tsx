import AcmeLogo from '@/app/ui/pong-logo';
import LoginForm from '@/app/ui/login-form';
import PongWars from '@/app/ui/pong-wars';
import Starfield from '@/app/ui/starfield';
import Link from 'next/link';
import { ButtonGlimmer } from '@/app/ui/button-glimmer';

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden font-sans">
      <Starfield />

      <header className="relative z-20 w-full border-b border-white/10 bg-black/60 backdrop-blur-md px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center justify-center bg-black p-2 rounded-md border border-white/20">
              <div className="w-20 text-white md:w-24">
                <AcmeLogo />
              </div>
            </div>
            <div className="hidden h-8 w-[1px] bg-white/20 md:block" />
            <div className="hidden md:flex flex-col">
              <h1 className="text-lg font-bold leading-none text-white">Welcome back</h1>
              <p className="text-[10px] uppercase tracking-widest text-blue-400 mt-1 font-bold">
                Authentication Required
              </p>
            </div>
          </div>
          
          {/* Animated */}
          <Link href="/signup">
            <ButtonGlimmer 
              glow={false} 
              className="bg-transparent border border-white/20 hover:bg-white/5 h-10 px-6 text-xs uppercase tracking-widest"
            >
              Create Account
            </ButtonGlimmer>
          </Link>
        </div>
      </header>

      <section className="relative z-10 flex flex-1 items-center justify-center px-6">
        <div className="flex w-full max-w-7xl flex-col items-center justify-between gap-12 lg:flex-row">
          <div className="w-full max-w-[480px]">
            {/* Space-themed glass card container */}
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 p-8 shadow-2xl backdrop-blur-xl">
              {/* Ambient glow effect */}
              <div className="absolute -top-24 -right-24 h-48 w-48 bg-blue-500/20 blur-3xl rounded-full" />
              <div className="absolute -bottom-24 -left-24 h-48 w-48 bg-indigo-500/20 blur-3xl rounded-full" />

              {/* Content */}
              <div className="relative">
                <LoginForm />
              </div>
            </div>
          </div>
          <div className="hidden flex-1 items-center justify-center lg:flex">
             <div className="relative aspect-square w-full max-w-[500px] overflow-hidden rounded-2xl border border-white/10 bg-black/40 shadow-2xl">
                <PongWars />
             </div>
          </div>
        </div>
      </section>

      <footer className="relative z-20 p-8 text-center text-[10px] uppercase tracking-tighter text-slate-500">
        © 2025 42 PONG • Secure Dashboard Access
      </footer>
    </main>
  );
}