// src/components/common/LoadingSkeleton.tsx

interface LoadingSkeletonProps {
  lines?: number;
  className?: string;
}

export default function LoadingSkeleton({ lines = 3, className = '' }: LoadingSkeletonProps) {
  return (
    <div className={`animate-pulse space-y-3 p-6 ${className}`}>
      <div className="h-6 bg-gray-200 rounded-lg w-1/3" />
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-gray-200 rounded-lg"
          style={{ width: `${70 + Math.random() * 25}%` }}
        />
      ))}
    </div>
  );
}

export function CardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse bg-white rounded-xl p-5 shadow-card">
          <div className="h-5 bg-gray-200 rounded w-2/3 mb-3" />
          <div className="h-4 bg-gray-200 rounded w-full mb-2" />
          <div className="h-4 bg-gray-200 rounded w-4/5 mb-4" />
          <div className="h-8 bg-gray-200 rounded-lg w-1/2" />
        </div>
      ))}
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="space-y-4 w-full max-w-md px-6">
        <div className="h-8 bg-gray-200 rounded-lg w-1/2 mx-auto animate-pulse" />
        <div className="h-4 bg-gray-100 rounded w-3/4 mx-auto animate-pulse" />
        <div className="h-4 bg-gray-100 rounded w-2/3 mx-auto animate-pulse" />
      </div>
    </div>
  );
}
