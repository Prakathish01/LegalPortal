import React, { useState } from "react";

const FAQS = [
  {
    q: "How long does it take for my case to be reviewed?",
    a: "Most cases are reviewed and assigned to an advocate within 1-2 business days. Critical priority cases (e.g. POSH complaints) are typically actioned within 24 hours.",
    cat: "General",
  },
  {
    q: "Is my whistleblower report really anonymous?",
    a: "Yes. Whistleblower reports are not linked to your employee account in any way. You receive a Reference Number to track status, but there is no stored connection between that report and your identity.",
    cat: "Whistleblower",
  },
  {
    q: "What happens if I file a POSH / harassment complaint?",
    a: "Your case is automatically routed to the Internal Complaints Committee (ICC) with full confidentiality. It is never visible to your reporting manager or department, regardless of who it's filed against.",
    cat: "POSH",
  },
  {
    q: "Can the AI Advocate reject my case?",
    a: "The AI Advocate will let you know upfront if an issue appears to be outside what Legal Services can help with (for example, situations caused by a clear policy violation on the employee's side). You can still file manually if you believe it was a mistake — a human always reviews manual filings.",
    cat: "AI Advocate",
  },
  {
    q: "How do I track the status of an existing case?",
    a: "Go to \"My Cases\" from the sidebar. Each case shows a visual progress tracker (Open → In Progress → Under Review → Closed) along with who is currently handling it.",
    cat: "General",
  },
  {
    q: "What's the difference between filing manually and using the AI Advocate?",
    a: "Filing manually lets you pick the category and priority yourself. The AI Advocate reads your description, classifies it, sets a priority, and — if appropriate — immediately assigns an advocate, all in one conversation.",
    cat: "AI Advocate",
  },
  {
    q: "Who can see my case details?",
    a: "Only the assigned advocate/agent, the Legal Manager, and Admin can see full case details. POSH cases are restricted further to ICC Members only.",
    cat: "Privacy",
  },
  {
    q: "Can I attach documents to my case?",
    a: "Yes, once your case is filed, open it from \"My Cases\" and use the Attachments tab to add supporting documents.",
    cat: "General",
  },
  {
    q: "Can I request a notice period buyout?",
    a: "Notice period buyout is permissible only under exceptional circumstances and requires written approval from your Department Head and HR Director. The buyout cost is calculated based on the employee's gross monthly salary for the unexpired portion of the 90-day notice period.",
    cat: "Employment Law",
  },
  {
    q: "What rights do I have during disciplinary proceedings?",
    a: "Under our Conduct, Discipline & Appeal (CDA) rules, you have the right to receive a written charge sheet with supporting documents, inspect evidence, nominate a co-employee as defence representative, cross-examine witnesses, and appeal any penalty within 45 days.",
    cat: "Disciplinary",
  },
  {
    q: "How does the company assist with Consumer Court cases?",
    a: "Legal Services provides document preparation, legal notice drafting, and advisory support for disputes involving banks, e-commerce, insurance, or telecom. We help you prepare formal submissions to the District Consumer Disputes Redressal Commission or the Banking Ombudsman, but do not represent you in hearings.",
    cat: "Consumer Rights",
  },
  {
    q: "How does RAG verification work in the new complaint form?",
    a: "When you type a grievance, our client-side Retrieval-Augmented Generation (RAG) engine scans the text for keywords and matches it against company policies using a hybrid tf-idf, stemming, and substring algorithm. It automatically suggests the most accurate category and priority level before you submit.",
    cat: "AI Advocate",
  },
];

const CATEGORIES = ["All", ...new Set(FAQS.map((f) => f.cat))];

const FAQView = () => {
  const [openIdx, setOpenIdx] = useState(null);
  const [filter, setFilter] = useState("All");

  const filtered = FAQS.filter((f) => filter === "All" || f.cat === filter);

  return (
    <div style={{ animation: "fadeIn 0.2s ease-out" }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--color-navy-dark)", marginBottom: 6 }}>
        FAQ & Resources
      </h2>
      <p style={{ fontSize: 12.5, color: "hsl(215, 10%, 50%)", marginBottom: 20 }}>
        Common questions about filing, tracking, and confidentiality.
      </p>

      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            style={{
              padding: "6px 14px",
              borderRadius: 999,
              border: "1px solid",
              borderColor: filter === c ? "var(--color-blue)" : "#D1D5DB",
              background: filter === c ? "var(--color-blue)" : "#fff",
              color: filter === c ? "#fff" : "hsl(215, 15%, 40%)",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {c}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.map((f, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={f.q}
              style={{
                background: "#fff",
                border: "1px solid #E5E7EB",
                borderRadius: 12,
                overflow: "hidden",
              }}
            >
              <button
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                style={{
                  width: "100%",
                  padding: "16px 18px",
                  background: "none",
                  border: "none",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--color-navy-dark)" }}>{f.q}</span>
                <span style={{ fontSize: 14, color: "hsl(215, 10%, 55%)", transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
                  ▾
                </span>
              </button>
              {isOpen && (
                <div style={{ padding: "0 18px 16px", fontSize: 12.5, color: "hsl(215, 10%, 40%)", lineHeight: 1.6 }}>
                  {f.a}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div
        style={{
          marginTop: 24,
          background: "linear-gradient(135deg, var(--color-navy), #1E293B)",
          borderRadius: 14,
          padding: 20,
          color: "#fff",
          display: "flex",
          alignItems: "center",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <span style={{ fontSize: 28 }}>💬</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 4 }}>Still have questions?</div>
          <div style={{ fontSize: 12, color: "hsl(217, 25%, 75%)" }}>
            Our AI Advocate Assistant can answer questions and route your specific issue in real time.
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQView;
