import { useState, useMemo, useCallback } from 'react';
import { ArrowDownLeft, ArrowUpRight, ChevronUp, ChevronDown, ChevronsUpDown, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { TransactionStatusBadge } from './TransactionStatusBadge';
import type { TransactionStatus } from './TransactionStatusBadge';

type TransactionType = 'Deposit' | 'Withdrawal';
type SortKey = 'type' | 'asset' | 'amount' | 'status' | 'date';
type SortDir = 'asc' | 'desc';

interface Transaction {
  id: string;
  type: TransactionType;
  asset: string;
  amount: number;
  status: TransactionStatus;
  date: string;
  reference: string;
}

const ALL_TRANSACTIONS: Transaction[] = [
  { id: 'tx-001', type: 'Deposit',    asset: 'USDC', amount: 500.00,    status: 'Completed',  date: '2024-03-15', reference: 'REF-A1B2' },
  { id: 'tx-002', type: 'Withdrawal', asset: 'USDC', amount: 120.50,    status: 'Pending',     date: '2024-03-16', reference: 'REF-C3D4' },
  { id: 'tx-003', type: 'Deposit',    asset: 'USDC', amount: 1000.00,   status: 'Processing',  date: '2024-03-16', reference: 'REF-E5F6' },
  { id: 'tx-004', type: 'Withdrawal', asset: 'EURT', amount: 250.75,    status: 'Completed',   date: '2024-03-17', reference: 'REF-G7H8' },
  { id: 'tx-005', type: 'Deposit',    asset: 'ARST', amount: 5000.00,   status: 'Failed',      date: '2024-03-17', reference: 'REF-I9J0' },
  { id: 'tx-006', type: 'Withdrawal', asset: 'USDC', amount: 75.00,     status: 'Cancelled',   date: '2024-03-18', reference: 'REF-K1L2' },
  { id: 'tx-007', type: 'Deposit',    asset: 'EURT', amount: 3200.00,   status: 'Completed',   date: '2024-03-18', reference: 'REF-M3N4' },
  { id: 'tx-008', type: 'Withdrawal', asset: 'ARST', amount: 800.00,    status: 'Processing',  date: '2024-03-19', reference: 'REF-O5P6' },
  { id: 'tx-009', type: 'Deposit',    asset: 'USDC', amount: 10000.00,  status: 'Pending',     date: '2024-03-19', reference: 'REF-Q7R8' },
  { id: 'tx-010', type: 'Withdrawal', asset: 'USDC', amount: 450.25,    status: 'Completed',   date: '2024-03-20', reference: 'REF-S9T0' },
  { id: 'tx-011', type: 'Deposit',    asset: 'EURT', amount: 600.00,    status: 'Completed',   date: '2024-03-20', reference: 'REF-U1V2' },
  { id: 'tx-012', type: 'Withdrawal', asset: 'USDC', amount: 1500.00,   status: 'Failed',      date: '2024-03-21', reference: 'REF-W3X4' },
];

const PAGE_SIZE_OPTIONS = [5, 10, 20] as const;

const fmtAmount = (n: number) =>
  n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const SortIcon = ({ col, sortKey, dir }: { col: SortKey; sortKey: SortKey; dir: SortDir }) => {
  if (col !== sortKey) return <ChevronsUpDown size={13} className="text-slate-600" aria-hidden="true" />;
  return dir === 'asc'
    ? <ChevronUp size={13} className="text-primary" aria-hidden="true" />
    : <ChevronDown size={13} className="text-primary" aria-hidden="true" />;
};

export const TransactionHistory = () => {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TransactionStatus | 'All'>('All');
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<(typeof PAGE_SIZE_OPTIONS)[number]>(5);

  const handleSort = useCallback((key: SortKey) => {
    setSortDir((prev) => (sortKey === key ? (prev === 'asc' ? 'desc' : 'asc') : 'asc'));
    setSortKey(key);
    setPage(1);
  }, [sortKey]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return ALL_TRANSACTIONS.filter((tx) => {
      const matchesQuery =
        !q ||
        tx.type.toLowerCase().includes(q) ||
        tx.asset.toLowerCase().includes(q) ||
        tx.reference.toLowerCase().includes(q) ||
        tx.status.toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'All' || tx.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [query, statusFilter]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'amount') {
        cmp = a.amount - b.amount;
      } else {
        cmp = a[sortKey].localeCompare(b[sortKey]);
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginated = sorted.slice((safePage - 1) * pageSize, safePage * pageSize);

  const HEADERS: { key: SortKey; label: string }[] = [
    { key: 'type',   label: 'Type'      },
    { key: 'asset',  label: 'Asset'     },
    { key: 'amount', label: 'Amount'    },
    { key: 'status', label: 'Status'    },
    { key: 'date',   label: 'Date'      },
  ];

  const statusOptions: Array<TransactionStatus | 'All'> = [
    'All', 'Completed', 'Pending', 'Processing', 'Failed', 'Cancelled',
  ];

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" aria-hidden="true" />
          <input
            type="search"
            placeholder="Search by type, asset, reference…"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            aria-label="Search transactions"
            className="input-field w-full pl-9 text-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="status-filter" className="sr-only">Filter by status</label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value as TransactionStatus | 'All'); setPage(1); }}
            className="input-field text-sm"
          >
            {statusOptions.map((s) => (
              <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s}</option>
            ))}
          </select>

          <label htmlFor="page-size" className="sr-only">Rows per page</label>
          <select
            id="page-size"
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value) as typeof pageSize); setPage(1); }}
            className="input-field text-sm"
          >
            {PAGE_SIZE_OPTIONS.map((n) => (
              <option key={n} value={n}>{n} / page</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-x-auto">
        <table className="w-full text-left" aria-label="Transaction history">
          <caption className="sr-only">
            Transaction history — {sorted.length} result{sorted.length !== 1 ? 's' : ''}
          </caption>
          <thead>
            <tr className="border-b border-slate-800 text-sm text-slate-400">
              {HEADERS.map(({ key, label }) => (
                <th key={key} scope="col" className="p-4 font-medium">
                  <button
                    onClick={() => handleSort(key)}
                    className="inline-flex items-center gap-1 hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded"
                    aria-label={`Sort by ${label}${sortKey === key ? `, currently ${sortDir}ending` : ''}`}
                  >
                    {label}
                    <SortIcon col={key} sortKey={sortKey} dir={sortDir} />
                  </button>
                </th>
              ))}
              <th scope="col" className="p-4 font-medium text-slate-400">Reference</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-500">
                  No transactions match your filters.
                </td>
              </tr>
            ) : (
              paginated.map((tx) => (
                <tr
                  key={tx.id}
                  className="transition-colors hover:bg-slate-900/50"
                >
                  <td className="flex items-center gap-2 p-4">
                    {tx.type === 'Deposit' ? (
                      <ArrowDownLeft size={16} className="text-emerald-400" aria-hidden="true" />
                    ) : (
                      <ArrowUpRight size={16} className="text-rose-400" aria-hidden="true" />
                    )}
                    {tx.type}
                  </td>
                  <td className="p-4">{tx.asset}</td>
                  <td className="p-4 font-mono">${fmtAmount(tx.amount)}</td>
                  <td className="p-4">
                    <TransactionStatusBadge status={tx.status} />
                  </td>
                  <td className="p-4 text-sm text-slate-400">
                    <time dateTime={tx.date}>{tx.date}</time>
                  </td>
                  <td className="p-4 font-mono text-xs text-slate-500">{tx.reference}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-slate-400">
        <span aria-live="polite" aria-atomic="true">
          {sorted.length === 0
            ? 'No results'
            : `Showing ${(safePage - 1) * pageSize + 1}–${Math.min(safePage * pageSize, sorted.length)} of ${sorted.length}`}
        </span>
        <div className="flex items-center gap-1" role="navigation" aria-label="Pagination">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePage === 1}
            aria-label="Previous page"
            className="rounded p-1.5 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          >
            <ChevronLeft size={16} aria-hidden="true" />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              aria-label={`Page ${p}`}
              aria-current={p === safePage ? 'page' : undefined}
              className={`min-w-[2rem] rounded px-2 py-1 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
                p === safePage
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-slate-800'
              }`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage === totalPages}
            aria-label="Next page"
            className="rounded p-1.5 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          >
            <ChevronRight size={16} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionHistory;
