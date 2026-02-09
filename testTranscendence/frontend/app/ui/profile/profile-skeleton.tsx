import { CardHeader, CardShell, LoadingState } from "@/app/ui/dashboard/card-primitives";

export default function ProfileSkeleton() {
  return (
    <main className="p-4 md:p-6 lg:p-8">
      <CardShell className="max-w-2xl">
        <CardHeader title="Profile" accentClassName="text-blue-400" />
        <LoadingState label="Loading profile" />
      </CardShell>
    </main>
  );
}
