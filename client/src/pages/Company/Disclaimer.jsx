export default function Disclaimer() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 text-text-secondary">
      <h1 className="mb-6 text-3xl font-bold text-text-primary">Disclaimer</h1>
      <div className="space-y-4 leading-relaxed">
        <p>
          UPSC Mentor is an independent, privately built preparation platform.
          It is not affiliated with, endorsed by, or officially connected to
          the Union Public Service Commission (UPSC) or any Government of
          India body.
        </p>
        <p>
          Syllabus data, previous year questions, and exam-calendar information
          are compiled from publicly available official sources for study
          convenience. For binding, up-to-date information, always refer to
          the{" "}
          <a href="https://www.upsc.gov.in" target="_blank" rel="noreferrer" className="text-accent-gold hover:underline">
            official UPSC website
          </a>.
        </p>
        <p>
          AI-generated evaluations, scores, and diagnostic reports are study
          aids meant to guide preparation - they do not reflect or predict
          official UPSC evaluation standards or outcomes.
        </p>
        <p>
          Links to third-party government, news, or learning resources are
          provided for convenience. UPSC Mentor does not control and is not
          responsible for the content of external websites.
        </p>
      </div>
    </div>
  );
}
