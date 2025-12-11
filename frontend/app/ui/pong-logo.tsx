import { ClockIcon } from '@heroicons/react/24/outline';
import { lusitana } from '@/app/ui/fonts';
import { pressStart2p } from '@/app/ui/fonts';
import { goldman } from '@/app/ui/fonts';

export default function AcmeLogo() {
  return (
    <div
      className={`${goldman.className} flex flex-row items-center leading-none text-white`}
    >
      {/* <ClockIcon className="h-12 w-12 rotate-[270deg]" /> */}
      <p className="text-[44px]">PONG</p>
    </div>
  );
}
