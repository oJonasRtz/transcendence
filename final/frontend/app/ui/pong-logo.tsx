import { goldman } from '@/app/ui/fonts';

export default function PongLogo({isCollapsed}: {isCollapsed?: boolean}) {
  return (
    <div
      className={`${goldman.className} flex flex-row items-center leading-none text-white`}
    >
      <p className="text-[44px]">
        {isCollapsed ? 'P' : 'PONG'}
      </p>
    </div>
  );
}
