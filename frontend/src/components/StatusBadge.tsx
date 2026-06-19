import type { Status } from "../types";

const statusColors: Record<Status, string> = {
  Applied: "bg-blue-100 text-blue-800",
  Interviewing: "bg-yellow-100 text-yellow-800",
  Offer: "bg-green-100 text-green-800",
  Rejected: "bg-red-100 text-red-800",
};

const StatusBadge = ({ status }: { status: Status }) => (
  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors[status]}`}>
    {status}
  </span>
);

export default StatusBadge;