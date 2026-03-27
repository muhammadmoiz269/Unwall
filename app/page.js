"use client";

import { useState, useEffect, useCallback } from "react";
import { getFingerprint } from "@/lib/fingerprint";
import Link from "next/link";

export default function Dashboard() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, unread, reading, completed
  const [toast, setToast] = useState(null);

  const fetchArticles = useCallback(async () => {
    try {
      const fp = getFingerprint();
      const res = await fetch(`/api/articles?fingerprint=${fp}`);
      const data = await res.json();
      setArticles(data.articles || []);
    } catch (err) {
      console.error("Failed to fetch articles:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const showToast = (type, title, message) => {
    setToast({ type, title, message });
    setTimeout(() => setToast(null), 4000);
  };

  const toggleRead = async (article) => {
    try {
      await fetch("/api/articles", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: article._id,
          isRead: !article.isRead,
          readingProgress: !article.isRead ? 100 : article.readingProgress,
        }),
      });
      fetchArticles();
      showToast(
        "success",
        article.isRead ? "Marked as unread" : "Marked as read",
        article.title
      );
    } catch (err) {
      console.error(err);
    }
  };

  const deleteArticle = async (id) => {
    try {
      await fetch(`/api/articles?id=${id}`, { method: "DELETE" });
      fetchArticles();
      showToast("success", "Article removed", "The article has been deleted from your library.");
    } catch (err) {
      console.error(err);
    }
  };

  const filteredArticles = articles.filter((a) => {
    if (filter === "unread") return !a.isRead && a.readingProgress === 0;
    if (filter === "reading") return !a.isRead && a.readingProgress > 0;
    if (filter === "completed") return a.isRead;
    return true;
  });

  const stats = {
    total: articles.length,
    read: articles.filter((a) => a.isRead).length,
    inProgress: articles.filter((a) => !a.isRead && a.readingProgress > 0).length,
  };

  const getReadStatus = (article) => {
    if (article.isRead) return { label: "Completed", className: "completed" };
    if (article.readingProgress > 0)
      return { label: `${article.readingProgress}%`, className: "in-progress" };
    return { label: "Unread", className: "unread" };
  };

  return (
    <>
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-brand">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
          <span className="brand-text">Unwall</span>
        </div>
        <div className="navbar-links">
          <span className="nav-link active">Dashboard</span>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <h1>Your Reading Dashboard</h1>
        <p>Save articles from Medium, read them distraction-free, and get AI-powered summaries.</p>

        <div className="stats-row">
          <div className="stat-card">
            <span className="stat-number">{stats.total}</span>
            <span className="stat-label">Saved</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{stats.inProgress}</span>
            <span className="stat-label">Reading</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{stats.read}</span>
            <span className="stat-label">Completed</span>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="main-content">
        <div className="section-header">
          <h2>Your Articles</h2>
          <div className="filter-tabs">
            {[
              { key: "all", label: "All" },
              { key: "unread", label: "Unread" },
              { key: "reading", label: "Reading" },
              { key: "completed", label: "Done" },
            ].map((f) => (
              <button
                key={f.key}
                className={`filter-tab ${filter === f.key ? "active" : ""}`}
                onClick={() => setFilter(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="loader">
            <div className="spinner" />
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
              </svg>
            </div>
            <h3>
              {filter === "all"
                ? "No saved articles yet"
                : `No ${filter} articles`}
            </h3>
            <p>
              {filter === "all"
                ? "Install the Unwall browser extension and start saving articles from Medium."
                : "Keep reading to see articles here!"}
            </p>
            {filter === "all" && (
              <button className="install-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Get the Extension
              </button>
            )}
          </div>
        ) : (
          <div className="articles-grid">
            {filteredArticles.map((article) => {
              const status = getReadStatus(article);
              return (
                <div key={article._id} className="article-card">
                  <div className="article-card-header">
                    <h3>{article.title}</h3>
                    <div className="article-card-actions">
                      <button
                        className="icon-btn"
                        title={article.isRead ? "Mark as unread" : "Mark as read"}
                        onClick={() => toggleRead(article)}
                      >
                        {article.isRead ? (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                          </svg>
                        )}
                      </button>
                      <button
                        className="icon-btn danger"
                        title="Delete"
                        onClick={() => deleteArticle(article._id)}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="article-card-meta">
                    <span>{article.author}</span>
                    <span className="dot" />
                    <span>{article.date || new Date(article.savedAt).toLocaleDateString()}</span>
                  </div>

                  <div className="progress-bar-container">
                    <div
                      className="progress-bar-fill"
                      style={{ width: `${article.readingProgress || 0}%` }}
                    />
                  </div>

                  <div className="article-card-footer">
                    <span className={`read-status ${status.className}`}>
                      {status.label}
                    </span>
                    <Link href={`/read/${article._id}`}>
                      <button className="continue-btn">
                        {article.readingProgress > 0 ? "Continue" : "Read"}
                      </button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="footer">
        <span className="footer-text">
          © {new Date().getFullYear()} Unwall. Read Medium articles without walls.
        </span>
      </footer>

      {/* Toast Notifications */}
      {toast && (
        <div className="toast-container">
          <div className={`toast ${toast.type}`}>
            <div className="toast-icon">
              {toast.type === "success" ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
