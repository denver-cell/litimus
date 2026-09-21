"use client";

import { useState } from "react";
import { FAQ_ITEMS } from "@/lib/content";

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
