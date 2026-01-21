interface ErrorDisplayProps {
  error: string;
}

export function ErrorDisplay({ error }: ErrorDisplayProps) {
  return (
    <div className="rounded-lg bg-red-50 p-3 sm:p-4 text-sm sm:text-base text-red-900 dark:bg-red-950/50 dark:text-red-200 border border-red-200 dark:border-red-900 flex-shrink-0">
      {error}
    </div>
  );
}

