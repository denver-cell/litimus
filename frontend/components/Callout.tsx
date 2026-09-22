// Boxed-note style used inline throughout the hand-written /for and /guides
// pages (see e.g. app/for/teachers/page.tsx). Exposed as an MDX component so
// pre-written articles in content/articles/ can use the same treatment.
export default function Callout({ children }: { children: React.ReactNode }) {
  return <div className="callout">{children}</div>;
}
