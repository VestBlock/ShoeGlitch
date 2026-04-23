import { Badge } from '@/components/ui';

export const metadata = {
  title: 'Terms of Service — Shoe Glitch',
  description: 'Terms of Service for Shoe Glitch, a professional sneaker and shoe cleaning service.',
};

export default function TermsPage() {
  return (
    <section className="container-x pt-12 pb-24 max-w-3xl mx-auto">
      <Badge className="mb-6">Legal</Badge>
      <h1 className="h-display text-[clamp(2.5rem,6vw,4.5rem)] leading-[0.9] mb-4">
        Terms of Service
      </h1>
      <p className="text-ink/50 mb-12 text-sm">
        Effective Date: April 19, 2026
      </p>

      <div className="prose-sg">
        <p className="lead">
          These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and use of the
          Shoe Glitch website, services, and related communications. By booking a service,
          creating an account, or using shoeglitch.com, you agree to be bound by these Terms.
        </p>

        <h2>1. Business Information</h2>
        <p>
          Shoe Glitch LLC is a Wisconsin limited liability company with its principal place
          of business in Milwaukee, Wisconsin. Contact: support@shoeglitch.com.
        </p>

        <h2>2. Services</h2>
        <p>
          Shoe Glitch provides professional sneaker and shoe cleaning, restoration,
          deodorizing, specialty fabric treatment, yellowing reversal, repainting, and
          related add-on services. Customers may select local pickup, drop-off, or mail-in
          fulfillment options, depending on market availability.
        </p>

        <h2>3. Service Description</h2>
        <p>
          Customers are booking a cleaning, restoration, or color service on their own
          property and temporarily transferring possession of that property to Shoe Glitch
          for the duration of the service.
        </p>

        <h2>4. Pricing and Payment</h2>
        <p>
          All prices are listed in U.S. dollars. Full payment is charged at the time of
          booking through Stripe. Shoe Glitch may update pricing at any time, but the
          quoted price shown at checkout will be honored for that order. Coupon codes may
          be applied only when valid and may not be stacked unless Shoe Glitch expressly
          allows it. Rush fees, city-specific pickup fees, and mail-in return shipping fees
          will be disclosed at checkout when applicable.
        </p>

        <h3>Current listed services include</h3>
        <ul>
          <li>Fresh Start ($40) — basic exterior cleaning without steam treatment</li>
          <li>Full Reset ($70) — steam-assisted deep clean plus deodorize</li>
          <li>Fabric Rescue ($75) — specialty fabric treatment with material-safe steam-assisted cleaning where appropriate</li>
          <li>Revival Package ($150) — full restoration with steam-assisted deep cleaning and reconditioning</li>
          <li>Ice Recovery ($50) — yellowing reversal on transparent or icy soles</li>
          <li>Sole Color services ($45–$110) — heel and sole repainting, including red-bottom touch-ups on Louboutin-style shoes</li>
          <li>Add-ons including Street Shield, Lace Lab, Fresh Core, and Detail Fix</li>
        </ul>

        <h2>5. Customer Responsibilities</h2>
        <p>
          You represent that you are the legal owner of the shoes submitted for service, or
          that you have authorization from the owner. You must disclose pre-existing damage,
          unusual materials, prior restorations, or special handling concerns at booking.
          For mail-in orders, you are responsible for shipping the shoes to Shoe Glitch
          unless Shoe Glitch states otherwise. Finished shoes must be claimed within 30 days
          of completion. Any pair unclaimed after 60 days may be disposed of or donated at
          Shoe Glitch&rsquo;s discretion unless prohibited by law.
        </p>

        <h2>6. Service Limitations</h2>
        <p>
          Shoe Glitch does not guarantee removal of every stain, odor, discoloration, crease,
          or defect. Some materials, including exotic leathers, delicate suede, aged
          adhesives, and heavily worn footwear, may respond unpredictably to cleaning or
          restoration. Cosmetic color services are refresh treatments and are not structural
          repairs or sole replacements. Results vary based on the condition of the shoes at
          intake.
        </p>

        <h2>7. Damage, Risk of Loss, and Liability</h2>
        <p>
          Shoe Glitch maintains general liability insurance. However, Shoe Glitch&rsquo;s
          maximum liability for any one pair of shoes is limited to the lesser of the
          documented value of the pair or $500. If a pair is worth more than that cap, you
          must notify Shoe Glitch before booking. Shoe Glitch may decline the order or
          require an additional waiver or declared-value process. Shoe Glitch is not liable
          for pre-existing damage, manufacturer defects revealed during service, customer-
          arranged shipping losses, or delays, theft, or damage caused by third-party
          carriers or events beyond Shoe Glitch&rsquo;s reasonable control.
        </p>

        <h2>8. Cancellations and Refunds</h2>
        <p>
          If you cancel within 1 hour of booking, you are eligible for a full refund. If you
          cancel after 1 hour but before work begins, you are eligible for a refund minus a
          5% processing fee. Once work has begun, the order is generally non-refundable,
          though Shoe Glitch may offer a service credit or other remedy at its discretion.
          Dissatisfaction claims must be submitted within 7 days after completion and
          include supporting photos where relevant.
        </p>

        <h2>9. Chargebacks</h2>
        <p>
          If you believe there is an issue with your order, you agree to contact Shoe Glitch
          first and provide a reasonable opportunity to resolve the matter. Chargebacks
          initiated without first contacting Shoe Glitch may be contested using booking
          records, intake notes, photos, and service documentation.
        </p>

        <h2>10. Accounts and Termination</h2>
        <p>
          Shoe Glitch may suspend or terminate accounts, refuse service, or cancel orders
          for fraud, abusive conduct, repeated chargebacks, misrepresentation of shoe
          condition or ownership, or other misuse of the service.
        </p>

        <h2>11. Intellectual Property and Marketing Use</h2>
        <p>
          The Shoe Glitch name, logo, website content, and branding are the property of
          Shoe Glitch LLC. Unless you opt out in writing at booking, Shoe Glitch may use
          before-and-after photos of your shoes for marketing, promotional, educational, or
          portfolio purposes, provided those materials do not intentionally disclose
          sensitive personal information.
        </p>

        <h2>12. Governing Law and Dispute Resolution</h2>
        <p>
          These Terms are governed by the laws of the State of Wisconsin, without regard to
          conflict-of-law principles. Before filing a formal legal claim, you agree to first
          contact Shoe Glitch and allow a 30-day period to attempt informal resolution. Any
          unresolved dispute will be submitted to binding arbitration in Milwaukee County,
          Wisconsin, unless applicable law prohibits mandatory arbitration. To the fullest
          extent permitted by law, claims must be brought on an individual basis and not as
          part of a class action.
        </p>

        <h2>13. Limitation of Liability</h2>
        <p>
          To the fullest extent permitted by law, Shoe Glitch will not be liable for any
          indirect, incidental, special, consequential, exemplary, or punitive damages.
          Except where a separate section sets a lower limit, Shoe Glitch&rsquo;s aggregate
          liability arising out of or related to a specific service order will not exceed
          the amount you paid for that service.
        </p>

        <h2>14. Changes to These Terms</h2>
        <p>
          Shoe Glitch may update these Terms from time to time. The revised version becomes
          effective when posted on the website unless a later effective date is stated.
          Continued use of the website or services after changes are posted constitutes
          acceptance of the updated Terms.
        </p>

        <hr />
        <p className="text-sm text-ink/50">
          Questions? Contact us at{' '}
          <a href="mailto:support@shoeglitch.com" className="text-glitch">support@shoeglitch.com</a>
        </p>
      </div>
    </section>
  );
}
