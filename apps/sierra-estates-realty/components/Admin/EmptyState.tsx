import React from 'react';
import { type LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
      {Icon && (
        <div className="w-12 h-12 rounded-2xl bg-[#f3f4f5] flex items-center justify-center mb-4">
          <Icon size={20} className="text-[#3a5570]/40" />
        </div>
      )}
      <p className="text-sm font-semibold text-[#071422]/50 mb-1">{title}</p>
      {description && (
        <p className="text-[11px] text-[#3a5570]/40 uppercase tracking-widest font-mono max-w-xs">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
