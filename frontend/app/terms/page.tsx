import Link from 'next/link';
import Starfield from '@/app/ui/starfield';
import AcmeLogo from '@/app/ui/pong-logo';
import { ButtonGlimmer } from '@/app/ui/button-glimmer';

export default function TermsOfServicePage() {
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
              <h1 className="text-lg font-bold leading-none text-white">Terms of Service</h1>
              <p className="text-[10px] uppercase tracking-widest text-blue-400 mt-1 font-bold">
                User Agreement
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
                <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
                <p className="leading-relaxed text-slate-300">
                  By accessing or using 42 PONG, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this platform. These terms apply to all users of the platform, including players, visitors, and contributors.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-3">2. Eligibility</h2>
                <p className="leading-relaxed text-slate-300">
                  You must be at least 13 years of age to use this platform. By using 42 PONG, you represent and warrant that you meet this age requirement and have the legal capacity to enter into these Terms of Service.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-3">3. User Accounts</h2>
                <p className="leading-relaxed mb-3 text-slate-300">When you create an account with us, you must:</p>
                <ul className="list-disc list-inside space-y-2 ml-4 text-slate-300">
                  <li>Provide accurate, current, and complete information during registration.</li>
                  <li>Maintain the security of your password and account credentials.</li>
                  <li>Promptly update any information to keep it accurate and complete.</li>
                  <li>Accept responsibility for all activities that occur under your account.</li>
                  <li>Notify us immediately of any unauthorized use of your account.</li>
                </ul>
                <p className="leading-relaxed mt-3 text-slate-300">
                  You may not use another user&apos;s account without permission. We reserve the right to suspend or terminate accounts that violate these terms.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-3">4. Acceptable Use Policy</h2>
                <p className="leading-relaxed mb-3 text-slate-300">When using 42 PONG, you agree to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4 text-slate-300">
                  <li>Play fairly and respect the spirit of competition.</li>
                  <li>Communicate respectfully with other users in chat and during games.</li>
                  <li>Report bugs and issues through appropriate channels.</li>
                </ul>
                <p className="leading-relaxed mt-3 mb-3 text-slate-300">You agree NOT to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4 text-slate-300">
                  <li>Use cheats, exploits, automation software, bots, hacks, or any unauthorized third-party tools.</li>
                  <li>Harass, abuse, threaten, or intimidate other users.</li>
                  <li>Use offensive, vulgar, or inappropriate usernames or avatars.</li>
                  <li>Impersonate other users or platform staff.</li>
                  <li>Share or distribute malicious content or links.</li>
                  <li>Attempt to gain unauthorized access to systems or other user accounts.</li>
                  <li>Interfere with or disrupt the platform or servers.</li>
                  <li>Engage in match-fixing or deliberately losing games.</li>
                  <li>Create multiple accounts to gain unfair advantages.</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-3">5. Intellectual Property</h2>
                <p className="leading-relaxed text-slate-300">
                  The platform, including its original content, features, and functionality, is owned by the 42 PONG team and is protected by international copyright, trademark, and other intellectual property laws. You may not reproduce, distribute, modify, create derivative works of, publicly display, or otherwise use any content from the platform without prior written permission.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-3">6. User-Generated Content</h2>
                <p className="leading-relaxed text-slate-300">
                  Any content you submit, post, or display on the platform (including chat messages and profile information) remains yours, but you grant us a non-exclusive, worldwide, royalty-free license to use, reproduce, and display such content in connection with operating the platform. You are responsible for ensuring you have the rights to any content you submit.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-3">7. Privacy</h2>
                <p className="leading-relaxed text-slate-300">
                  Your use of 42 PONG is also governed by our Privacy Policy. Please review our Privacy Policy to understand how we collect, use, and protect your personal information.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-3">8. Disclaimer of Warranties</h2>
                <p className="leading-relaxed text-slate-300">
                  THE PLATFORM IS PROVIDED ON AN &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; BASIS WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT THE PLATFORM WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE. YOUR USE OF THE PLATFORM IS AT YOUR OWN RISK.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-3">9. Limitation of Liability</h2>
                <p className="leading-relaxed text-slate-300">
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, THE 42 PONG TEAM SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES RESULTING FROM YOUR USE OF THE PLATFORM.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-3">10. Termination</h2>
                <p className="leading-relaxed text-slate-300">
                  We may terminate or suspend your account and access to the platform immediately, without prior notice or liability, for any reason, including if you breach these Terms of Service. Upon termination, your right to use the platform will immediately cease. You may also delete your account at any time through your account settings.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-3">11. Changes to Terms</h2>
                <p className="leading-relaxed text-slate-300">
                  We reserve the right to modify or replace these Terms of Service at any time at our sole discretion. We will provide notice of any material changes by updating the &quot;Last updated&quot; date at the top of this page. Your continued use of the platform following any changes constitutes acceptance of those changes.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-3">12. Governing Law</h2>
                <p className="leading-relaxed text-slate-300">
                  These Terms of Service shall be governed by and construed in accordance with applicable laws, without regard to conflict of law principles.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-3">13. Contact Us</h2>
                <p className="leading-relaxed text-slate-300">
                  If you have any questions about these Terms of Service, please contact us through the platform&apos;s support channels.
                </p>
              </section>
            </div>
          </div>
        </div>
      </section>

      <footer className="relative z-20 w-full p-8 text-center text-[11px] font-medium uppercase tracking-tighter text-slate-500">
        <Link href="/privacy" className="text-indigo-400 hover:underline">Privacy Policy</Link> • <Link href="/signup" className="text-indigo-400 hover:underline">Sign Up</Link>
      </footer>
    </main>
  );
}
