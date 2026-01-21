// Loading animation
const shimmer =
  'before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent';
const dashboardShimmer =
  'relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent';

export function CardSkeleton() {
  return (
    <div
      className={`${shimmer} relative overflow-hidden rounded-xl bg-gray-100 p-2 shadow-sm`}
    >
      <div className="flex p-4">
        <div className="h-5 w-5 rounded-md bg-gray-200" />
        <div className="ml-2 h-6 w-16 rounded-md bg-gray-200 text-sm font-medium" />
      </div>
      <div className="flex items-center justify-center truncate rounded-xl bg-white px-4 py-8">
        <div className="h-7 w-20 rounded-md bg-gray-200" />
      </div>
    </div>
  );
}

export function CardsSkeleton() {
  return (
    <>
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
    </>
  );
}

export function RevenueChartSkeleton() {
  return (
    <div className={`${shimmer} relative w-full overflow-hidden md:col-span-4`}>
      <div className="mb-4 h-8 w-36 rounded-md bg-gray-100" />
      <div className="rounded-xl bg-gray-100 p-4">
        <div className="sm:grid-cols-13 mt-0 grid h-[410px] grid-cols-12 items-end gap-2 rounded-md bg-white p-4 md:gap-4" />
        <div className="flex items-center pb-2 pt-6">
          <div className="h-5 w-5 rounded-full bg-gray-200" />
          <div className="ml-2 h-4 w-20 rounded-md bg-gray-200" />
        </div>
      </div>
    </div>
  );
}

export function InvoiceSkeleton() {
  return (
    <div className="flex flex-row items-center justify-between border-b border-gray-100 py-4">
      <div className="flex items-center">
        <div className="mr-2 h-8 w-8 rounded-full bg-gray-200" />
        <div className="min-w-0">
          <div className="h-5 w-40 rounded-md bg-gray-200" />
          <div className="mt-2 h-4 w-12 rounded-md bg-gray-200" />
        </div>
      </div>
      <div className="mt-2 h-4 w-12 rounded-md bg-gray-200" />
    </div>
  );
}

export function LatestInvoicesSkeleton() {
  return (
    <div
      className={`${shimmer} relative flex w-full flex-col overflow-hidden md:col-span-4`}
    >
      <div className="mb-4 h-8 w-36 rounded-md bg-gray-100" />
      <div className="flex grow flex-col justify-between rounded-xl bg-gray-100 p-4">
        <div className="bg-white px-6">
          <InvoiceSkeleton />
          <InvoiceSkeleton />
          <InvoiceSkeleton />
          <InvoiceSkeleton />
          <InvoiceSkeleton />
        </div>
        <div className="flex items-center pb-2 pt-6">
          <div className="h-5 w-5 rounded-full bg-gray-200" />
          <div className="ml-2 h-4 w-20 rounded-md bg-gray-200" />
        </div>
      </div>
    </div>
  );
}

