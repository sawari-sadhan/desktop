"use client";

/* Exact copy of github/esona/web/app/components/chat/markdown-formatter.tsx */

import React from "react";

interface FormattedTextProps {
  text: string;
}

export const FormattedText: React.FC<FormattedTextProps> = ({ text }) => {
  const formatLine = (line: string, lineKey: number): React.ReactNode => {
    const trimmedLine = line.trim();

    if (/^---+$/.test(trimmedLine)) {
      return (
        <div key={lineKey} className="my-4 sm:my-5 md:my-6">
          <hr className="border-0 border-t border-white/20" />
        </div>
      );
    }

    const headerMatch = trimmedLine.match(/^(#{1,6})\s+(.+)$/);
    if (headerMatch) {
      const level = headerMatch[1].length;
      const headerText = headerMatch[2];
      const headerClasses: Record<number, string> = {
        1: "text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4 mt-4 sm:mt-5",
        2: "text-base sm:text-lg md:text-xl font-bold mb-2.5 sm:mb-3 mt-3 sm:mt-4",
        3: "text-sm sm:text-base md:text-lg font-semibold mb-2 sm:mb-2.5 mt-2.5 sm:mt-3",
        4: "text-xs sm:text-sm md:text-base font-semibold mb-2 sm:mb-2.5 mt-2 sm:mt-2.5",
        5: "text-xs sm:text-sm font-semibold mb-1.5 sm:mb-2 mt-2 sm:mt-2.5",
        6: "text-xs font-semibold mb-1.5 sm:mb-2 mt-2 sm:mt-2.5",
      };
      return (
        <h3 key={lineKey} className={`text-white ${headerClasses[level] || headerClasses[3]}`}>
          {formatInlineText(headerText)}
        </h3>
      );
    }

    const numberedMatch = line.match(/^(\s*)(\d+)\.\s+(.+)$/);
    if (numberedMatch) {
      const indent = numberedMatch[1].length;
      const number = numberedMatch[2];
      const content = numberedMatch[3];
      const indentPx = Math.min(indent * 8, 64);
      return (
        <div
          key={lineKey}
          className="flex gap-2.5 sm:gap-3 md:gap-3.5 my-2 sm:my-2.5"
          style={{ marginLeft: indentPx > 0 ? `${indentPx}px` : undefined }}
        >
          <span className="text-cyan-400/80 font-semibold flex-shrink-0 min-w-[1.5rem] sm:min-w-[1.75rem] text-xs sm:text-sm md:text-base">
            {number}.
          </span>
          <span className="flex-1">{formatInlineText(content)}</span>
        </div>
      );
    }

    const bulletMatch = line.match(/^(\s*)[-*]\s+(.+)$/);
    if (bulletMatch) {
      const indent = bulletMatch[1].length;
      const content = bulletMatch[2];
      const indentPx = Math.min(indent * 8, 64);
      return (
        <div
          key={lineKey}
          className="flex gap-2.5 sm:gap-3 md:gap-3.5 my-2 sm:my-2.5"
          style={{ marginLeft: indentPx > 0 ? `${indentPx}px` : undefined }}
        >
          <span className="text-cyan-400/80 font-semibold flex-shrink-0 text-xs sm:text-sm md:text-base">•</span>
          <span className="flex-1">{formatInlineText(content)}</span>
        </div>
      );
    }

    if (trimmedLine) {
      return (
        <div key={lineKey} className="my-2 sm:my-2.5">
          {formatInlineText(trimmedLine)}
        </div>
      );
    }

    return <br key={lineKey} />;
  };

  const formatInlineText = (text: string): React.ReactNode[] => {
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let key = 0;

    const patterns: Array<{
      regex: RegExp;
      render: (content: string, fullMatch: string) => React.ReactNode;
      priority: number;
    }> = [
      {
        regex: /`([^`]+)`/g,
        render: (content) => (
          <code
            key={`code-${key++}`}
            className="bg-white/10 text-cyan-300/90 px-1 sm:px-1.5 py-0.5 rounded font-mono text-[10px] sm:text-xs md:text-sm"
          >
            {content}
          </code>
        ),
        priority: 1,
      },
      {
        regex: /(\*\*|__)(.+?)\1/g,
        render: (content) => (
          <strong key={`bold-${key++}`} className="font-semibold text-white text-xs sm:text-sm md:text-base lg:text-[15px]">
            {content}
          </strong>
        ),
        priority: 2,
      },
      {
        regex: /(?<!\*)\*([^*]+?)\*(?!\*)/g,
        render: (content) => (
          <em key={`italic-${key++}`} className="italic text-white/90 text-xs sm:text-sm md:text-base lg:text-[15px]">
            {content}
          </em>
        ),
        priority: 3,
      },
    ];

    const allMatches: Array<{
      index: number;
      length: number;
      node: React.ReactNode;
      priority: number;
      endIndex: number;
    }> = [];

    patterns.forEach(({ regex, render, priority }) => {
      const matches = Array.from(text.matchAll(regex));
      matches.forEach((match) => {
        if (match.index !== undefined) {
          allMatches.push({
            index: match.index,
            length: match[0].length,
            node: render(match[2] || match[1] || "", match[0]),
            priority,
            endIndex: match.index + match[0].length,
          });
        }
      });
    });

    allMatches.sort((a, b) => {
      if (a.index !== b.index) return a.index - b.index;
      return a.priority - b.priority;
    });

    const filteredMatches: typeof allMatches = [];
    for (let i = 0; i < allMatches.length; i++) {
      const current = allMatches[i];
      let overlaps = false;
      for (let j = 0; j < filteredMatches.length; j++) {
        const existing = filteredMatches[j];
        if (
          (current.index < existing.endIndex && current.endIndex > existing.index) ||
          (existing.index < current.endIndex && existing.endIndex > current.index)
        ) {
          if (current.priority < existing.priority) {
            filteredMatches[j] = current;
          }
          overlaps = true;
          break;
        }
      }
      if (!overlaps) {
        filteredMatches.push(current);
      }
    }

    filteredMatches.forEach((match) => {
      if (match.index > lastIndex) {
        const beforeText = text.substring(lastIndex, match.index);
        if (beforeText) parts.push(beforeText);
      }
      parts.push(match.node);
      lastIndex = match.endIndex;
    });

    if (lastIndex < text.length) {
      const remainingText = text.substring(lastIndex);
      if (remainingText) parts.push(remainingText);
    }

    return parts.length > 0 ? parts : [text];
  };

  const codeBlockRegex = /```([\s\S]*?)```/g;
  const codeBlocks: Array<{ index: number; content: string; key: number }> = [];
  let codeBlockKey = 0;
  let processedText = text;

  const codeBlockMatches = Array.from(text.matchAll(codeBlockRegex));
  codeBlockMatches.forEach((match) => {
    if (match.index !== undefined) {
      codeBlocks.push({ index: match.index, content: match[1].trim(), key: codeBlockKey++ });
      processedText = processedText.replace(match[0], `__CODE_BLOCK_${codeBlockKey - 1}__`);
    }
  });

  const lines = processedText.split("\n");
  const formattedLines: React.ReactNode[] = [];
  let key = 0;

  lines.forEach((line) => {
    const codeBlockMatch = line.match(/^__CODE_BLOCK_(\d+)__$/);
    if (codeBlockMatch) {
      const blockIndex = parseInt(codeBlockMatch[1]);
      const codeBlock = codeBlocks[blockIndex];
      if (codeBlock) {
        formattedLines.push(
          <pre
            key={`codeblock-${key++}`}
            className="bg-white/5 border border-white/10 rounded-lg p-3 sm:p-4 my-3 sm:my-4 overflow-x-auto font-mono text-[10px] sm:text-xs md:text-sm"
          >
            <code className="text-cyan-300/90 whitespace-pre">{codeBlock.content}</code>
          </pre>
        );
      }
    } else {
      formattedLines.push(formatLine(line, key++));
    }
  });

  return <div className="markdown-content">{formattedLines}</div>;
};

export default FormattedText;
