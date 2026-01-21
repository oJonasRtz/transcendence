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

type ErrorStateProps = {
  title?: string;
  message: string;
  action?: React.ReactNode;
};

export function ErrorState({
  title = 'Something went wrong',
  message,
  action,
}: ErrorStateProps) {
  return (
    <div className="p-6 text-center" role="alert">
      <p className="text-sm font-black text-red-400 uppercase tracking-wider">
        {title}
      </p>
      <p className="mt-2 text-sm font-mono text-slate-400">{message}</p>
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
}

type LoadingStateProps = {
  label?: string;
};

export function LoadingState({ label = 'Loading' }: LoadingStateProps) {
  return (
    <div className="p-6 animate-pulse">
      <div className="h-4 w-28 rounded bg-white/10" />
      <div className="mt-4 space-y-2">
        <div className="h-3 w-full rounded bg-white/5" />
        <div className="h-3 w-5/6 rounded bg-white/5" />
        <div className="h-3 w-2/3 rounded bg-white/5" />
      </div>
      <p className="sr-only">{label}</p>
    </div>
  );
}
