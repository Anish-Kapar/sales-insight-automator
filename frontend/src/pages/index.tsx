import Head from "next/head";
import UploadForm from "../components/UploadForm";

export default function Home() {
  return (
    <>
      <Head>
        <title>Sales Insight Automator — Rabbitt AI</title>
        <meta name="description" content="Upload sales data and receive AI-generated executive summaries instantly." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@400;500&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap" rel="stylesheet" />
      </Head>
      <main>
        <UploadForm />
      </main>
      <style jsx global>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { font-size: 16px; }
        body {
          font-family: 'DM Sans', sans-serif;
          background: #0d0d0d;
          color: #f0ede6;
          min-height: 100vh;
          overflow-x: hidden;
        }
        ::selection { background: #c8f04d; color: #0d0d0d; }
      `}</style>
    </>
  );
}
