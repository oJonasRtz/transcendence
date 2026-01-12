import Image from 'next/image';
import { UpdateInvoice as UpdateMatch, DeleteInvoice as DeleteMatch } from '@/app/ui/matches/buttons';
import InvoiceStatus from '@/app/ui/matches/status';
import { formatDateToLocal, formatCurrency } from '@/app/lib/utils';
import { fetchFilteredMatches } from '@/app/lib/data';

export default async function MatchesTable({
  query,
  currentPage,
}: {
  query: string;
  currentPage: number;
}) {
  const matches = await fetchFilteredMatches(query, currentPage);

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          <div className="md:hidden">
            {matches?.map((match) => (
              <div
                key={match.id}
                className="mb-2 w-full rounded-md bg-white p-4"
              >
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <div className="mb-2 flex items-center">
                      <Image
                        src={match.player1.avatar}
                        className="mr-2 rounded-full"
                        width={28}
                        height={28}
                        alt={`${match.player1.username}'s profile picture`}
                      />
                      <p>{match.player1.username}</p>
                    </div>
                    <div className="mb-2 flex items-center">
                      <Image
                        src={match.player2.avatar}
                        className="mr-2 rounded-full"
                        width={28}
                        height={28}
                        alt={`${match.player2.username}'s profile picture`}
                      />
                      <p>{match.player2.username}</p>
                    </div>
                  </div>
                  <InvoiceStatus status={match.result} />
                </div>
                <div className="flex w-full items-center justify-between pt-4">
                  <div>
                    <p className="text-xl font-medium">
                      {match.score || 'N/A'}
                    </p>
                    <p>{formatDateToLocal(match.playedAt.toISOString())}</p>
                  </div>
                  <div className="flex justify-end gap-2">
                    <UpdateMatch id={match.id.toString()} />
                    <DeleteMatch id={match.id.toString()} />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <table className="hidden min-w-full text-gray-900 md:table">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr>
                <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                  Player 1
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Player 2
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Score
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Date
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Result
                </th>
                <th scope="col" className="relative py-3 pl-6 pr-3">
                  <span className="sr-only">Edit</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {matches?.map((match) => (
                <tr
                  key={match.id}
                  className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                >
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex items-center gap-3">
                      <Image
                        src={match.player1.avatar}
                        className="rounded-full"
                        width={28}
                        height={28}
                        alt={`${match.player1.username}'s profile picture`}
                      />
                      <p>{match.player1.username}</p>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <div className="flex items-center gap-3">
                      <Image
                        src={match.player2.avatar}
                        className="rounded-full"
                        width={28}
                        height={28}
                        alt={`${match.player2.username}'s profile picture`}
                      />
                      <p>{match.player2.username}</p>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {match.score || 'N/A'}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {formatDateToLocal(match.playedAt.toISOString())}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <InvoiceStatus status={match.result} />
                  </td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex justify-end gap-3">
                      <UpdateMatch id={match.id.toString()} />
                      <DeleteMatch id={match.id.toString()} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
