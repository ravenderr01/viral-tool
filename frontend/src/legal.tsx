import { useState } from "react";

const COMPANY = "Global Web Info Vision";
const TOOL = "VCI — Viral Content Intelligence";
const WEBSITE = "https://www.getvci.com";
const EMAIL = "supportgetvci@gmail.com";
const WHATSAPP = "+91 93151 33390";

export default function Legal({ page, onBack }: { page: "privacy" | "terms" | "refund"; onBack: () => void }) {

  const Section = ({ title, children }: any) => (
    <div style={{ marginBottom: "2rem" }}>
      <h2 style={{
        fontFamily: "'Outfit',sans-serif", fontSize: "1.1rem", fontWeight: 800,
        color: "#fff", margin: "0 0 0.75rem",
        borderLeft: "3px solid #a855f7", paddingLeft: "0.75rem"
      }}>{title}</h2>
      <div style={{ color: "#9ca3af", fontSize: "0.88rem", lineHeight: 1.8 }}>
        {children}
      </div>
    </div>
  );

  const P = ({ children }: any) => (
    <p style={{ margin: "0 0 0.75rem" }}>{children}</p>
  );

  const Li = ({ children }: any) => (
    <li style={{ marginBottom: "0.4rem", paddingLeft: "0.5rem" }}>{children}</li>
  );

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
      <style>{`
        * { box-sizing: border-box; }
        @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        ul { padding-left: 1.5rem; margin: 0 0 0.75rem; }
      `}</style>

      <div style={{
        minHeight: "100vh", background: "#06040f",
        fontFamily: "'DM Sans', sans-serif", color: "#fff"
      }}>
        {/* Header */}
        <div style={{
          background: "rgba(0,0,0,0.4)", backdropFilter: "blur(10px)",
          borderBottom: "1px solid rgba(139,92,246,0.15)",
          padding: "1rem 2rem", display: "flex", alignItems: "center",
          justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{
              background: "linear-gradient(135deg,#7c3aed,#a855f7)",
              borderRadius: "10px", padding: "0.4rem 0.7rem", fontSize: "1rem"
            }}>⚡</div>
            <span style={{
              fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: "1rem",
              background: "linear-gradient(135deg,#fff,#c084fc)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
            }}>{TOOL}</span>
          </div>
          <button onClick={onBack} style={{
            background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.3)",
            color: "#a855f7", padding: "0.4rem 1rem", borderRadius: "8px",
            cursor: "pointer", fontSize: "0.8rem", fontWeight: 700,
            fontFamily: "'DM Sans',sans-serif"
          }}>← Back</button>
        </div>

        <div style={{ maxWidth: 800, margin: "0 auto", padding: "3rem 1.5rem" }}>

          {/* ── PRIVACY POLICY ── */}
          {page === "privacy" && (
            <div style={{ animation: "slideUp 0.5s ease" }}>
              <div style={{ marginBottom: "2.5rem" }}>
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: "0.4rem",
                  background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.25)",
                  borderRadius: "20px", padding: "0.3rem 1rem", marginBottom: "1rem"
                }}>
                  <span style={{ fontSize: "0.65rem", color: "#a855f7", fontWeight: 700, letterSpacing: "0.1em" }}>🔒 PRIVACY POLICY</span>
                </div>
                <h1 style={{
                  fontFamily: "'Outfit',sans-serif", fontSize: "2rem", fontWeight: 900,
                  margin: "0 0 0.5rem",
                  background: "linear-gradient(135deg,#fff,#c084fc)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
                }}>Privacy Policy</h1>
                <p style={{ color: "#6b7280", fontSize: "0.85rem" }}>
                  Last updated: {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>

              <Section title="1. Introduction">
                <P>Welcome to {TOOL} ("we", "our", or "us"), operated by {COMPANY}. This Privacy Policy explains how we collect, use, and protect your personal information when you use our platform at {WEBSITE}.</P>
                <P>By using our service, you agree to the collection and use of information in accordance with this policy.</P>
              </Section>

              <Section title="2. Information We Collect">
                <P>We collect the following types of information:</P>
                <ul>
                  <Li><strong style={{ color: "#fff" }}>Account Information:</strong> Name, email address, and phone number when you register.</Li>
                  <Li><strong style={{ color: "#fff" }}>Usage Data:</strong> Content generated, niche selected, platform used, keywords entered.</Li>
                  <Li><strong style={{ color: "#fff" }}>Payment Information:</strong> UPI transaction references and PayPal transaction IDs (we do not store card details).</Li>
                  <Li><strong style={{ color: "#fff" }}>Device Information:</strong> Browser type, IP address, and device type for security purposes.</Li>
                </ul>
              </Section>

              <Section title="3. How We Use Your Information">
                <ul>
                  <Li>To provide and improve our AI-powered content generation services.</Li>
                  <Li>To manage your account and subscription plan.</Li>
                  <Li>To process payments and activate your plan.</Li>
                  <Li>To send important updates about your account or our service.</Li>
                  <Li>To analyze usage patterns and improve platform performance.</Li>
                </ul>
              </Section>

              <Section title="4. Data Storage & Security">
                <P>Your data is securely stored using Supabase (PostgreSQL), a trusted cloud database provider. We implement industry-standard security measures including:</P>
                <ul>
                  <Li>Encrypted data transmission (HTTPS/SSL)</Li>
                  <Li>Row Level Security (RLS) — you can only access your own data</Li>
                  <Li>Secure authentication via Supabase Auth</Li>
                </ul>
              </Section>

              <Section title="5. Data Sharing">
                <P>We do not sell, trade, or rent your personal information to third parties. We may share data only with:</P>
                <ul>
                  <Li><strong style={{ color: "#fff" }}>Supabase:</strong> For database and authentication services.</Li>
                  <Li><strong style={{ color: "#fff" }}>Groq AI:</strong> Your prompts are processed to generate content (no personal data is shared).</Li>
                  <Li><strong style={{ color: "#fff" }}>Legal Authorities:</strong> If required by law.</Li>
                </ul>
              </Section>

              <Section title="6. Cookies">
                <P>We use essential cookies to maintain your login session and preferences. We do not use tracking or advertising cookies.</P>
              </Section>

              <Section title="7. Your Rights">
                <P>You have the right to:</P>
                <ul>
                  <Li>Access your personal data</Li>
                  <Li>Request correction of inaccurate data</Li>
                  <Li>Request deletion of your account and data</Li>
                  <Li>Withdraw consent at any time</Li>
                </ul>
                <P>To exercise these rights, contact us at <strong style={{ color: "#a855f7" }}>{EMAIL}</strong></P>
              </Section>

              <Section title="8. Children's Privacy">
                <P>Our service is not directed to children under 13 years of age. We do not knowingly collect personal information from children.</P>
              </Section>

              <Section title="9. Changes to This Policy">
                <P>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page with an updated date.</P>
              </Section>

              <Section title="10. Contact Us">
                <P>For any privacy-related concerns, please contact us:</P>
                <ul>
                  <Li>📧 Email: <strong style={{ color: "#a855f7" }}>{EMAIL}</strong></Li>
                  <Li>💬 WhatsApp: <strong style={{ color: "#a855f7" }}>{WHATSAPP}</strong></Li>
                  <Li>🌐 Website: <strong style={{ color: "#a855f7" }}>{WEBSITE}</strong></Li>
                </ul>
              </Section>
            </div>
          )}

          {/* ── TERMS & CONDITIONS ── */}
          {page === "terms" && (
            <div style={{ animation: "slideUp 0.5s ease" }}>
              <div style={{ marginBottom: "2.5rem" }}>
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: "0.4rem",
                  background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.25)",
                  borderRadius: "20px", padding: "0.3rem 1rem", marginBottom: "1rem"
                }}>
                  <span style={{ fontSize: "0.65rem", color: "#a855f7", fontWeight: 700, letterSpacing: "0.1em" }}>📋 TERMS & CONDITIONS</span>
                </div>
                <h1 style={{
                  fontFamily: "'Outfit',sans-serif", fontSize: "2rem", fontWeight: 900,
                  margin: "0 0 0.5rem",
                  background: "linear-gradient(135deg,#fff,#c084fc)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
                }}>Terms & Conditions</h1>
                <p style={{ color: "#6b7280", fontSize: "0.85rem" }}>
                  Last updated: {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>

              <Section title="1. Acceptance of Terms">
                <P>By accessing and using {TOOL} at {WEBSITE}, you accept and agree to be bound by these Terms and Conditions. If you do not agree, please do not use our service.</P>
              </Section>

              <Section title="2. Description of Service">
                <P>{TOOL} is an AI-powered viral content generation platform that helps creators, marketers, and businesses generate hooks, titles, captions, scripts, and content strategies for various social media platforms.</P>
              </Section>

              <Section title="3. User Accounts">
                <ul>
                  <Li>You must provide accurate information when creating an account.</Li>
                  <Li>You are responsible for maintaining the security of your account credentials.</Li>
                  <Li>One account per user. Multiple accounts are not permitted.</Li>
                  <Li>We reserve the right to suspend accounts that violate these terms.</Li>
                </ul>
              </Section>

              <Section title="4. Subscription Plans & Payments">
                <P>We offer the following plans:</P>
                <ul>
                  <Li><strong style={{ color: "#fff" }}>Free Plan:</strong> 3 generations, limited niches, platforms, and languages.</Li>
                  <Li><strong style={{ color: "#fff" }}>Starter Plan (₹499/month):</strong> 50 generations, all features unlocked.</Li>
                  <Li><strong style={{ color: "#fff" }}>Pro Plan (₹1299/month):</strong> 150 generations, priority support.</Li>
                  <Li><strong style={{ color: "#fff" }}>Agency Plan (₹4999/month):</strong> Unlimited generations, all features.</Li>
                </ul>
                <P>Payments are processed via UPI (India) or PayPal (International). Plans are activated manually within 30-60 minutes of payment confirmation.</P>
              </Section>

              <Section title="5. Acceptable Use Policy">
                <P>You agree NOT to use our service to:</P>
                <ul>
                  <Li>Generate spam, misleading, or harmful content.</Li>
                  <Li>Violate any applicable laws or regulations.</Li>
                  <Li>Infringe on intellectual property rights of others.</Li>
                  <Li>Attempt to reverse engineer or copy our platform.</Li>
                  <Li>Use automated bots or scripts to abuse the service.</Li>
                </ul>
              </Section>

              <Section title="6. Intellectual Property">
                <P>The content generated by our AI tool is provided for your personal and commercial use. {COMPANY} retains ownership of the platform, its design, and underlying technology.</P>
                <P>You own the content you generate using our platform.</P>
              </Section>

              <Section title="7. Disclaimer of Warranties">
                <P>Our service is provided "as is" without warranties of any kind. We do not guarantee that AI-generated content will be accurate, error-free, or suitable for any specific purpose. Results may vary based on input provided.</P>
              </Section>

              <Section title="8. Limitation of Liability">
                <P>{COMPANY} shall not be liable for any indirect, incidental, or consequential damages arising from your use of the service. Our total liability shall not exceed the amount paid by you in the last 30 days.</P>
              </Section>

              <Section title="9. Modifications to Service">
                <P>We reserve the right to modify, suspend, or discontinue any part of the service at any time. We will provide reasonable notice for significant changes.</P>
              </Section>

              <Section title="10. Governing Law">
                <P>These Terms shall be governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in India.</P>
              </Section>

              <Section title="11. Contact">
                <P>For any questions about these Terms, contact us at:</P>
                <ul>
                  <Li>📧 Email: <strong style={{ color: "#a855f7" }}>{EMAIL}</strong></Li>
                  <Li>💬 WhatsApp: <strong style={{ color: "#a855f7" }}>{WHATSAPP}</strong></Li>
                </ul>
              </Section>
            </div>
          )}

          {/* ── REFUND POLICY ── */}
          {page === "refund" && (
            <div style={{ animation: "slideUp 0.5s ease" }}>
              <div style={{ marginBottom: "2.5rem" }}>
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: "0.4rem",
                  background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.25)",
                  borderRadius: "20px", padding: "0.3rem 1rem", marginBottom: "1rem"
                }}>
                  <span style={{ fontSize: "0.65rem", color: "#a855f7", fontWeight: 700, letterSpacing: "0.1em" }}>💰 REFUND POLICY</span>
                </div>
                <h1 style={{
                  fontFamily: "'Outfit',sans-serif", fontSize: "2rem", fontWeight: 900,
                  margin: "0 0 0.5rem",
                  background: "linear-gradient(135deg,#fff,#c084fc)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
                }}>Refund Policy</h1>
                <p style={{ color: "#6b7280", fontSize: "0.85rem" }}>
                  Last updated: {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>

              <Section title="1. Our Refund Commitment">
                <P>At {TOOL}, we are committed to your satisfaction. We offer a <strong style={{ color: "#22c55e" }}>24-hour money-back guarantee</strong> on all paid plans. If you are not satisfied with our service within 24 hours of purchase, we will provide a full refund — no questions asked.</P>
              </Section>

              <Section title="2. Eligibility for Refund">
                <P>You are eligible for a refund if:</P>
                <ul>
                  <Li>You request a refund within <strong style={{ color: "#fff" }}>24 hours</strong> of payment.</Li>
                  <Li>Your plan has been activated and you are unsatisfied with the service.</Li>
                  <Li>Technical issues prevented you from using the service.</Li>
                </ul>
                <P>Refunds will NOT be provided if:</P>
                <ul>
                  <Li>The refund request is made after 24 hours of payment.</Li>
                  <Li>The account has been suspended for violating our Terms & Conditions.</Li>
                  <Li>The plan has been used extensively (more than 50% of generation quota).</Li>
                </ul>
              </Section>

              <Section title="3. How to Request a Refund">
                <P>To request a refund, please contact us within 24 hours of payment:</P>
                <ul>
                  <Li>💬 <strong style={{ color: "#fff" }}>WhatsApp:</strong> {WHATSAPP} — Send your payment screenshot and reason.</Li>
                  <Li>📧 <strong style={{ color: "#fff" }}>Email:</strong> {EMAIL} — Include your registered email and transaction ID.</Li>
                </ul>
                <P>We will process your refund request within <strong style={{ color: "#fff" }}>24-48 hours</strong> of receiving it.</P>
              </Section>

              <Section title="4. Refund Processing Time">
                <ul>
                  <Li><strong style={{ color: "#fff" }}>UPI Payments:</strong> Refunded within 3-5 business days to your original UPI account.</Li>
                  <Li><strong style={{ color: "#fff" }}>PayPal Payments:</strong> Refunded within 5-7 business days to your PayPal account.</Li>
                </ul>
              </Section>

              <Section title="5. Plan Downgrade">
                <P>If you wish to downgrade your plan instead of a refund, we can prorate the difference and apply it as credit for future billing cycles.</P>
              </Section>

              <Section title="6. Cancellation Policy">
                <P>You can cancel your subscription at any time. Your plan will remain active until the end of the current billing period. No partial refunds are provided for unused days after the 24-hour window.</P>
              </Section>

              <Section title="7. Digital Services Act Compliance">
                <P>As per the Information Technology Act, 2000 and Consumer Protection (E-Commerce) Rules, 2020 of India, we are committed to transparent refund practices for digital services.</P>
              </Section>

              <Section title="8. Contact for Refunds">
                <div style={{
                  background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)",
                  borderRadius: "12px", padding: "1rem 1.25rem", marginTop: "0.5rem"
                }}>
                  <p style={{ margin: "0 0 0.5rem", color: "#22c55e", fontWeight: 700, fontSize: "0.9rem" }}>🎯 Quick Refund Contact</p>
                  <ul style={{ margin: 0 }}>
                    <Li>📧 Email: <strong style={{ color: "#a855f7" }}>{EMAIL}</strong></Li>
                    <Li>💬 WhatsApp: <strong style={{ color: "#a855f7" }}>{WHATSAPP}</strong></Li>
                    <Li>⏰ Response Time: Within 2 hours (10 AM – 7 PM IST)</Li>
                  </ul>
                </div>
              </Section>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          textAlign: "center", padding: "1.5rem",
          borderTop: "1px solid rgba(139,92,246,0.1)"
        }}>
          <p style={{ color: "#2a2a2a", fontSize: "0.72rem", margin: 0 }}>
            © {new Date().getFullYear()} {COMPANY} — {TOOL}. All Rights Reserved.
          </p>
        </div>
      </div>
    </>
  );
}
