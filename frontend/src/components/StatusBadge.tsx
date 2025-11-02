import { Badge } from '@/components/ui/badge';
import { AssetStatus } from '@/types/asset';
import { CheckCircle, AlertCircle, Circle } from 'lucide-react';

interface StatusBadgeProps {
  status: AssetStatus;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const config = {
    Active: {
      variant: 'default' as const,
      icon: Circle,
      className: 'bg-muted text-muted-foreground'
    },
    Missing: {
      variant: 'destructive' as const,
      icon: AlertCircle,
      className: 'bg-warning/10 text-warning border-warning/20'
    },
    Recovered: {
      variant: 'default' as const,
      icon: CheckCircle,
      className: 'bg-success/10 text-success border-success/20'
    }
  };

  const { icon: Icon, className } = config[status];

  return (
    <Badge variant="outline" className={className}>
      <Icon className="mr-1 h-3 w-3" />
      {status}
    </Badge>
  );
};
