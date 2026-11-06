// Minimal Markdown for generated documents: #/## headings, "- " bullets, **bold**, paragraphs.
function inline(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) => (part.startsWith('**') && part.endsWith('**') ? <strong key={i}>{part.slice(2, -2)}</strong> : part));
}

export function Markdown({ source }: { source: string }) {
  const out: React.ReactNode[] = [];
  let list: string[] = [];
  const flush = () => { if (list.length) out.push(<ul key={out.length} className="my-1 list-disc space-y-0.5 pl-5">{list.map((l, i) => <li key={i}>{inline(l)}</li>)}</ul>); list = []; };
  for (const raw of source.split('\n')) {
    const line = raw.trimEnd();
    if (/^\s*[-*•]\s+/.test(line)) { list.push(line.replace(/^\s*[-*•]\s+/, '')); continue; }
    flush();
    if (!line.trim()) continue;
    if (line.startsWith('# ')) out.push(<h1 key={out.length} className="text-center font-display text-2xl font-extrabold">{inline(line.slice(2))}</h1>);
    else if (line.startsWith('## ')) out.push(<h2 key={out.length} className="mt-4 border-b border-ink/20 pb-0.5 text-sm font-bold uppercase tracking-wider">{inline(line.slice(3))}</h2>);
    else if (line.startsWith('### ')) out.push(<h3 key={out.length} className="mt-2 font-semibold">{inline(line.slice(4))}</h3>);
    else out.push(<p key={out.length} className="my-1.5">{inline(line)}</p>);
  }
  flush();
  return <div className="text-[13.5px] leading-snug text-ink">{out}</div>;
}
