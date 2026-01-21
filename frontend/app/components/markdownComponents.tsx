import { ComponentPropsWithoutRef } from 'react';
import { Components } from 'react-markdown';

export const markdownComponents: Partial<Components> = {
  p: ({ children, ...props }: ComponentPropsWithoutRef<'p'>) => (
    <p
      className="whitespace-pre-wrap break-words text-sm sm:text-base leading-relaxed mb-2 last:mb-0"
      {...props}
    >
      {children}
    </p>
  ),
  code: ({ children, className, ...props }: ComponentPropsWithoutRef<'code'>) => {
    const isInline = !className;
    return isInline ? (
      <code
        className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-sm font-mono"
        {...props}
      >
        {children}
      </code>
    ) : (
      <code className={className} {...props}>
        {children}
      </code>
    );
  },
  pre: ({ children, ...props }: ComponentPropsWithoutRef<'pre'>) => (
    <pre
      className="bg-slate-100 dark:bg-slate-800 p-3 rounded-lg overflow-x-auto text-sm my-2"
      {...props}
    >
      {children}
    </pre>
  ),
  ul: ({ children, ...props }: ComponentPropsWithoutRef<'ul'>) => (
    <ul className="list-disc list-inside space-y-1 my-2" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }: ComponentPropsWithoutRef<'ol'>) => (
    <ol className="list-decimal list-inside space-y-1 my-2" {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }: ComponentPropsWithoutRef<'li'>) => (
    <li className="text-sm sm:text-base" {...props}>
      {children}
    </li>
  ),
  strong: ({ children, ...props }: ComponentPropsWithoutRef<'strong'>) => (
    <strong className="font-semibold" {...props}>
      {children}
    </strong>
  ),
  em: ({ children, ...props }: ComponentPropsWithoutRef<'em'>) => (
    <em className="italic" {...props}>
      {children}
    </em>
  ),
  blockquote: ({ children, ...props }: ComponentPropsWithoutRef<'blockquote'>) => (
    <blockquote
      className="border-l-4 border-slate-300 dark:border-slate-600 pl-4 my-2 italic"
      {...props}
    >
      {children}
    </blockquote>
  ),
  h1: ({ children, ...props }: ComponentPropsWithoutRef<'h1'>) => (
    <h1 className="text-xl sm:text-2xl font-bold mt-4 mb-2" {...props}>
      {children}
    </h1>
  ),
  h2: ({ children, ...props }: ComponentPropsWithoutRef<'h2'>) => (
    <h2 className="text-lg sm:text-xl font-bold mt-3 mb-2" {...props}>
      {children}
    </h2>
  ),
  h3: ({ children, ...props }: ComponentPropsWithoutRef<'h3'>) => (
    <h3 className="text-base sm:text-lg font-semibold mt-2 mb-1" {...props}>
      {children}
    </h3>
  ),
  mark: ({ children, ...props }: ComponentPropsWithoutRef<'mark'>) => (
    <mark
      className="bg-slate-200 dark:bg-slate-700 rounded transition-all duration-300"
      {...props}
    >
      {children}
    </mark>
  ),
};
