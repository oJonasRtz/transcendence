import Link from 'next/link';
import Starfield from '@/app/ui/starfield';
import AcmeLogo from '@/app/ui/pong-logo';
import { ButtonGlimmer } from '@/app/ui/button-glimmer';

export default function PrivacyPolicyPage() {
  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden font-sans selection:bg-indigo-500/30">
      <Starfield />

      <header className="relative z-20 w-full border-b border-white/10 bg-black/60 backdrop-blur-md px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center justify-center bg-black p-2 rounded-md border border-white/20">
              <div className="w-20 text-white md:w-24">
                <AcmeLogo />
              </div>
            </div>
            <div className="hidden h-8 w-[1px] bg-white/20 md:block" />
            <div className="hidden md:flex flex-col">
              <h1 className="text-lg font-bold leading-none text-white">Privacy Policy</h1>
              <p className="text-[10px] uppercase tracking-widest text-blue-400 mt-1 font-bold">
                Data Protection
              </p>
            </div>
          </div>

          <Link href="/signup">
            <ButtonGlimmer
              glow={false}
              className="bg-transparent border border-white/20 hover:bg-white/5 h-10 px-6 text-xs uppercase tracking-widest"
            >
              Back to Sign Up
            </ButtonGlimmer>
          </Link>
        </div>
      </header>

      <section className="relative z-10 flex flex-1 justify-center px-6 py-12 overflow-y-auto">
        <div className="w-full max-w-3xl">
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 p-8 shadow-2xl backdrop-blur-xl">
            <div className="absolute -top-24 -right-24 h-48 w-48 bg-blue-500/20 blur-3xl rounded-full" />
            <div className="absolute -bottom-24 -left-24 h-48 w-48 bg-indigo-500/20 blur-3xl rounded-full" />

            <div className="relative text-white">
              <p className="text-sm text-slate-400 mb-8">Last updated: January 2025</p>

              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
                <p className="leading-relaxed text-slate-300">
                  Welcome to 42 PONG. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our gaming platform. Please read this policy carefully to understand our practices regarding your personal data.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-3">2. Information We Collect</h2>
                <p className="leading-relaxed mb-3 text-slate-300">We collect the following types of information:</p>
                <ul className="list-disc list-inside space-y-2 ml-4 text-slate-300">
                  <li><strong className="text-white">Account Information:</strong> Username, email address, password (encrypted), and profile avatar.</li>
                  <li><strong className="text-white">Game Data:</strong> Match history, scores, game statistics, rankings, and achievements.</li>
                  <li><strong className="text-white">Chat Communications:</strong> Messages sent through our chat system for moderation and support purposes.</li>
                  <li><strong className="text-white">Technical Data:</strong> IP address, browser type, device information, and access times for security and analytics.</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-3">3. How We Use Your Information</h2>
                <p className="leading-relaxed mb-3 text-slate-300">We use the information we collect to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4 text-slate-300">
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
                <p className="leading-relaxed mb-3 text-slate-300">We do not sell your personal information. We may share your data only in the following circumstances:</p>
                <ul className="list-disc list-inside space-y-2 ml-4 text-slate-300">
                  <li><strong className="text-white">Public Profile:</strong> Your username, avatar, and game statistics may be visible to other users.</li>
                  <li><strong className="text-white">Service Providers:</strong> Third-party services that help us operate the platform (hosting, analytics).</li>
                  <li><strong className="text-white">Legal Requirements:</strong> When required by law or to protect our rights and safety.</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-3">5. Data Security</h2>
                <p className="leading-relaxed text-slate-300">
                  We implement appropriate technical and organizational measures to protect your personal data. This includes TLS encryption for data in transit, secure password hashing, JWT-based authentication, and regular security assessments. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-3">6. Data Retention</h2>
                <p className="leading-relaxed text-slate-300">
                  We retain your personal data for as long as your account is active or as needed to provide you services. You may request deletion of your account and associated data at any time through your account settings or by contacting us.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-3">7. Your Rights</h2>
                <p className="leading-relaxed mb-3 text-slate-300">Depending on your location, you may have the following rights:</p>
                <ul className="list-disc list-inside space-y-2 ml-4 text-slate-300">
                  <li><strong className="text-white">Access:</strong> Request a copy of your personal data.</li>
                  <li><strong className="text-white">Correction:</strong> Request correction of inaccurate data.</li>
                  <li><strong className="text-white">Deletion:</strong> Request deletion of your personal data.</li>
                  <li><strong className="text-white">Portability:</strong> Request transfer of your data to another service.</li>
                  <li><strong className="text-white">Objection:</strong> Object to certain processing of your data.</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-3">8. Cookies and Tracking</h2>
                <p className="leading-relaxed text-slate-300">
                  We use essential cookies to maintain your session and authentication state. These cookies are necessary for the platform to function properly. We do not use third-party advertising cookies or cross-site tracking.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-3">9. Children&apos;s Privacy</h2>
                <p className="leading-relaxed text-slate-300">
                  Our services are not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If we become aware that we have collected data from a child under 13, we will take steps to delete such information.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-3">10. Changes to This Policy</h2>
                <p className="leading-relaxed text-slate-300">
                  We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the &quot;Last updated&quot; date. Your continued use of the platform after changes constitutes acceptance of the updated policy.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-3">11. Contact Us</h2>
                <p className="leading-relaxed text-slate-300">
                  If you have any questions about this Privacy Policy or our data practices, please contact us through the platform&apos;s support channels.
                </p>
              </section>
            </div>
          </div>
        </div>
      </section>

      <footer className="relative z-20 w-full p-8 text-center text-[11px] font-medium uppercase tracking-tighter text-slate-500">
        <Link href="/terms" className="text-indigo-400 hover:underline">Terms of Service</Link> • <Link href="/signup" className="text-indigo-400 hover:underline">Sign Up</Link>
      </footer>
    </main>
  );
}
