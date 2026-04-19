import { redirect } from 'next/navigation';

// If someone lands on /customer/orders/not-found etc., next/notFound handles it.
// This file handles the root redirect when visiting bare /app
// (Not actually needed — included for completeness with catch-all handling.)

export default function NotFound() {
  redirect('/');
}
