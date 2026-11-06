/** Renders collected plain-text descriptions with paragraphs and bullets preserved. */
export function Description({ text }: { text: string }) {
  const blocks = text.split(/\n{2,}/).map((b) => b.split('\n').map((l) => l.trim()).filter(Boolean)).filter((b) => b.length);
  return (
    <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-ink/85">
      {blocks.map((lines, i) =>
        lines.every((l) => /^[-•*·]/.test(l)) ? (
          <ul key={i} className="list-disc space-y-1 pl-5">{lines.map((l, k) => <li key={k}>{l.replace(/^[-•*·]\s*/, '')}</li>)}</ul>
        ) : (
          <div key={i}>{lines.map((l, k) => (/^[-•*·]/.test(l) ? <p key={k} className="pl-4">• {l.replace(/^[-•*·]\s*/, '')}</p> : <p key={k} className={lines.length > 1 && k === 0 && l.length < 60 ? 'font-semibold text-ink' : ''}>{l}</p>))}</div>
        ),
      )}
    </div>
  );
}
