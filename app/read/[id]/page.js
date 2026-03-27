"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { getFingerprint } from "@/lib/fingerprint";

export default function ReadArticle() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;

  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const contentRef = useRef(null);
  const saveTimeoutRef = useRef(null);

  // Fetch article
  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const fp = getFingerprint();
        const res = await fetch(`/api/articles?fingerprint=${fp}`);
        const data = await res.json();
        const found = data.articles?.find((a) => a._id === id);
        if (found) {
          setArticle(found);
          setProgress(found.readingProgress || 0);
        }
      } catch (err) {
        console.error("Failed to fetch article:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
  }, [id]);

  // Restore scroll position
  useEffect(() => {
    if (article && article.readingProgress > 0) {
      setTimeout(() => {
        const scrollHeight =
          document.documentElement.scrollHeight - window.innerHeight;
        const scrollTo = (article.readingProgress / 100) * scrollHeight;
        window.scrollTo({ top: scrollTo, behavior: "smooth" });
      }, 500);
    }
  }, [article]);

  // Track scroll progress
  const saveProgress = useCallback(
    (pct) => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(async () => {
        try {
          await fetch("/api/articles", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: id,
              readingProgress: Math.round(pct),
              isRead: pct >= 95,
            }),
          });
        } catch (err) {
          console.error("Failed to save progress:", err);
        }
      }, 1500);
    },
    [id],
  );

  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight <= 0) return;
      const pct = Math.min(100, (window.scrollY / scrollHeight) * 100);
      setProgress(pct);
      saveProgress(pct);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [saveProgress]);

  // AI Summary
  const generateSummary = async () => {
    if (summaryLoading || !article) return;
    setSummaryLoading(true);

    try {
      const fp = getFingerprint();
      // Strip HTML for clean text
      const textContent = article.content.replace(/<[^>]+>/g, "").trim();

      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: textContent,
          userFingerprint: fp,
        }),
      });

      const data = await res.json();

      if (data.limited) {
        showToast("warning", "Daily limit reached", data.message);
      } else if (data.error) {
        showToast("warning", "Summary failed", data.error);
      } else {
        setSummary(data.summary);
        if (data.remaining !== undefined) {
          showToast(
            "success",
            "Summary generated!",
            `${data.remaining} free ${data.remaining === 1 ? "summary" : "summaries"} remaining today.`,
          );
        }
      }
    } catch (err) {
      showToast(
        "warning",
        "Error",
        "Failed to generate summary. Please try again.",
      );
    } finally {
      setSummaryLoading(false);
    }
  };

  const showToast = (type, title, message) => {
    setToast({ type, title, message });
    setTimeout(() => setToast(null), 6000);
  };

  if (loading) {
    return (
      <div className="loader" style={{ minHeight: "100vh" }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!article) {
    return (
      <div
        className="empty-state"
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <div className="empty-state-icon">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h3>Article not found</h3>
        <p>This article may have been deleted or the link is invalid.</p>
        <button className="continue-btn" onClick={() => router.push("/")}>
          ← Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Reading progress bar */}
      <div className="reading-progress-bar" style={{ width: `${progress}%` }} />

      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-brand">
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
          <span
            className="brand-text"
            style={{ cursor: "pointer" }}
            onClick={() => router.push("/")}
          >
            Unwall
          </span>
        </div>
        <div className="navbar-links">
          <button className="nav-link" onClick={() => router.push("/")}>
            ← Dashboard
          </button>
        </div>
      </nav>

      {/* Reader Content */}
      <article className="reader-container" ref={contentRef}>
        <button className="reader-back" onClick={() => router.push("/")}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back to Dashboard
        </button>

        <h1 className="reader-title">{article.title}</h1>

        {article.subtitle && (
          <p className="reader-subtitle">{article.subtitle}</p>
        )}

        <div className="reader-meta">
          <div>
            <div className="author-name">
              {article.author || "Unknown author"}
            </div>
            <div className="article-date">
              {article.date ||
                new Date(article.savedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
            </div>
          </div>
        </div>

        <div className="reader-divider" />

        {/* AI Summary Button */}
        {!summary && (
          <button
            className="summary-trigger"
            onClick={generateSummary}
            disabled={summaryLoading}
          >
            {summaryLoading ? (
              <>
                <span className="dot-pulse">
                  <span />
                  <span />
                  <span />
                </span>
                Generating summary...
              </>
            ) : (
              <>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
                Generate AI Summary
              </>
            )}
          </button>
        )}

        {/* Summary Panel */}
        {summary && (
          <div className="summary-panel">
            <div className="summary-panel-header">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
              AI Summary
            </div>

            <ul className="summary-bullets">
              {summary.bullets?.map((bullet, i) => (
                <li key={i}>{bullet}</li>
              ))}
            </ul>

            {summary.keyTakeaways?.length > 0 && (
              <>
                <div className="summary-takeaways-label">Key Takeaways</div>
                <ul className="summary-takeaways">
                  {summary.keyTakeaways.map((takeaway, i) => (
                    <li key={i}>{takeaway}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}

        {/* Article Body */}
        <div
          className="reader-content"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
      </article>

      {/* Toast */}
      {toast && (
        <div className="toast-container">
          <div className={`toast ${toast.type}`}>
            <div className="toast-icon">
              {toast.type === "success" ? (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              )}
            </div>
            <div className="toast-body">
              <strong>{toast.title}</strong>
              <p>{toast.message}</p>

            </div>
            <button className="toast-close" onClick={() => setToast(null)}>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
