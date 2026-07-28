export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 text-text-secondary">
      <h1 className="mb-6 text-3xl font-bold text-text-primary">About UPSC Mentor</h1>
      <div className="space-y-4 leading-relaxed">
        <p>
          UPSC Mentor (UPSCbyIITians.in) is an independent, AI-powered preparation
          workspace built for Civil Services aspirants. It brings together syllabus
          tracking, subject-wise study analytics, Mains answer evaluation, Prelims
          PYQ drilling, an MCQ test series with AI diagnostics, and a personal AI
          mentor - all in one dashboard.
        </p>
        <p>
          The platform was built solo by <span className="text-text-primary font-semibold">Anand Vivek</span>,
          a Mechanical Engineering student at IIT Indore, out of a genuine need he
          saw among aspirants for a single, well-structured place to prepare - one
          that combines official exam resources with modern AI tooling instead of
          scattering effort across a dozen apps and PDFs.
        </p>
        <p>
          UPSC Mentor is an independent project and is not affiliated with, endorsed
          by, or connected to the Union Public Service Commission (UPSC) or any
          government body. All official notifications, syllabi, and results should
          always be verified on the{" "}
          <a href="https://www.upsc.gov.in" target="_blank" rel="noreferrer" className="text-accent-gold hover:underline">
            official UPSC website
          </a>.
        </p>
        <p>
          Have feedback, found a bug, or want to suggest a feature? Reach out on the{" "}
          <a href="/contact" className="text-accent-gold hover:underline">Contact page</a>{" "}
          - as a solo-built platform, every message is read personally.
        </p>
      </div>
    </div>
  );
}
