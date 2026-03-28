import Link from "next/link";

export const metadata = {
  title: "Privacy Policy – Unwall",
  description:
    "Privacy Policy for the Unwall Chrome Extension and web dashboard. Learn how we handle your data.",
};

export default function PrivacyPolicy() {
  return (
    <>
      {/* Navbar */}
      <nav className="navbar">
        <Link href="/" className="navbar-brand">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
          <span className="brand-text">Unwall</span>
        </Link>
        <div className="navbar-links">
          <Link href="/" className="nav-link">
            Dashboard
          </Link>
        </div>
      </nav>

      {/* Privacy Policy Content */}
      <main className="privacy-container">
        <div className="privacy-header">
          <div className="privacy-badge">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span>Legal</span>
          </div>
          <h1>Privacy Policy</h1>
          <p className="privacy-updated">
            Last updated: March 28, 2026
          </p>
        </div>

        <div className="privacy-content">
          <section className="privacy-section">
            <h2>1. Introduction</h2>
            <p>
              Welcome to <strong>Unwall</strong>. This Privacy Policy explains how
              the Unwall Chrome Extension and its associated web dashboard
              (&quot;Service&quot;) collect, use, and protect your information. We are
              committed to safeguarding your privacy and ensuring transparency
              about our data practices.
            </p>
            <p>
              By installing the Unwall extension or using the Unwall dashboard,
              you agree to the terms outlined in this Privacy Policy.
            </p>
          </section>

          <section className="privacy-section">
            <h2>2. Information We Collect</h2>

            <div className="privacy-card">
              <h3>
                <span className="privacy-card-icon">🔑</span>
                Browser Fingerprint
              </h3>
              <p>
                We generate a unique browser fingerprint to associate your saved
                articles with your browser session. This fingerprint is derived
                locally and does not contain any personally identifiable
                information (PII). It is used solely to identify your device for
                syncing articles between the extension and the dashboard.
              </p>
            </div>

            <div className="privacy-card">
              <h3>
                <span className="privacy-card-icon">📄</span>
                Article Data
              </h3>
              <p>
                When you save an article through the Unwall extension, we store
                the following data:
              </p>
              <ul>
                <li>Article title</li>
                <li>Author name</li>
                <li>Publication date</li>
                <li>Article content (for distraction-free reading)</li>
                <li>Article URL</li>
                <li>Reading progress and completion status</li>
                <li>Timestamp of when the article was saved</li>
              </ul>
            </div>

            <div className="privacy-card">
              <h3>
                <span className="privacy-card-icon">📊</span>
                Usage Data
              </h3>
              <p>
                We may collect basic, anonymous usage data such as the number of
                articles saved and summaries generated. This data is used purely
                to monitor service health and enforce usage limits. No personally
                identifiable information is included.
              </p>
            </div>
          </section>

          <section className="privacy-section">
            <h2>3. Information We Do NOT Collect</h2>
            <p>
              We want to be clear about what we <strong>do not</strong> collect:
            </p>
            <ul className="privacy-list-no">
              <li>Your name, email address, or any personal contact information</li>
              <li>Your browsing history or web activity outside of Medium articles you explicitly save</li>
              <li>Cookies for tracking or advertising purposes</li>
              <li>Financial or payment information</li>
              <li>Location data</li>
              <li>Any data from other browser tabs or websites</li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2>4. How We Use Your Information</h2>
            <p>The information we collect is used exclusively to:</p>
            <ul className="privacy-list-yes">
              <li>Save and display your articles on the Unwall reading dashboard</li>
              <li>Track your reading progress across sessions</li>
              <li>Generate AI-powered article summaries when you request them</li>
              <li>Sync your reading state between the Chrome extension and the web dashboard</li>
              <li>Enforce fair usage limits on the summarization feature</li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2>5. Data Storage &amp; Security</h2>
            <p>
              Your article data is stored securely in a <strong>MongoDB</strong> database.
              We implement industry-standard security measures to protect your
              data against unauthorized access, alteration, or destruction. All
              communication between the extension, dashboard, and our servers
              occurs over <strong>HTTPS</strong> encrypted connections.
            </p>
          </section>

          <section className="privacy-section">
            <h2>6. Third-Party Services</h2>
            <p>
              Unwall may use third-party AI services to generate article
              summaries. When you request a summary, the article content is sent
              to the AI provider solely for the purpose of generating the
              summary. We do not share any personal data or browser fingerprints
              with third-party services.
            </p>
            <p>
              We do not use any third-party analytics, advertising, or tracking
              services.
            </p>
          </section>

          <section className="privacy-section">
            <h2>7. Data Retention &amp; Deletion</h2>
            <p>
              Your saved articles and associated data are retained for as long as
              you use the Service. You can delete individual articles at any time
              through the dashboard, which permanently removes them from our
              database.
            </p>
            <p>
              If you wish to delete all your data entirely, please contact us at
              the email address below, and we will remove all data associated
              with your browser fingerprint.
            </p>
          </section>

          <section className="privacy-section">
            <h2>8. Chrome Extension Permissions</h2>
            <p>
              The Unwall Chrome Extension requests the following browser
              permissions:
            </p>
            <div className="permissions-grid">
              <div className="permission-item">
                <div className="permission-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
                  </svg>
                </div>
                <div>
                  <strong>Active Tab</strong>
                  <p>To read the content of Medium articles you choose to save.</p>
                </div>
              </div>
              <div className="permission-item">
                <div className="permission-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </div>
                <div>
                  <strong>Storage</strong>
                  <p>To store your browser fingerprint locally for session identification.</p>
                </div>
              </div>
              <div className="permission-item">
                <div className="permission-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
                <div>
                  <strong>Host Permissions</strong>
                  <p>To communicate with the Unwall API for saving and syncing articles.</p>
                </div>
              </div>
            </div>
            <p>
              These permissions are used strictly for the described purposes and
              nothing else. We do not access any data beyond what is necessary
              for the extension to function.
            </p>
          </section>

          <section className="privacy-section">
            <h2>9. Children&apos;s Privacy</h2>
            <p>
              Unwall is not directed at children under the age of 13. We do not
              knowingly collect data from children. If you believe a child has
              provided us with data, please contact us and we will promptly
              remove it.
            </p>
          </section>

          <section className="privacy-section">
            <h2>10. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Any changes
              will be posted on this page with an updated &quot;Last updated&quot; date.
              We encourage you to review this page periodically.
            </p>
          </section>

          <section className="privacy-section">
            <h2>11. Contact Us</h2>
            <p>
              If you have any questions, concerns, or requests regarding this
              Privacy Policy or your data, please contact us at:
            </p>
            <div className="contact-card">
              <p>
                <strong>Email:</strong>{" "}
                <a href="mailto:muhammadmoiz269@gmail.com">
                  muhammadmoiz269@gmail.com
                </a>
              </p>
              <p>
                <strong>GitHub:</strong>{" "}
                <a
                  href="https://github.com/muhammadmoiz269/Unwall"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  github.com/muhammadmoiz269/Unwall
                </a>
              </p>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        <span className="footer-text">
          © {new Date().getFullYear()} Unwall. Read Medium articles without
          walls.
        </span>
        <div className="footer-links">
          <Link href="/privacy-policy" className="footer-link">
            Privacy Policy
          </Link>
        </div>
      </footer>
    </>
  );
}
