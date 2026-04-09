// src/components/common/EmptyState.tsx

interface EmptyStateProps {
  emoji?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export default function EmptyState({ emoji = '📭', title, description, action, className = '' }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 px-6 text-center ${className}`}>
      <div className="text-5xl mb-4">{emoji}</div>
      <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
      {description && (
        <p className="text-gray-500 text-sm max-w-xs mb-6">{description}</p>
      )}
      {action}
    </div>
  );
}
