import { useState, useRef, DragEvent, ChangeEvent } from "react";

type Status = "idle" | "loading" | "success" | "error";

export default function UploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    if (!f.name.endsWith(".csv") && !f.name.endsWith(".xlsx")) {
      setStatus("error");
      setMessage("Only .csv or .xlsx files are accepted.");
      return;
    }
    setFile(f);
    setStatus("idle");
    setMessage("");
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  const handleSubmit = async () => {
    if (!file || !email) return;
    setStatus("loading");
    setMessage("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("email", email);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const apiKey = process.env.NEXT_PUBLIC_API_KEY || "";

    try {
      const res = await fetch(`${apiUrl}/api/upload`, {
        method: "POST",
        headers: apiKey ? { "X-API-Key": apiKey } : {},
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("success");
        setMessage(data.message || "Summary sent successfully!");
      } else {
        setStatus("error");
        setMessage(data.detail || "Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Is the backend running?");
    }
  };

  const reset = () => {
    setFile(null);
    setEmail("");
    setStatus("idle");
    setMessage("");
    if (inputRef.current) inputRef.current.value = "";
  };

  const canSubmit = !!file && email.includes("@") && status !== "loading";

  return (
    <div className="page">
      {/* Header */}
      <header className="header">
        <div className="logo">
          <span className="logo-dot" />
          <span className="logo-text">Rabbitt AI</span>
        </div>
        <span className="badge">Internal Tool</span>
      </header>

      {/* Hero */}
      <section className="hero">
        <div className="hero-tag">Q1 2026 · Sales Intelligence</div>
        <h1 className="hero-title">
          Sales Insight<br />
          <em>Automator</em>
        </h1>
        <p className="hero-sub">
          Upload your quarterly CSV or Excel data. Our AI reads it, extracts the signal,
          and delivers a professional executive brief — straight to your inbox.
        </p>
      </section>

      {/* Card */}
      <div className="card">
        {status === "success" ? (
          <div className="success-state">
            <div className="success-icon">✓</div>
            <h2>Report Sent</h2>
            <p>{message}</p>
            <button className="btn-reset" onClick={reset}>Upload Another File</button>
          </div>
        ) : (
          <>
            {/* Drop Zone */}
            <div
              className={`dropzone ${dragging ? "dragging" : ""} ${file ? "has-file" : ""}`}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => inputRef.current?.click()}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".csv,.xlsx"
                onChange={onFileChange}
                style={{ display: "none" }}
              />
              {file ? (
                <div className="file-info">
                  <span className="file-icon">📄</span>
                  <span className="file-name">{file.name}</span>
                  <span className="file-size">{(file.size / 1024).toFixed(1)} KB</span>
                </div>
              ) : (
                <div className="drop-prompt">
                  <span className="drop-icon">⬆</span>
                  <span className="drop-label">Drop your file here</span>
                  <span className="drop-hint">.csv or .xlsx · max 5MB</span>
                </div>
              )}
            </div>

            {/* Email */}
            <div className="field">
              <label className="label">Recipient Email</label>
              <input
                type="email"
                className="input"
                placeholder="executive@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={status === "loading"}
              />
            </div>

            {/* Error */}
            {status === "error" && (
              <div className="error-bar">{message}</div>
            )}

            {/* Submit */}
            <button
              className={`btn-submit ${status === "loading" ? "loading" : ""}`}
              onClick={handleSubmit}
              disabled={!canSubmit}
            >
              {status === "loading" ? (
                <span className="spinner-row">
                  <span className="spinner" />
                  Generating Summary…
                </span>
              ) : (
                "Generate & Send Report →"
              )}
            </button>
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="footer">
        <a href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/docs`} target="_blank" rel="noreferrer">
          API Docs ↗
        </a>
        <span>·</span>
        <span>Powered by LLaMA 3 / Gemini</span>
      </footer>

      <style jsx>{`
        .page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 0 20px 60px;
          background: #0d0d0d;
          position: relative;
        }
        .page::before {
          content: '';
          position: fixed;
          top: -200px; left: 50%; transform: translateX(-50%);
          width: 700px; height: 700px;
          background: radial-gradient(ellipse, rgba(200,240,77,0.08) 0%, transparent 70%);
          pointer-events: none;
          z-index: 0;
        }

        /* Header */
        .header {
          width: 100%; max-width: 680px;
          display: flex; justify-content: space-between; align-items: center;
          padding: 28px 0 0;
          position: relative; z-index: 1;
        }
        .logo { display: flex; align-items: center; gap: 8px; }
        .logo-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: #c8f04d;
          box-shadow: 0 0 12px #c8f04d;
        }
        .logo-text { font-family: 'DM Mono', monospace; font-size: 13px; letter-spacing: 0.05em; color: #aaa; }
        .badge {
          font-family: 'DM Mono', monospace; font-size: 10px;
          border: 1px solid #333; color: #666;
          padding: 3px 8px; border-radius: 20px;
          letter-spacing: 0.08em; text-transform: uppercase;
        }

        /* Hero */
        .hero {
          text-align: center; max-width: 560px;
          margin: 72px 0 48px;
          position: relative; z-index: 1;
        }
        .hero-tag {
          font-family: 'DM Mono', monospace; font-size: 11px;
          color: #c8f04d; letter-spacing: 0.12em; text-transform: uppercase;
          margin-bottom: 20px;
        }
        .hero-title {
          font-family: 'DM Serif Display', serif;
          font-size: clamp(42px, 8vw, 68px);
          line-height: 1.05; letter-spacing: -1px;
          color: #f0ede6; margin-bottom: 20px;
        }
        .hero-title em { font-style: italic; color: #c8f04d; }
        .hero-sub {
          font-size: 16px; line-height: 1.7; color: #888;
          font-weight: 300;
        }

        /* Card */
        .card {
          width: 100%; max-width: 520px;
          background: #161616;
          border: 1px solid #242424;
          border-radius: 16px;
          padding: 36px;
          position: relative; z-index: 1;
          box-shadow: 0 24px 80px rgba(0,0,0,0.5);
        }

        /* Drop Zone */
        .dropzone {
          border: 1.5px dashed #2e2e2e;
          border-radius: 10px;
          padding: 36px 24px;
          text-align: center;
          cursor: pointer;
          transition: border-color 0.2s, background 0.2s;
          margin-bottom: 24px;
        }
        .dropzone:hover, .dropzone.dragging {
          border-color: #c8f04d;
          background: rgba(200,240,77,0.03);
        }
        .dropzone.has-file { border-style: solid; border-color: #3a3a3a; }
        .drop-prompt { display: flex; flex-direction: column; gap: 8px; align-items: center; }
        .drop-icon { font-size: 28px; opacity: 0.5; }
        .drop-label { font-size: 15px; color: #ccc; font-weight: 500; }
        .drop-hint { font-family: 'DM Mono', monospace; font-size: 11px; color: #555; }
        .file-info { display: flex; flex-direction: column; align-items: center; gap: 6px; }
        .file-icon { font-size: 32px; }
        .file-name { font-size: 14px; color: #e0e0e0; font-weight: 500; word-break: break-all; }
        .file-size { font-family: 'DM Mono', monospace; font-size: 11px; color: #666; }

        /* Field */
        .field { margin-bottom: 20px; }
        .label {
          display: block; font-size: 12px; font-weight: 500;
          color: #666; letter-spacing: 0.05em; text-transform: uppercase;
          margin-bottom: 8px; font-family: 'DM Mono', monospace;
        }
        .input {
          width: 100%; background: #0d0d0d;
          border: 1px solid #2a2a2a; border-radius: 8px;
          padding: 12px 16px; font-size: 15px; color: #f0ede6;
          font-family: 'DM Sans', sans-serif;
          outline: none; transition: border-color 0.2s;
        }
        .input:focus { border-color: #c8f04d; }
        .input::placeholder { color: #444; }
        .input:disabled { opacity: 0.5; }

        /* Error */
        .error-bar {
          background: rgba(255,80,80,0.08); border: 1px solid rgba(255,80,80,0.2);
          border-radius: 8px; padding: 12px 16px;
          font-size: 13px; color: #f87171; margin-bottom: 20px;
        }

        /* Submit */
        .btn-submit {
          width: 100%; padding: 14px 24px;
          background: #c8f04d; color: #0d0d0d;
          font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 600;
          border: none; border-radius: 8px; cursor: pointer;
          transition: opacity 0.2s, transform 0.1s;
          letter-spacing: -0.2px;
        }
        .btn-submit:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
        .btn-submit:active:not(:disabled) { transform: translateY(0); }
        .btn-submit:disabled { opacity: 0.3; cursor: not-allowed; }
        .btn-submit.loading { opacity: 0.7; }
        .spinner-row { display: flex; align-items: center; justify-content: center; gap: 10px; }
        .spinner {
          width: 14px; height: 14px;
          border: 2px solid rgba(0,0,0,0.2);
          border-top-color: #0d0d0d;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Success */
        .success-state { text-align: center; padding: 16px 0; }
        .success-icon {
          width: 56px; height: 56px; border-radius: 50%;
          background: rgba(200,240,77,0.12); border: 1.5px solid #c8f04d;
          color: #c8f04d; font-size: 22px;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 20px;
        }
        .success-state h2 { font-family: 'DM Serif Display', serif; font-size: 26px; margin-bottom: 8px; }
        .success-state p { color: #888; font-size: 14px; margin-bottom: 28px; }
        .btn-reset {
          background: transparent; border: 1px solid #333;
          color: #aaa; padding: 10px 20px; border-radius: 8px;
          font-family: 'DM Sans', sans-serif; font-size: 14px;
          cursor: pointer; transition: border-color 0.2s, color 0.2s;
        }
        .btn-reset:hover { border-color: #555; color: #f0ede6; }

        /* Footer */
        .footer {
          margin-top: 32px; display: flex; gap: 12px;
          font-family: 'DM Mono', monospace; font-size: 11px;
          color: #444; align-items: center;
          position: relative; z-index: 1;
        }
        .footer a { color: #666; text-decoration: none; }
        .footer a:hover { color: #c8f04d; }
      `}</style>
    </div>
  );
}
