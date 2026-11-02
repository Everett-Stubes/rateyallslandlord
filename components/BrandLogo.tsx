import React, { useId, useLayoutEffect, useRef, useState } from 'react';
import { logoSettings } from '../logoSettings';

interface FittedTextProps {
  text: string;
  x: number;
  y: number;
  fontSize: number;
  maxWidth: number;
  fill: string;
}

/**
 * Keep ordinary SVG text editable, shrinking only when a label would overflow.
 * Measure separately so an already-fitted label never affects its own sizing.
 */
function FittedText({ text, maxWidth, ...attributes }: FittedTextProps) {
  const measurement = useRef<SVGTextElement>(null);
  const [textLength, setTextLength] = useState<number | undefined>();

  useLayoutEffect(() => {
    let active = true;
    const measure = () => {
      if (!active || !measurement.current) return;
      const width = measurement.current.getComputedTextLength();
      setTextLength(width > maxWidth ? maxWidth : undefined);
    };
    measure();
    // Refit after the bundled font replaces the browser's initial fallback.
    void document.fonts.ready.then(measure);
    return () => { active = false; };
  }, [text, maxWidth]);

  return (
    <g aria-hidden="true">
      <text {...attributes} ref={measurement} visibility="hidden">{text}</text>
      <text {...attributes} textLength={textLength} lengthAdjust="spacingAndGlyphs">{text}</text>
    </g>
  );
}

interface BrandLogoProps {
  variant: 'header' | 'homepage';
  className?: string;
}

/** Both existing logo layouts, drawn from the same beginner-editable settings. */
export default function BrandLogo({ variant, className }: BrandLogoProps) {
  const titleId = useId();
  const { text, colors } = logoSettings;
  const isHeader = variant === 'header';
  const label = isHeader
    ? `${text.headerInitials} — ${text.headerSubtitle}`
    : [text.homepageLineOne, text.homepageLineTwo, text.pennantLabel].filter(Boolean).join(' ');

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={isHeader ? '0 0 1114 391' : '0 0 1502 346'}
      width={isHeader ? 1114 : 1502}
      height={isHeader ? 391 : 346}
      className={className}
      role="img"
      aria-labelledby={titleId}
      fontFamily="'GT America Condensed', Impact, 'Arial Narrow', sans-serif"
      fontWeight={700}
      focusable="false"
    >
      <title id={titleId}>{label}</title>
      {isHeader ? (
        <>
          <path d="M495 39 L1060 150 L495 266 Z" fill={colors.headerPennant} />
          <path d="M495 39 L515 43 L515 262 L495 266 Z" fill={colors.pennantStripe} />
          <FittedText text={text.headerInitials} x={10} y={254} fontSize={290} maxWidth={450} fill={colors.headerText} />
          <FittedText text={text.headerSubtitle} x={10} y={371} fontSize={112} maxWidth={1090} fill={colors.headerText} />
        </>
      ) : (
        <>
          <path d="M765 20 L1500 173 L765 325 Z" fill={colors.homepagePennant} />
          <path d="M765 20 L792 26 L792 319 L765 325 Z" fill={colors.pennantStripe} />
          <FittedText text={text.homepageLineOne} x={0} y={135} fontSize={166} maxWidth={735} fill={colors.homepageText} />
          <FittedText text={text.homepageLineTwo} x={0} y={317} fontSize={166} maxWidth={735} fill={colors.homepageText} />
          <FittedText text={text.pennantLabel} x={812} y={203} fontSize={79} maxWidth={485} fill={colors.pennantText} />
        </>
      )}
    </svg>
  );
}
