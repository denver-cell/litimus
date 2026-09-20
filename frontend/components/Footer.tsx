import Link from "next/link";

export default function Footer() {
  return (
    <footer>
      <div className="wrap">
        <div>© {new Date().getFullYear()} Litimus. Not a substitute for editorial judgment.</div>
        <div className="foot-links">
          <Link href="/pricing">Pricing</Link>
          <Link href="/guides">Guides</Link>
          <Link href="/compare">Compare</Link>
          <Link href="/for/teachers">For teachers</Link>
          <Link href="/for/students">For students</Link>
          <Link href="/for/writers-and-editors">For writers</Link>
          <Link href="/#faq">FAQ</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/refund-policy">Refunds</Link>
          <Link href="/docs/api">API docs</Link>
        </div>
      </div>
    </footer>
  );
}
