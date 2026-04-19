import { Badge } from '@/components/ui';

export const metadata = {
  title: 'Refund & Damage Policy — Shoe Glitch',
  description: 'Refund and damage policy for Shoe Glitch sneaker cleaning and restoration services.',
};

export default function RefundPolicyPage() {
  return (
    <section className="container-x pt-12 pb-24 max-w-3xl mx-auto">
      <Badge className="mb-6">Legal</Badge>
      <h1 className="h-display text-[clamp(2.5rem,6vw,4.5rem)] leading-[0.9] mb-4">
        Refund &amp; Damage Policy
      </h1>
      <p className="text-ink/50 mb-12 text-sm">
        Effective Date: April 19, 2026
      </p>

      <div className="prose-sg">
        <p className="lead">
          This Refund / Damage Policy explains how Shoe Glitch handles service complaints,
          redo requests, refunds, and damage claims.
        </p>

        <h2>1. Satisfaction Window</h2>
        <p>
          If you are not satisfied with the completed service, you must contact Shoe Glitch
          within 7 days after completion or delivery. Your message should describe the
          issue clearly and include photos when possible.
        </p>

        <h2>2. Available Remedies</h2>
        <p>
          After reviewing the issue, Shoe Glitch may choose an appropriate remedy, including
          a free redo of the service, a partial refund, a full refund where the service was
          not performed as described, store or service credit, or replacement compensation
          up to the applicable liability cap.
        </p>

        <h2>3. Damage Claims</h2>
        <p>
          If you believe your shoes were damaged while in Shoe Glitch&rsquo;s care, you must
          submit the claim within 7 days of pickup, delivery, or return shipment. Shoe
          Glitch may compare your claim against intake photos, operator notes, service logs,
          and before-and-after images. Approved claims will generally be paid to the
          original payment method within 10 business days after resolution, unless another
          remedy is agreed upon.
        </p>

        <h2>4. Non-Refundable Situations</h2>
        <p>
          Refunds or damage claims may be denied for issues caused by pre-existing wear,
          damage visible at intake, defects inherent to the original materials or
          construction, damage occurring after the shoes were returned to you, failure to
          follow care instructions, or customer no-shows where a pickup fee was incurred
          and disclosed.
        </p>

        <h2>5. Extreme Pre-Existing Wear</h2>
        <p>
          If a pair arrives in a condition that makes service unsafe or impractical, Shoe
          Glitch may decline to complete the service. In those cases, Shoe Glitch may issue
          a refund minus any disclosed intake or inspection fee, such as a $10 intake
          inspection fee, if one applies.
        </p>

        <h2>6. Shipping Issues</h2>
        <p>
          For mail-in orders, customers should use trackable shipping and should insure
          high-value pairs. If a carrier loses or damages a shipment, Shoe Glitch may
          assist with the carrier claim process, but reimbursement timing may depend on
          the carrier&rsquo;s investigation and decision. For pairs over $500, Shoe Glitch
          may require insured shipping or a special handling process.
        </p>

        <h2>7. How to Contact Shoe Glitch About a Claim</h2>
        <p>
          Send claims or complaints to{' '}
          <a href="mailto:support@shoeglitch.com" className="text-glitch">support@shoeglitch.com</a>{' '}
          and include your order number, full name, a description of the issue, and
          supporting photos. Prompt reporting improves the likelihood of a fair and
          accurate review.
        </p>
      </div>
    </section>
  );
}
