export function buildAlertDeliveryKey(watchlistItemId: string, sneakerEventId: string) {
  return `${watchlistItemId}:${sneakerEventId}:email`;
}
