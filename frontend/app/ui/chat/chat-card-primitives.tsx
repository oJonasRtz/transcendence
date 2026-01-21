'use client';

import clsx from 'clsx';

type CardShellProps = {
  children: React.ReactNode;
  className?: string;
};

export function CardShell({ children, className }: CardShellProps) {
  return (
    <section
      className={clsx(
        'rounded-lg bg-slate-900/50 backdrop-blur-sm border border-white/10 shadow-2xl',
        className
      )}
    >
      {children}
    </section>
  );
}

type CardHeaderProps = {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  accentClassName?: string;
};

export function CardHeader({
  title,
  subtitle,
  action,
  accentClassName = 'text-blue-400',
}: CardHeaderProps) {
  return (
    <div className="border-b border-white/10 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-black tracking-tight text-white uppercase">
            <span className={accentClassName}>//</span> {title}
          </h2>
          {subtitle ? (
            <p className="mt-2 text-sm font-mono text-slate-400">{subtitle}</p>
          ) : null}
        </div>
        {action ? <div className="pt-1">{action}</div> : null}
      </div>
    </div>
  );
}

type EmptyStateProps = {
  title?: string;
  message: string;
  action?: React.ReactNode;
};

export function EmptyState({
  title = 'Nothing here yet',
  message,
  action,
}: EmptyStateProps) {
  return (
    <div className="p-6 text-center">
      <p className="text-sm font-black text-slate-300 uppercase tracking-wider">
        {title}
      </p>
      <p className="mt-2 text-sm font-mono text-slate-500">{message}</p>
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
}
