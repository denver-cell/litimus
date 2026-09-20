import type { Source } from "@/lib/content";

// Reference list for the bottom of a content page. External links open in the
// same tab but carry rel="noopener noreferrer".
export default function Sources({ items, note }: { items: Source[]; note?: string }) {
  return (
    <section className="sources" style={{ padding: 0 }}>
      <h2>Sources</h2>
      {note && <p>{note}</p>}
      <ol>
        {items.map((s) => (
          <li key={s.href}>
            <a href={s.href} rel="noopener noreferrer">
              {s.label}
            </a>
            {s.note ? <> — {s.note}</> : null}
          </li>
        ))}
      </ol>
    </section>
  );
}
