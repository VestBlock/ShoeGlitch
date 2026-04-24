export const MAIL_IN_BOX_KIT_ID = 'mailin_box_kit';
export const MAIL_IN_BOX_KIT_NAME = 'Mail-In Box Kit';
export const MAIL_IN_BOX_KIT_PRICE = 12;
export const MAIL_IN_BOX_KIT_DELAY = 'Adds 2-4 business days before your inbound shipment starts.';

export function hasMailInBoxKit(
  target:
    | { items?: Array<{ serviceId: string }> }
    | Array<{ serviceId: string }>,
) {
  const items = Array.isArray(target) ? target : target.items ?? [];
  return items.some((item) => item.serviceId === MAIL_IN_BOX_KIT_ID);
}
