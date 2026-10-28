import React, { useMemo } from 'react';
import katex from 'katex';

interface MathViewProps {
  math: string;
  block?: boolean;
  className?: string;
}

export const MathView: React.FC<MathViewProps> = ({ math, block = true, className = '' }) => {
  const renderedHtml = useMemo(() => {
    if (!math || !math.trim()) {
      return { html: '', hasError: false, errorMsg: '' };
    }

    try {
      const html = katex.renderToString(math.trim(), {
        displayMode: block,
        throwOnError: false,
        output: 'htmlAndMathml',
      });
      return { html, hasError: false, errorMsg: '' };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Error de sintaxis LaTeX';
      return { html: '', hasError: true, errorMsg };
    }
  }, [math, block]);

  if (!math || !math.trim()) {
    return <span className="text-slate-500 italic text-sm">(fórmula vacía)</span>;
  }

  if (renderedHtml.hasError) {
    return (
      <span className="inline-block p-1 bg-red-950/60 border border-red-500/40 rounded text-red-300 font-mono text-xs">
        ⚠ Error LaTeX: {renderedHtml.errorMsg}
      </span>
    );
  }

  return (
    <div
      className={`math-render overflow-x-auto py-1 max-w-full ${block ? 'my-2 flex justify-center' : 'inline'} ${className}`}
      dangerouslySetInnerHTML={{ __html: renderedHtml.html }}
    />
  );
};
