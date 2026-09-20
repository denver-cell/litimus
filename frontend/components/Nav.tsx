import Link from "next/link";
import NavAuth from "./NavAuth";

export default function Nav() {
  return (
    <header>
      <nav className="wrap">
        <Link href="/" className="logo">
          <span className="logo-mark" />
          Litimus
        </Link>
        <div className="navlinks">
          <Link href="/#detector">Detector</Link>
          <Link href="/#how">How it works</Link>
          <Link href="/#signals">Signals</Link>
          <Link href="/pricing">Pricing</Link>
          <Link href="/guides">Guides</Link>
          <Link href="/#faq">FAQ</Link>
        </div>
        <NavAuth />
      </nav>
    </header>
  );
}
