import { useState } from "react";

const SUPPORT_EMAIL = "supportgetvci@gmail.com";
const WHATSAPP_NUMBER = "919315133390";
const SUPPORT_PHONE = "+91 9315133390";
export default function Contact({ onBack }: { onBack: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name || !email || !message) return;
    setLoading(true);

    try {
      const res = await fetch("https://formspree.io/f/mgobalyw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          subject: subject || "General Enquiry",
          message,
          _replyto: email,
          _subject: `[VCI Support] ${subject || "Enquiry"} — from ${name}`
        })
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        setError("Something went wrong. Please try WhatsApp or Email directly.");
      }
    } catch {
      setError("Failed to send. Please contact us on WhatsApp.");
    }
    setLoading(false);
  };

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
      <style>{`
        * { box-sizing: border-box; }
        @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes orb1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(40px,-30px)} }
        @keyframes orb2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-40px,30px)} }
        .contact-input { transition: all 0.3s; outline: none; }
        .contact-input:focus { border-color: #a855f7 !important; box-shadow: 0 0 0 3px rgba(168,85,247,0.15) !important; }
        .contact-card:hover { border-color: rgba(168,85,247,0.4) !important; transform: translateY(-2px); }
        .contact-card { transition: all 0.3s; }
        input::placeholder, textarea::placeholder { color: #4b5563; }
      `}</style>

      <div style={{
        minHeight: "100vh", background: "#06040f",
        fontFamily: "'DM Sans', sans-serif", position: "relative", overflow: "hidden"
      }}>
        {/* Background orbs */}
        <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
          <div style={{
            position: "absolute", width: 600, height: 600, borderRadius: "50%",
            top: "-20%", left: "-10%",
            background: "radial-gradient(circle, rgba(139,92,246,0.25) 0%, transparent 70%)",
            animation: "orb1 12s ease-in-out infinite", filter: "blur(60px)"
          }} />
          <div style={{
            position: "absolute", width: 500, height: 500, borderRadius: "50%",
            bottom: "-15%", right: "-10%",
            background: "radial-gradient(circle, rgba(168,85,247,0.2) 0%, transparent 70%)",
            animation: "orb2 15s ease-in-out infinite", filter: "blur(70px)"
          }} />
          <div style={{
            position: "absolute", inset: 0,
            backgroundImage: "linear-gradient(rgba(139,92,246,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.03) 1px, transparent 1px)",
            backgroundSize: "60px 60px"
          }} />
        </div>

        {/* Header */}
        <div style={{
          position: "relative", zIndex: 1,
          background: "rgba(0,0,0,0.3)", backdropFilter: "blur(10px)",
          borderBottom: "1px solid rgba(139,92,246,0.15)",
          padding: "1rem 2rem", display: "flex", alignItems: "center", justifyContent: "space-between"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{
              background: "linear-gradient(135deg,#7c3aed,#a855f7)",
              borderRadius: "10px", padding: "0.4rem 0.7rem",
              fontSize: "1rem"
            }}>⚡</div>
            <span style={{
              fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: "1rem",
              background: "linear-gradient(135deg,#fff,#c084fc)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
            }}>Viral Content Intelligence</span>
          </div>
          <button onClick={onBack} style={{
            background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.3)",
            color: "#a855f7", padding: "0.4rem 1rem", borderRadius: "8px",
            cursor: "pointer", fontSize: "0.8rem", fontWeight: 700,
            fontFamily: "'DM Sans',sans-serif"
          }}>
            ← Back to Tool
          </button>
        </div>

        {/* Main Content */}
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "3rem 1.5rem", position: "relative", zIndex: 1 }}>

          {/* Hero */}
          <div style={{ textAlign: "center", marginBottom: "3rem", animation: "slideUp 0.5s ease" }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "0.4rem",
              background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.25)",
              borderRadius: "20px", padding: "0.3rem 1rem", marginBottom: "1rem"
            }}>
              <span style={{ fontSize: "0.65rem", color: "#a855f7", fontWeight: 700, letterSpacing: "0.1em" }}>💬 SUPPORT & CONTACT</span>
            </div>
            <h1 style={{
              fontFamily: "'Outfit',sans-serif", fontSize: "clamp(2rem,5vw,3rem)", fontWeight: 900,
              margin: "0 0 0.75rem",
              background: "linear-gradient(135deg,#fff 0%,#c084fc 50%,#a855f7 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
            }}>
              We're Here to Help
            </h1>
            <p style={{ color: "#6b7280", fontSize: "1rem", maxWidth: 500, margin: "0 auto" }}>
              Have a question or need support? Our team typically responds within 2 hours.
            </p>
          </div>

          {/* Contact Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: "1rem", marginBottom: "2.5rem" }}>

            {/* WhatsApp */}
            <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hi!%20I%20need%20help%20with%20Viral%20Content%20Tool`}
              target="_blank" rel="noopener noreferrer"
              className="contact-card"
              style={{
                background: "rgba(37,211,102,0.06)", border: "1px solid rgba(37,211,102,0.2)",
                borderRadius: "16px", padding: "1.5rem", textDecoration: "none",
                display: "flex", flexDirection: "column", gap: "0.5rem"
              }}>
              <div style={{ fontSize: "2rem" }}>💬</div>
              <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, color: "#fff", fontSize: "1rem" }}>WhatsApp</div>
              <div style={{ color: "#25d366", fontSize: "0.85rem", fontWeight: 600 }}>{SUPPORT_PHONE}</div>
              <div style={{ color: "#4b5563", fontSize: "0.78rem" }}>Fastest response — typically within 30 mins</div>
              <div style={{
                marginTop: "0.5rem", background: "linear-gradient(135deg,#25d366,#128c7e)",
                color: "#fff", borderRadius: "8px", padding: "0.5rem 1rem",
                fontSize: "0.82rem", fontWeight: 700, textAlign: "center"
              }}>
                Chat Now →
              </div>
            </a>

            {/* Email */}
            <a href={`mailto:${SUPPORT_EMAIL}?subject=Support Request - Viral Content Tool`}
              className="contact-card"
              style={{
                background: "rgba(168,85,247,0.06)", border: "1px solid rgba(168,85,247,0.2)",
                borderRadius: "16px", padding: "1.5rem", textDecoration: "none",
                display: "flex", flexDirection: "column", gap: "0.5rem"
              }}>
              <div style={{ fontSize: "2rem" }}>📧</div>
              <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, color: "#fff", fontSize: "1rem" }}>Email Support</div>
              <div style={{ color: "#a855f7", fontSize: "0.85rem", fontWeight: 600 }}>{SUPPORT_EMAIL}</div>
              <div style={{ color: "#4b5563", fontSize: "0.78rem" }}>For detailed queries — response within 2 hours</div>
              <div style={{
                marginTop: "0.5rem", background: "linear-gradient(135deg,#7c3aed,#a855f7)",
                color: "#fff", borderRadius: "8px", padding: "0.5rem 1rem",
                fontSize: "0.82rem", fontWeight: 700, textAlign: "center"
              }}>
                Send Email →
              </div>
            </a>

            {/* Phone */}
            <a href={`tel:${SUPPORT_PHONE.replace(/\s/g, "")}`}
              className="contact-card"
              style={{
                background: "rgba(6,182,212,0.06)", border: "1px solid rgba(6,182,212,0.2)",
                borderRadius: "16px", padding: "1.5rem", textDecoration: "none",
                display: "flex", flexDirection: "column", gap: "0.5rem"
              }}>
              <div style={{ fontSize: "2rem" }}>📞</div>
              <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, color: "#fff", fontSize: "1rem" }}>Phone Support</div>
              <div style={{ color: "#06b6d4", fontSize: "0.85rem", fontWeight: 600 }}>{SUPPORT_PHONE}</div>
              <div style={{ color: "#4b5563", fontSize: "0.78rem" }}>Mon–Sat, 10 AM – 7 PM IST</div>
              <div style={{
                marginTop: "0.5rem", background: "linear-gradient(135deg,#0891b2,#06b6d4)",
                color: "#fff", borderRadius: "8px", padding: "0.5rem 1rem",
                fontSize: "0.82rem", fontWeight: 700, textAlign: "center"
              }}>
                Call Now →
              </div>
            </a>
          </div>

          {/* Enquiry Form */}
          {!submitted ? (
            <div style={{
              background: "rgba(255,255,255,0.02)", border: "1px solid rgba(139,92,246,0.2)",
              borderRadius: "20px", padding: "2rem", animation: "slideUp 0.6s ease"
            }}>
              <h2 style={{
                fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: "1.4rem",
                margin: "0 0 0.4rem",
                background: "linear-gradient(135deg,#fff,#c084fc)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
              }}>
                Send us a Message
              </h2>
              <p style={{ color: "#4b5563", fontSize: "0.85rem", margin: "0 0 1.5rem" }}>
                Fill the form below — we'll get back to you on your email.
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                <div>
                  <label style={{ color: "#6b7280", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.06em", display: "block", marginBottom: "0.4rem" }}>YOUR NAME *</label>
                  <input value={name} onChange={e => setName(e.target.value)}
                    placeholder="John Doe" className="contact-input"
                    style={{
                      width: "100%", background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px",
                      padding: "0.8rem 1rem", color: "#fff", fontSize: "0.88rem",
                      fontFamily: "'DM Sans',sans-serif"
                    }} />
                </div>
                <div>
                  <label style={{ color: "#6b7280", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.06em", display: "block", marginBottom: "0.4rem" }}>YOUR EMAIL *</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="john@email.com" className="contact-input"
                    style={{
                      width: "100%", background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px",
                      padding: "0.8rem 1rem", color: "#fff", fontSize: "0.88rem",
                      fontFamily: "'DM Sans',sans-serif"
                    }} />
                </div>
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label style={{ color: "#6b7280", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.06em", display: "block", marginBottom: "0.4rem" }}>SUBJECT</label>
                <input value={subject} onChange={e => setSubject(e.target.value)}
                  placeholder="e.g. Payment issue / Plan upgrade / General query"
                  className="contact-input"
                  style={{
                    width: "100%", background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px",
                    padding: "0.8rem 1rem", color: "#fff", fontSize: "0.88rem",
                    fontFamily: "'DM Sans',sans-serif"
                  }} />
              </div>

              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{ color: "#6b7280", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.06em", display: "block", marginBottom: "0.4rem" }}>MESSAGE *</label>
                <textarea value={message} onChange={e => setMessage(e.target.value)}
                  placeholder="Describe your issue or query in detail..."
                  rows={5} className="contact-input"
                  style={{
                    width: "100%", background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px",
                    padding: "0.8rem 1rem", color: "#fff", fontSize: "0.88rem",
                    fontFamily: "'DM Sans',sans-serif", resize: "vertical"
                  }} />
              </div>

              <button onClick={handleSubmit} disabled={loading || !name || !email || !message}
                style={{
                  width: "100%", padding: "0.95rem", borderRadius: "12px",
                  background: (!name || !email || !message) ? "rgba(139,92,246,0.2)" : "linear-gradient(135deg,#7c3aed,#a855f7)",
                  border: "none", color: (!name || !email || !message) ? "#4b5563" : "#fff",
                  fontWeight: 800, fontSize: "0.95rem",
                  cursor: (!name || !email || !message) ? "not-allowed" : "pointer",
                  fontFamily: "'Outfit',sans-serif",
                  boxShadow: (!name || !email || !message) ? "none" : "0 8px 32px rgba(139,92,246,0.4)"
                }}>
                {loading ? "⚡ Sending..." : "📧 Send Message"}
              </button>

              <p style={{ color: "#374151", fontSize: "0.75rem", textAlign: "center", marginTop: "0.75rem" }}>
                Your message will open in your email app — just hit send!
              </p>
            </div>
          ) : (
            <div style={{
              textAlign: "center", padding: "3rem",
              background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.2)",
              borderRadius: "20px", animation: "slideUp 0.4s ease"
            }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🎉</div>
              <h3 style={{ fontFamily: "'Outfit',sans-serif", color: "#fff", fontSize: "1.3rem", marginBottom: "0.5rem" }}>Message Sent!</h3>
              <p style={{ color: "#6b7280", fontSize: "0.88rem" }}>We'll get back to you within 2 hours on <strong style={{ color: "#a855f7" }}>{email}</strong></p>
              <button onClick={() => setSubmitted(false)} style={{
                marginTop: "1.5rem", background: "rgba(168,85,247,0.1)",
                border: "1px solid rgba(168,85,247,0.3)", color: "#a855f7",
                padding: "0.6rem 1.5rem", borderRadius: "10px", cursor: "pointer",
                fontWeight: 700, fontFamily: "'DM Sans',sans-serif"
              }}>
                Send Another Message
              </button>
            </div>
          )}

          {/* FAQ */}
          <div style={{ marginTop: "2.5rem" }}>
            <h2 style={{
              fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: "1.3rem",
              margin: "0 0 1.25rem", color: "#fff"
            }}>
              ❓ Common Questions
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {[
                ["How do I upgrade my plan?", "Click 'Upgrade Now' in the tool, complete the UPI payment, and send us the screenshot on WhatsApp. We'll activate within 2 hours."],
                ["How many generations do I get on free plan?", "Free plan gives you 3 generations to try the tool. Upgrade to Starter (50/mo), Pro (150/mo), or Agency (Unlimited)."],
                ["What payment methods do you accept?", "We accept UPI (GPay, PhonePe, Paytm) for Indian users. International payments via PayPal."],
                ["Can I get a refund?", "Yes! If you're not satisfied within 24 hours of purchase, contact us on WhatsApp for a full refund."],
              ].map(([q, a], i) => (
                <div key={i} style={{
                  background: "rgba(255,255,255,0.02)", border: "1px solid rgba(139,92,246,0.1)",
                  borderRadius: "12px", padding: "1rem 1.25rem"
                }}>
                  <p style={{ margin: "0 0 0.4rem", fontWeight: 700, color: "#fff", fontSize: "0.88rem" }}>Q: {q}</p>
                  <p style={{ margin: 0, color: "#6b7280", fontSize: "0.82rem", lineHeight: 1.6 }}>{a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
