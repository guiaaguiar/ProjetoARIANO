import React, { useEffect, useState } from 'react';

interface TypewriterTextProps {
  text: string;
  speed?: number; // ms per character
  delay?: number; // initial delay ms
  className?: string;
  cursor?: boolean;
  onComplete?: () => void;
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  speed = 28,
  delay = 0,
  className = '',
  cursor = true,
  onComplete,
}) => {
  const [displayed, setDisplayed] = useState('');
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed('');
    setDone(false);
    setStarted(false);
    const startTimer = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(startTimer);
  }, [text, delay]);

  useEffect(() => {
    if (!started) return;
    if (displayed.length >= text.length) {
      setDone(true);
      onComplete?.();
      return;
    }
    const t = setTimeout(() => {
      setDisplayed(text.slice(0, displayed.length + 1));
    }, speed);
    return () => clearTimeout(t);
  }, [started, displayed, text, speed, onComplete]);

  return (
    <span className={className}>
      {displayed}
      {cursor && !done && (
        <span
          className="inline-block w-0.5 h-[1em] bg-current ml-0.5 align-middle animate-[blink_0.9s_step-end_infinite]"
          style={{ verticalAlign: 'text-bottom' }}
        />
      )}
    </span>
  );
};

/** Loop typewriter — repeats through an array of strings */
export const LoopTypewriter: React.FC<{
  strings: string[];
  speed?: number;
  pauseMs?: number;
  className?: string;
}> = ({ strings, speed = 40, pauseMs = 1800, className = '' }) => {
  const [idx, setIdx] = useState(0);
  const [key, setKey] = useState(0);

  const handleComplete = () => {
    setTimeout(() => {
      setIdx((prev) => (prev + 1) % strings.length);
      setKey((k) => k + 1);
    }, pauseMs);
  };

  return (
    <TypewriterText
      key={key}
      text={strings[idx]}
      speed={speed}
      className={className}
      onComplete={handleComplete}
    />
  );
};
