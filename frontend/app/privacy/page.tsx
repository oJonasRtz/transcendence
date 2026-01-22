export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: January 2025</p>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
          <p className="leading-relaxed">
            Welcome to 42 PONG. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our gaming platform. Please read this policy carefully to understand our practices regarding your personal data.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">2. Information We Collect</h2>
          <p className="leading-relaxed mb-3">We collect the following types of information:</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li><strong>Account Information:</strong> Username, email address, password (encrypted), and profile avatar.</li>
            <li><strong>Game Data:</strong> Match history, scores, game statistics, rankings, and achievements.</li>
            <li><strong>Chat Communications:</strong> Messages sent through our chat system for moderation and support purposes.</li>
            <li><strong>Technical Data:</strong> IP address, browser type, device information, and access times for security and analytics.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">3. How We Use Your Information</h2>
          <p className="leading-relaxed mb-3">We use the information we collect to:</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Provide, operate, and maintain our gaming services.</li>
            <li>Create and manage your user account.</li>
            <li>Process matchmaking and display leaderboards.</li>
            <li>Enable communication features including chat and friend systems.</li>
            <li>Improve user experience and develop new features.</li>
            <li>Ensure security and prevent fraud or abuse.</li>
            <li>Comply with legal obligations.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">4. Data Sharing and Disclosure</h2>
          <p className="leading-relaxed mb-3">We do not sell your personal information. We may share your data only in the following circumstances:</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li><strong>Public Profile:</strong> Your username, avatar, and game statistics may be visible to other users.</li>
            <li><strong>Service Providers:</strong> Third-party services that help us operate the platform (hosting, analytics).</li>
            <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and safety.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">5. Data Security</h2>
          <p className="leading-relaxed">
            We implement appropriate technical and organizational measures to protect your personal data. This includes TLS encryption for data in transit, secure password hashing, JWT-based authentication, and regular security assessments. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">6. Data Retention</h2>
          <p className="leading-relaxed">
            We retain your personal data for as long as your account is active or as needed to provide you services. You may request deletion of your account and associated data at any time through your account settings or by contacting us.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">7. Your Rights</h2>
          <p className="leading-relaxed mb-3">Depending on your location, you may have the following rights:</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li><strong>Access:</strong> Request a copy of your personal data.</li>
            <li><strong>Correction:</strong> Request correction of inaccurate data.</li>
            <li><strong>Deletion:</strong> Request deletion of your personal data.</li>
            <li><strong>Portability:</strong> Request transfer of your data to another service.</li>
            <li><strong>Objection:</strong> Object to certain processing of your data.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">8. Cookies and Tracking</h2>
          <p className="leading-relaxed">
            We use essential cookies to maintain your session and authentication state. These cookies are necessary for the platform to function properly. We do not use third-party advertising cookies or cross-site tracking.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">9. Children&apos;s Privacy</h2>
          <p className="leading-relaxed">
            Our services are not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If we become aware that we have collected data from a child under 13, we will take steps to delete such information.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">10. Changes to This Policy</h2>
          <p className="leading-relaxed">
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the &quot;Last updated&quot; date. Your continued use of the platform after changes constitutes acceptance of the updated policy.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">11. Contact Us</h2>
          <p className="leading-relaxed">
            If you have any questions about this Privacy Policy or our data practices, please contact us through the platform&apos;s support channels.
          </p>
        </section>
      </div>
    </main>
  );
}
