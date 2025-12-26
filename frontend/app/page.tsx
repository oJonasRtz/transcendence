import AcmeLogo from '@/app/ui/pong-logo';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { lusitana } from '@/app/ui/fonts';
import Image from 'next/image';

export default function Page() {
  return (
    <main className="flex min-h-screen flex-col p-6">
      <div className="flex h-20 shrink-0 items-end rounded-lg bg-black-500 p-4 md:h-52">
        <AcmeLogo />
      </div>
      <div className="mt-4 flex grow flex-col gap-4 md:flex-row">
        <div className="flex flex-col justify-center gap-6 rounded-lg bg-gradient-to-br from-gray-900 to-black px-6 py-10 md:w-2/5 md:px-20 border border-blue-500/20">
          <div className="space-y-4">
            <h1 className={`${lusitana.className} text-3xl text-white md:text-5xl md:leading-tight font-bold`}>
              Welcome to the best Pong of the world!!!
            </h1>
            <p className="text-lg text-gray-300 md:text-xl">
              Pong is a multiplayer game. You can be happy here.
            </p>
            <p className="text-sm text-blue-400 md:text-base font-semibold">
              Time do Balacobaco
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link
              href="/login"
              className="flex items-center justify-center gap-3 rounded-lg bg-blue-600 px-8 py-4 text-sm font-bold text-white transition-all hover:bg-blue-500 hover:scale-105 md:text-base shadow-lg shadow-blue-500/50"
            >
              <span>Sign In</span> <ArrowRightIcon className="w-5 md:w-6" />
            </Link>
            <Link
              href="/signup"
              className="flex items-center justify-center gap-3 rounded-lg bg-transparent border-2 border-blue-500 px-8 py-4 text-sm font-bold text-blue-400 transition-all hover:bg-blue-500/10 hover:scale-105 md:text-base"
            >
              <span>Sign Up</span>
            </Link>
          </div>
        </div>
        <div className="flex items-center justify-center p-6 md:w-3/5 md:px-28 md:py-12">
          {/* Add Hero Images Here */}
          <Image
            src="/hero-desktop.png"
            width={792}
            height={592}
            className="hidden md:block"
            alt="Screenshots of the dashboard project showing desktop version"
          />
          <Image
            src="/hero-mobile.png"
            width={560}
            height={620}
            className="block md:hidden"
            alt="Screenshots of the dashboard project showing mobile version"
          />
        </div>
      </div>
    </main>
  );
}
