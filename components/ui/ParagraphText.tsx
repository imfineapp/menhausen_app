import React from 'react';

interface ParagraphTextProps {
  text: string;
  className?: string;
  paragraphClassName?: string;
}

export function ParagraphText({ text, className = 'flex flex-col gap-3', paragraphClassName = 'block' }: ParagraphTextProps) {
  const paragraphs = text
    .split('\n\n')
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  if (paragraphs.length <= 1) {
    return <p className={paragraphClassName}>{text}</p>;
  }

  return (
    <div className={className}>
      {paragraphs.map((paragraph, index) => (
        <p key={`${index}-${paragraph.slice(0, 16)}`} className={paragraphClassName}>
          {paragraph}
        </p>
      ))}
    </div>
  );
}
