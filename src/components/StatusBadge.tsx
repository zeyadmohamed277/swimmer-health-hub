import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: 'pending' | 'normal' | 'attention' | 'critical';
  className?: string;
}

const statusConfig = {
  pending: {
    label: 'Pending',
    className: 'bg-muted text-muted-foreground',
  },
  normal: {
    label: 'Normal',
    className: 'bg-success/10 text-success',
  },
  attention: {
    label: 'Attention',
    className: 'bg-attention/10 text-attention',
  },
  critical: {
    label: 'Critical',
    className: 'bg-critical/10 text-critical',
  },
};

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.pending;
  
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}