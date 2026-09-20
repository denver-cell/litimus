// Renders a JSON-LD structured-data block. Server component — the script is
// in the initial HTML, so crawlers see it without running JavaScript.
export default function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // "<" is escaped so no string value can ever close the script tag.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
