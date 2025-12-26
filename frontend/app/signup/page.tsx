import AcmeLogo from '@/app/ui/pong-logo';
import SignupForm from '@/app/ui/signup-form';
import PongWars from '@/app/ui/pong-wars';
import Starfield from '@/app/ui/starfield';
import Link from 'next/link';
import { ButtonGlimmer } from '@/app/ui/button-glimmer';

export default function SignupPage() {
  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden font-sans selection:bg-indigo-500/30">
      <Starfield />

      <header className="relative z-20 w-full border-b border-white/5 bg-slate-950/40 backdrop-blur-lg px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center justify-center rounded-xl bg-indigo-600 p-2 shadow-lg shadow-indigo-500/20">
              <div className="w-20 text-white md:w-24">
                <AcmeLogo />
              </div>
            </div>
            <div className="hidden h-8 w-[1px] bg-white/10 md:block" />
            <div className="hidden md:flex flex-col">
              <h1 className="text-lg font-bold leading-none text-white tracking-tight">
                Join the Arena
              </h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-indigo-400 mt-1 font-bold">
                Account Registration
              </p>
            </div>
          </div>

          {/* Animated */}
          <Link href="/login">
            <ButtonGlimmer 
              glow={false} 
              className="bg-transparent border border-white/20 hover:bg-white/5 h-10 px-6 text-xs uppercase tracking-widest"
            >
              Sign In
            </ButtonGlimmer>
          </Link>
        </div>
      </header>

      <section className="relative z-10 flex flex-1 items-center justify-center px-6 py-12">
        <div className="flex w-full max-w-6xl flex-col items-center justify-between gap-12 lg:flex-row">
          <div className="w-full max-w-[420px] animate-in fade-in slide-in-from-left-4 duration-700">
            <div className="overflow-hidden rounded-[32px] border border-white/20 bg-white/95 p-1 shadow-2xl backdrop-blur-xl">
              <div className="rounded-[28px] bg-white p-8 lg:p-10">
                <SignupForm />
              </div>
            </div>
          </div>
          <div className="hidden flex-1 items-center justify-center lg:flex">
             <div className="relative aspect-square w-full max-w-[480px] overflow-hidden rounded-[40px] border border-white/10 bg-black/40 shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 via-transparent to-transparent pointer-events-none" />
                <PongWars />
             </div>
          </div>
        </div>
      </section>

      <footer className="relative z-20 w-full p-8 text-center text-[11px] font-medium uppercase tracking-tighter text-slate-500">
        Already part of the network? <Link href="/login" className="text-indigo-400 hover:underline">Log in</Link> • Secure Registration
      </footer>
    </main>
  );
}