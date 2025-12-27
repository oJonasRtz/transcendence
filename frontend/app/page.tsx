import AcmeLogo from '@/app/ui/pong-logo';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import Starfield from '@/app/ui/starfield';
import NewPong from '@/app/ui/new-pong'; 
import { ButtonGlimmer } from '@/app/ui/button-glimmer';

export default function Page() {
  const team = [
    { name: "Seiji", role: "Full Stack + DevOps" },
    { name: "Fernando", role: "Full Stack" },
    { name: "Jonas", role: "Game Logic" },
    { name: "Nasser", role: "Full Stack" },
    { name: "José", role: "Full Stack" },
  ];

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden font-sans text-white">
      {/* 1. Background Universe */}
      <Starfield />
      <div className="fixed -left-[20%] top-0 h-[800px] w-[800px] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="fixed -right-[20%] bottom-0 h-[800px] w-[800px] bg-indigo-600/10 blur-[150px] rounded-full pointer-events-none" />

      {/* 2. Content Container */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-12 lg:flex-row lg:gap-20 max-w-[1600px] mx-auto w-full">
        
        {/* LEFT COLUMN: Project Identity & Team */}
        <div className="flex w-full max-w-xl flex-col justify-center space-y-10 lg:w-1/2 animate-in fade-in slide-in-from-left-8 duration-1000">
          
          {/* Header Badge */}
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            <span className="text-xs font-bold uppercase tracking-widest text-slate-300">
              42 Network // Transcendence
            </span>
          </div>

          {/* Title Area - RENAMED TO NEW PONG */}
          <div className="space-y-4">
            <h1 className="text-6xl font-black tracking-tighter sm:text-7xl lg:text-8xl">
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40">
                NEW
              </span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
                PONG
              </span>
            </h1>
            <p className="max-w-md text-lg text-slate-400 leading-relaxed">
              The ultimate multiplayer experience. Real-time matches, live chat, and competitive ladders reimagined for the modern web.
            </p>
          </div>

          {/* Action Buttons (Redirects Only) */}
          <div className="flex flex-col gap-4 sm:flex-row">
            <Link href="/login">
              <ButtonGlimmer className="h-14 min-w-[200px] text-base shadow-blue-500/20 shadow-lg">
                Enter the Arena <ArrowRightIcon className="ml-2 w-5" />
              </ButtonGlimmer>
            </Link>
            <Link href="/signup">
              <ButtonGlimmer 
                glow={false} 
                className="h-14 min-w-[200px] bg-transparent border border-white/20 hover:bg-white/5 text-base"
              >
                Create Account
              </ButtonGlimmer>
            </Link>
          </div>

          {/* Team Credits */}
          <div className="pt-8 border-t border-white/10">
            <p className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-600">
              Constructed by
            </p>
            <div className="grid grid-cols-2 gap-y-3 gap-x-6 sm:grid-cols-3">
              {team.map((member) => (
                <div key={member.name} className="flex items-center gap-3 group cursor-default">
                  <div className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-blue-400 group-hover:border-blue-500/50 group-hover:bg-blue-500/10 transition-colors">
                    {member.name.charAt(0)}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors">{member.name}</span>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider">{member.role}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Holographic Game Showcase */}
        <div className="mt-16 flex w-full max-w-2xl items-center justify-center lg:mt-0 lg:w-1/2 animate-in fade-in slide-in-from-right-8 duration-1000 delay-200">
          <div className="relative aspect-square w-full md:aspect-video lg:aspect-square">
            
            {/* Ambient Glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/30 to-purple-500/30 blur-[60px] rounded-full opacity-50" />

            {/* The Game Container */}
            <div className="relative h-full w-full overflow-hidden rounded-[40px] border border-white/10 bg-black shadow-2xl backdrop-blur-xl">
              
              {/* Overlay UI */}
              <div className="absolute top-6 left-6 z-20 flex gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500/20 border border-red-500/50" />
                <div className="h-3 w-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                <div className="h-3 w-3 rounded-full bg-green-500/20 border border-green-500/50" />
              </div>
              
              <div className="absolute bottom-6 left-6 right-6 z-20 flex justify-between rounded-2xl bg-white/5 p-4 backdrop-blur-md border border-white/5">
                <div className="flex flex-col">
                   <span className="text-[10px] uppercase text-slate-500 font-bold">System Status</span>
                   <span className="text-xs text-blue-400 font-mono">ONLINE // 42_NETWORK</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] uppercase text-slate-300 font-bold">New Pong Live</span>
                </div>
              </div>

              {/* */}
              <NewPong />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}