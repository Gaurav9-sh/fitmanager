// Format currency from paise to display string
export const formatCurrency = (paise: number, symbol = '₹'): string => {
  const rupees = paise / 100;
  return `${symbol}${rupees.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
};

// Format date
export const formatDate = (date: string | Date, format: 'short' | 'long' | 'relative' = 'short'): string => {
  if (!date) return 'N/A';
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Invalid date';

  if (format === 'relative') {
    const diff = Date.now() - d.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 30) return d.toLocaleDateString('en-IN');
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'just now';
  }

  if (format === 'long') {
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  return d.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

// Days until/since date
export const daysUntil = (date: string | Date): number => {
  const d = new Date(date);
  const now = new Date();
  return Math.ceil((d.getTime() - now.getTime()) / 86400000);
};

// Get status badge class
export const getStatusClass = (status: string): string => {
  const map: Record<string, string> = {
    active: 'badge-active',
    expired: 'badge-expired',
    pending: 'badge-pending',
    suspended: 'badge-suspended',
    paid: 'badge-paid',
    partially_paid: 'badge-partial',
    overdue: 'badge-overdue',
    cancelled: 'badge-expired',
    new: 'badge-pending',
    contacted: 'badge-partial',
    converted: 'badge-active',
    not_interested: 'badge-expired',
    follow_up: 'badge-suspended',
  };
  return map[status] || 'badge';
};

// Status label
export const getStatusLabel = (status: string): string => {
  const map: Record<string, string> = {
    active: 'Active',
    expired: 'Expired',
    pending: 'Pending',
    suspended: 'Suspended',
    paid: 'Paid',
    partially_paid: 'Partial',
    overdue: 'Overdue',
    cancelled: 'Cancelled',
    new: 'New',
    contacted: 'Contacted',
    converted: 'Converted',
    not_interested: 'Not Interested',
    follow_up: 'Follow Up',
  };
  return map[status] || status;
};

// Truncate text
export const truncate = (text: string, len: number = 30): string =>
  text?.length > len ? `${text.substring(0, len)}...` : text || '';

// Capitalize
export const capitalize = (str: string): string =>
  str?.charAt(0).toUpperCase() + str?.slice(1).replace(/_/g, ' ') || '';
