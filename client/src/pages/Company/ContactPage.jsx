export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 text-text-secondary">
      <h1 className="mb-6 text-3xl font-bold text-text-primary">Contact Us</h1>
      <div className="space-y-4 leading-relaxed">
        <p>
          UPSC Mentor is built and maintained by a small, solo team, so we read
          every message personally.
        </p>
        <p>
          <span className="text-text-primary font-semibold">Email:</span>{" "}
          <a href="mailto:support@upscbyiitians.in" className="text-accent-gold hover:underline">
            support@upscbyiitians.in
          </a>
        </p>
        <p>
          For bugs, feature requests, or general feedback, you can also use the
          in-app feedback button available after signing in - it goes straight
          into our review queue.
        </p>
        <p className="text-sm text-text-muted">
          We aim to respond within 2-3 business days.
        </p>
      </div>
    </div>
  );
}
