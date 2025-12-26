import { cn } from '@/lib/utils';
import { Wifi, WifiOff, RefreshCw, AlertCircle } from 'lucide-react';
import type { ConnectionStatus } from '@/lib/collaboration.types';

interface ConnectionStatusProps {
  status: ConnectionStatus;
  onReconnect?: () => void;
}

export function ConnectionStatusBadge({ status, onReconnect }: ConnectionStatusProps) {
  const getStatusConfig = (): {
    icon: typeof Wifi;
    text: string;
    className: string;
    iconClassName: string;
  } => {
    switch (status) {
      case 'connected':
        return {
          icon: Wifi,
          text: 'Connected',
          className: 'bg-green-500/10 text-green-600 border-green-500/20',
          iconClassName: 'text-green-600',
        };
      case 'connecting':
        return {
          icon: RefreshCw,
          text: 'Connecting...',
          className: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
          iconClassName: 'text-yellow-600 animate-spin',
        };
      case 'disconnected':
        return {
          icon: WifiOff,
          text: 'Disconnected',
          className: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
          iconClassName: 'text-gray-600',
        };
      case 'error':
      default:
        return {
          icon: AlertCircle,
          text: 'Connection Error',
          className: 'bg-red-500/10 text-red-600 border-red-500/20',
          iconClassName: 'text-red-600',
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border',
        config.className,
        (status === 'disconnected' || status === 'error') && onReconnect && 'cursor-pointer hover:opacity-80'
      )}
      onClick={(status === 'disconnected' || status === 'error') && onReconnect ? onReconnect : undefined}
      title={
        (status === 'disconnected' || status === 'error') && onReconnect
          ? 'Click to reconnect'
          : undefined
      }
    >
      <Icon className={cn('h-3.5 w-3.5', config.iconClassName)} />
      <span>{config.text}</span>
    </div>
  );
}
