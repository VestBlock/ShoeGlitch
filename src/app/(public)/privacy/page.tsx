import { Badge } from '@/components/ui';

export const metadata = {
  title: 'Privacy Policy — Shoe Glitch',
  description: 'Privacy Policy for Shoe Glitch describing how customer data is collected, used, and protected.',
};

export default function PrivacyPage() {
  return (
    <section className="container-x pt-12 pb-24 max-w-3xl mx-auto">
      <Badge className="mb-6">Legal</Badge>
      <h1 className="h-display text-[clamp(2.5rem,6vw,4.5rem)] leading-[0.9] mb-4">
        Privacy Policy
      </h1>
      <p className="text-ink/50 mb-12 text-sm">
        Effective Date: April 19, 2026
      </p>

      <div className="prose-sg">
        <p className="lead">
          This Privacy Policy explains how Shoe Glitch collects, uses, shares, stores, and
          protects personal information when you use shoeglitch.com, create an account, book
          services, contact support, or otherwise interact with Shoe Glitch.
        </p>

        <h2>1. Information We Collect</h2>
        <p>
          Shoe Glitch may collect the following categories of information: full name, email
          address, phone number, pickup address, shipping address, account credentials,
          authentication details, order details, shoe category, brand, condition notes,
          uploaded photos, customer support messages, and transaction metadata. Payment
          card information is processed by Stripe and is not stored directly by Shoe Glitch.
        </p>

        <h3>Authentication methods currently used</h3>
        <ul>
          <li>Email and password</li>
          <li>Google OAuth sign-in</li>
        </ul>

        <h2>2. How We Use Information</h2>
        <p>
          Shoe Glitch uses personal information to create and manage accounts, schedule
          pickups and returns, process and fulfill service orders, communicate order
          updates, provide customer support, prevent fraud, improve operations, analyze
          service quality, maintain records, comply with legal obligations, and send
          marketing communications where permitted by law or with your consent.
        </p>

        <h2>3. Service Providers and Third Parties</h2>
        <p>
          Shoe Glitch shares information only as needed to operate the business, fulfill
          services, protect the platform, and comply with the law. Shoe Glitch does not
          sell personal information to advertisers or data brokers.
        </p>

        <h3>Current or planned service providers include</h3>
        <ul>
          <li>Stripe, Inc. — payment processing</li>
          <li>Supabase Inc. — database hosting and user authentication</li>
          <li>Vercel, Inc. — website hosting and deployment</li>
          <li>Google LLC — Google OAuth sign-in</li>
          <li>Your active domain registrar — domain services</li>
          <li>Resend — transactional email, if enabled</li>
          <li>UPS, USPS, FedEx, or other shipping carriers — mail-in and return fulfillment</li>
          <li>Google Analytics, if added later for site analytics</li>
        </ul>

        <h2>4. Cookies and Similar Technologies</h2>
        <p>
          Shoe Glitch uses essential session and authentication cookies that are required
          for account login and secure website functionality. If analytics tools are
          enabled, Shoe Glitch may also use analytics cookies to understand site traffic
          and usage patterns. Shoe Glitch does not currently use advertising or cross-site
          behavioral tracking cookies.
        </p>

        <h2>5. Data Retention</h2>
        <p>
          Active account information is generally retained while your account remains open.
          Order history and transaction-related records may be retained for up to 7 years
          to satisfy tax, accounting, fraud prevention, legal, and operational requirements.
          If you request deletion of your account, Shoe Glitch will delete or de-identify
          personal information within a reasonable period, except where retention is
          required by law or for legitimate business recordkeeping.
        </p>

        <h2>6. Your Rights and Choices</h2>
        <p>
          You may request access to your personal information, ask for corrections, request
          deletion subject to legal exceptions, and opt out of marketing emails by using
          the unsubscribe link or contacting Shoe Glitch. Shoe Glitch does not sell
          personal information. California residents may have additional rights under
          California law, including the right to know what information is collected and
          shared, the right to request deletion, and the right not to be discriminated
          against for exercising privacy rights.
        </p>

        <h2>7. U.S.-Only Service Scope</h2>
        <p>
          Shoe Glitch primarily operates in Wisconsin and accepts mail-in orders from
          customers in the 50 United States. Shoe Glitch is not currently intended for
          international customers and does not knowingly target residents of the European
          Union or other jurisdictions outside the United States.
        </p>

        <h2>8. Children&rsquo;s Privacy</h2>
        <p>
          Shoe Glitch is not intended for individuals under the age of 18. Shoe Glitch does
          not knowingly collect personal information from minors. If you believe a minor
          has provided personal information, contact Shoe Glitch so the information can be
          reviewed and deleted where appropriate.
        </p>

        <h2>9. Security</h2>
        <p>
          Shoe Glitch uses reasonable administrative, technical, and organizational
          safeguards to protect personal information. Data is transmitted over HTTPS where
          supported, passwords are managed through Supabase Auth, and payments are handled
          by PCI-compliant Stripe infrastructure. No system is perfectly secure, but Shoe
          Glitch limits access to customer information to authorized personnel and service
          providers who need it to operate the business.
        </p>

        <h2>10. Contact for Privacy Requests</h2>
        <p>
          To exercise privacy rights or ask questions about this Privacy Policy, contact{' '}
          <a href="mailto:privacy@shoeglitch.com" className="text-glitch">privacy@shoeglitch.com</a>.
        </p>

        <h2>11. Policy Updates</h2>
        <p>
          Shoe Glitch may update this Privacy Policy from time to time. If material changes
          are made, Shoe Glitch may post the revised policy on the website and may notify
          active users by email where appropriate.
        </p>
      </div>
    </section>
  );
}
