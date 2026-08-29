import Link from "next/link";

export default function Footer() {
  return (
    <footer>
      <div className="wrap">
        <div>© {new Date().getFullYear()} Litimus. Not a substitute for editorial judgment.</div>
        <div className="foot-links">
          <Link href="/pricing">Pricing</Link>
          <Link href="/#faq">FAQ</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/docs/api">API docs</Link>
        </div>
      </div>
    </footer>
  );
}
