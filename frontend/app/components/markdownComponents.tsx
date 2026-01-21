export const markdownComponents = {
  p: ({ children, ...props }: any) => (
    <p className="whitespace-pre-wrap break-words text-sm sm:text-base leading-relaxed mb-2 last:mb-0" {...props}>
      {children}
    </p>
  ),
  code: ({ children, className, ...props }: any) => {
    const isInline = !className;
    return isInline ? (
      <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
        {children}
      </code>
    ) : (
      <code className={className} {...props}>
        {children}
      </code>
    );
  },
  pre: ({ children, ...props }: any) => (
    <pre className="bg-slate-100 dark:bg-slate-800 p-3 rounded-lg overflow-x-auto text-sm my-2" {...props}>
      {children}
    </pre>
  ),
  ul: ({ children, ...props }: any) => (
    <ul className="list-disc list-inside space-y-1 my-2" {...props}>{children}</ul>
  ),
  ol: ({ children, ...props }: any) => (
    <ol className="list-decimal list-inside space-y-1 my-2" {...props}>{children}</ol>
  ),
  li: ({ children, ...props }: any) => (
    <li className="text-sm sm:text-base" {...props}>{children}</li>
  ),
  strong: ({ children, ...props }: any) => (
    <strong className="font-semibold" {...props}>{children}</strong>
  ),
  em: ({ children, ...props }: any) => (
    <em className="italic" {...props}>{children}</em>
  ),
  blockquote: ({ children, ...props }: any) => (
    <blockquote className="border-l-4 border-slate-300 dark:border-slate-600 pl-4 my-2 italic" {...props}>
      {children}
    </blockquote>
  ),
  h1: ({ children, ...props }: any) => (
    <h1 className="text-xl sm:text-2xl font-bold mt-4 mb-2" {...props}>{children}</h1>
  ),
  h2: ({ children, ...props }: any) => (
    <h2 className="text-lg sm:text-xl font-bold mt-3 mb-2" {...props}>{children}</h2>
  ),
  h3: ({ children, ...props }: any) => (
    <h3 className="text-base sm:text-lg font-semibold mt-2 mb-1" {...props}>{children}</h3>
  ),
  mark: ({ children, ...props }: any) => (
    <mark className="bg-slate-200 dark:bg-slate-700 rounded transition-all duration-300" {...props}>
      {children}
    </mark>
  ),
};

