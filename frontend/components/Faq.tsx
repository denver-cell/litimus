"use client";

import { useState } from "react";

const FAQ_ITEMS = [
  {
    q: "Can Litimus tell me for certain that something was written by AI?",
    a: "No — and no detector on the market can, honestly. Litimus gives you a probability based on writing patterns, plus the exact reasons behind the number, so you can weigh it yourself rather than take a black-box verdict.",
  },
  {
    q: "How is the student plan verified?",
    a: "Through a third-party student-verification service (the kind Spotify and Amazon use for student pricing) rather than a bare .edu check — it recognizes academic domains and enrollment records across most countries, not just the US, and falls back to a student-ID upload if your institution doesn't use a standard email pattern. We re-verify once a year.",
  },
  {
    q: "Do you store the text I scan?",
    a: "Free and Student scans are processed in-session and discarded. Pro and Team plans can opt into saved report history for their own records — off by default.",
  },
  {
    q: "Does heavy editing of AI output fool the detector?",
    a: "Often, yes, to a degree — this is a known limit of statistical detection industry-wide, which is why we show a confidence range and margin notes instead of a bare pass/fail stamp.",
  },
  {
    q: "What if I just need more words for one deadline?",
    a: "Buy a one-time day pass ($3) instead of upgrading your plan — it adds 10,000 words to your limit for 24 hours, works on top of Free or any paid tier, and doesn't auto-renew or commit you to anything ongoing.",
  },
  {
    q: "Is there an API?",
    a: "Yes, on the Team & API plan — REST endpoints for scanning, batch jobs, and webhook callbacks, billed on included volume plus metered overage.",
  },
];

export default function Faq() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="faq" id="faq">
      <div className="wrap">
        <div className="section-head">
          <div className="section-eyebrow">Questions</div>
          <h2>Before you paste anything in.</h2>
        </div>
        <div className="faq-list">
          {FAQ_ITEMS.map((item, i) => (
            <div key={i} className={`faq-item ${openIndex === i ? "open" : ""}`}>
              <div className="faq-q" onClick={() => setOpenIndex(openIndex === i ? -1 : i)}>
                {item.q}
              </div>
              <div className="faq-a">{item.a}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
