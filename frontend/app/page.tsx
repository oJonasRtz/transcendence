import PongLogo from '@/app/ui/pong-logo';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { lusitana } from '@/app/ui/fonts';

export default function Page() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#020617] via-[#0a1a2f] to-[#0f172a]">
      <div className="relative bg-white/50 backdrop-blur-sm rounded-xl shadow-md p-8 max-w-md w-full mx-4">
        <header className="mb-6">
          <nav className="flex justify-center gap-6">
            <Link
              href="/register"
              className="flex items-center gap-2 rounded-lg bg-gray-700 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-600"
            >
              Sign Up
            </Link>
            <Link
              href="/login"
              className="flex items-center gap-2 rounded-lg bg-blue-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-400"
            >
              Sign In <ArrowRightIcon className="w-4" />
            </Link>
          </nav>
        </header>

        <section className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <PongLogo />
          </div>
          <h1 className={`${lusitana.className} text-2xl md:text-3xl font-bold text-gray-800 mb-2`}>
            Welcome to the best Pong in the world!
          </h1>
          <h2 className="text-gray-600 text-lg">
            Pong is a multiplayer game. You can be happy here.
          </h2>
        </section>

        <footer className="text-center text-sm text-gray-500">
          Time do Balacobaco
        </footer>
      </div>
    </main>
  );
}
