function Section({ title, children }) {
  return (
    <section className="mb-8">
      <h2 className="mb-2 text-xl font-semibold text-text-primary">{title}</h2>
      <div className="space-y-3 leading-relaxed">{children}</div>
    </section>
  );
}

export default function PrivacyPolicy() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 text-text-secondary">
      <h1 className="mb-2 text-3xl font-bold text-text-primary">Privacy Policy</h1>
      <p className="mb-8 text-sm text-text-muted">Last updated: July 2026</p>

      <Section title="1. Information We Collect">
        <p>
          When you create an account, we collect your name, email address, and
          (if you sign in with Google) the basic profile details Google shares
          during OAuth. We also store the study data you generate on the
          platform - syllabus progress, timer sessions, notes, test attempts,
          Mains answers, and mentor chat history.
        </p>
      </Section>

      <Section title="2. How We Use Your Information">
        <p>
          Your data is used to power the dashboard, analytics, streaks, and AI
          features you interact with. Mentor chat history and notes are also
          used to extract long-term study patterns so the AI mentor can give
          more relevant guidance over time.
        </p>
      </Section>

      <Section title="3. Third-Party AI Providers">
        <p>
          AI features (answer evaluation, notes assistance, mentor chat, test
          diagnostics) are processed through third-party AI providers, in a
          fallback order for reliability. Submitted content (typed answers,
          notes, handwritten answer images, chat messages) is sent to whichever
          provider is active at the time solely to generate your response.
        </p>
      </Section>

      <Section title="4. Cookies & Sessions">
        <p>
          We use JWT-based session tokens to keep you signed in. We do not use
          third-party advertising cookies or trackers.
        </p>
      </Section>

      <Section title="5. Data Security">
        <p>
          Passwords are hashed and never stored in plain text. Data is stored
          in a PostgreSQL database over an SSL-enabled connection. While we
          take reasonable measures to protect your data, no online service can
          guarantee absolute security.
        </p>
      </Section>

      <Section title="6. Your Rights">
        <p>
          You can edit your profile details at any time, and can request
          deletion of your account and associated data by contacting us.
        </p>
      </Section>

      <Section title="7. Changes to This Policy">
        <p>
          This policy may be updated as the platform evolves. Continued use of
          UPSC Mentor after changes are posted constitutes acceptance of the
          revised policy.
        </p>
      </Section>

      <Section title="8. Contact">
        <p>
          Questions about this policy can be sent via the{" "}
          <a href="/contact" className="text-accent-gold hover:underline">Contact page</a>.
        </p>
      </Section>
    </div>
  );
}