export default function DashboardSkeleton() {
  return (
    <main className="p-4 md:p-6 lg:p-8 space-y-6">
      <div
        className={`rounded-lg bg-slate-900/50 backdrop-blur-sm border border-white/10 shadow-2xl ${dashboardShimmer}`}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-blue-600/10" />
        <div className="relative p-6 lg:p-8 flex flex-col lg:flex-row items-start lg:items-center gap-6">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-white/10" />
              <div className="absolute bottom-1 right-1 h-4 w-4 rounded-full bg-green-400/30 border-2 border-slate-900" />
            </div>
            <div className="space-y-3">
              <div className="h-3 w-24 rounded bg-white/10" />
              <div className="h-8 w-40 rounded bg-white/20" />
              <div className="h-4 w-28 rounded bg-white/10" />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto lg:ml-auto">
            <div className="h-12 w-full sm:w-40 rounded-lg bg-white/10" />
            <div className="h-12 w-full sm:w-36 rounded-lg bg-white/5 border border-white/10" />
          </div>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className={`rounded-lg bg-gradient-to-br from-slate-900/80 to-slate-800/80 border border-white/10 backdrop-blur-sm p-6 shadow-2xl ${dashboardShimmer}`}
          >
            <div className="flex items-center justify-between">
              <div className="space-y-3">
                <div className="h-3 w-20 rounded bg-white/10" />
                <div className="h-8 w-16 rounded bg-white/20" />
              </div>
              <div className="h-12 w-12 rounded-lg bg-white/10 border border-white/20" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div
            className={`rounded-lg bg-slate-900/80 backdrop-blur-sm border border-white/10 shadow-2xl ${dashboardShimmer}`}
          >
            <div className="border-b border-white/10 p-6">
              <div className="h-6 w-40 bg-white/10 rounded" />
            </div>
            <div className="divide-y divide-white/5">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="p-4 flex items-center space-x-4">
                  <div className="h-12 w-12 bg-white/10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 bg-white/15 rounded" />
                    <div className="h-3 w-24 bg-white/10 rounded" />
                  </div>
                  <div className="h-7 w-16 bg-white/10 rounded-lg" />
                </div>
              ))}
            </div>
          </div>

          <div
            className={`rounded-lg bg-slate-900/80 backdrop-blur-sm border border-white/10 shadow-2xl ${dashboardShimmer}`}
          >
            <div className="border-b border-white/10 p-6">
              <div className="h-6 w-44 bg-white/10 rounded" />
            </div>
            <div className="divide-y divide-white/5">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="p-4 flex items-center space-x-3">
                  <div className="h-10 w-10 bg-white/10 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-64 bg-white/15 rounded" />
                    <div className="h-3 w-32 bg-white/10 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div
            className={`rounded-lg bg-slate-900/80 backdrop-blur-sm border border-white/10 shadow-2xl ${dashboardShimmer}`}
          >
            <div className="border-b border-white/10 p-6">
              <div className="h-6 w-36 bg-white/10 rounded mb-2" />
              <div className="h-4 w-24 bg-white/5 rounded" />
            </div>
            <div className="divide-y divide-white/5">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="p-4 flex items-center space-x-4">
                  <div className="h-4 w-8 bg-white/10 rounded" />
                  <div className="h-10 w-10 bg-white/10 rounded-full" />
                  <div className="flex-1">
                    <div className="h-4 w-28 bg-white/15 rounded" />
                  </div>
                  <div className="space-y-1">
                    <div className="h-5 w-12 bg-blue-500/20 rounded" />
                    <div className="h-3 w-8 bg-white/10 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            className={`rounded-lg bg-slate-900/80 backdrop-blur-sm border border-white/10 shadow-2xl ${dashboardShimmer}`}
          >
            <div className="border-b border-white/10 p-6">
              <div className="h-6 w-36 bg-white/10 rounded mb-2" />
              <div className="h-4 w-20 bg-white/5 rounded" />
            </div>
            <div className="divide-y divide-white/5">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="p-4 flex items-center space-x-3">
                  <div className="h-10 w-10 bg-white/10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-28 bg-white/15 rounded" />
                    <div className="h-3 w-16 bg-green-500/20 rounded" />
                  </div>
                  <div className="h-5 w-5 bg-blue-500/20 rounded" />
                </div>
              ))}
            </div>
          </div>

          <div
            className={`rounded-lg bg-slate-900/80 backdrop-blur-sm border border-white/10 shadow-2xl ${dashboardShimmer}`}
          >
            <div className="border-b border-white/10 p-6">
              <div className="flex items-center justify-between">
                <div className="h-6 w-32 bg-white/10 rounded" />
                <div className="h-6 w-8 bg-red-500/20 rounded-lg" />
              </div>
            </div>
            <div className="divide-y divide-white/5">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="p-4 flex items-start space-x-3">
                  <div className="h-12 w-12 bg-white/10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 bg-white/15 rounded" />
                    <div className="h-3 w-48 bg-white/10 rounded" />
                    <div className="h-3 w-20 bg-white/10 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export function TableRowSkeleton() {
  return (
    <tr className="w-full border-b border-gray-100 last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg">
      {/* Customer Name and Image */}
      <td className="relative overflow-hidden whitespace-nowrap py-3 pl-6 pr-3">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-gray-100"></div>
          <div className="h-6 w-24 rounded bg-gray-100"></div>
        </div>
      </td>
      {/* Email */}
      <td className="whitespace-nowrap px-3 py-3">
        <div className="h-6 w-32 rounded bg-gray-100"></div>
      </td>
      {/* Amount */}
      <td className="whitespace-nowrap px-3 py-3">
        <div className="h-6 w-16 rounded bg-gray-100"></div>
      </td>
      {/* Date */}
      <td className="whitespace-nowrap px-3 py-3">
        <div className="h-6 w-16 rounded bg-gray-100"></div>
      </td>
      {/* Status */}
      <td className="whitespace-nowrap px-3 py-3">
        <div className="h-6 w-16 rounded bg-gray-100"></div>
      </td>
      {/* Actions */}
      <td className="whitespace-nowrap py-3 pl-6 pr-3">
        <div className="flex justify-end gap-3">
          <div className="h-[38px] w-[38px] rounded bg-gray-100"></div>
          <div className="h-[38px] w-[38px] rounded bg-gray-100"></div>
        </div>
      </td>
    </tr>
  );
}

export function InvoicesMobileSkeleton() {
  return (
    <div className="mb-2 w-full rounded-md bg-white p-4">
      <div className="flex items-center justify-between border-b border-gray-100 pb-8">
        <div className="flex items-center">
          <div className="mr-2 h-8 w-8 rounded-full bg-gray-100"></div>
          <div className="h-6 w-16 rounded bg-gray-100"></div>
        </div>
        <div className="h-6 w-16 rounded bg-gray-100"></div>
      </div>
      <div className="flex w-full items-center justify-between pt-4">
        <div>
          <div className="h-6 w-16 rounded bg-gray-100"></div>
          <div className="mt-2 h-6 w-24 rounded bg-gray-100"></div>
        </div>
        <div className="flex justify-end gap-2">
          <div className="h-10 w-10 rounded bg-gray-100"></div>
          <div className="h-10 w-10 rounded bg-gray-100"></div>
        </div>
      </div>
    </div>
  );
}

export function InvoicesTableSkeleton() {
  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          <div className="md:hidden">
            <InvoicesMobileSkeleton />
            <InvoicesMobileSkeleton />
            <InvoicesMobileSkeleton />
            <InvoicesMobileSkeleton />
            <InvoicesMobileSkeleton />
            <InvoicesMobileSkeleton />
          </div>
          <table className="hidden min-w-full text-gray-900 md:table">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr>
                <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                  Customer
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Email
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Amount
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Date
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Status
                </th>
                <th
                  scope="col"
                  className="relative pb-4 pl-3 pr-6 pt-2 sm:pr-6"
                >
                  <span className="sr-only">Edit</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              <TableRowSkeleton />
              <TableRowSkeleton />
              <TableRowSkeleton />
              <TableRowSkeleton />
              <TableRowSkeleton />
              <TableRowSkeleton />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
