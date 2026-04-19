-- Run this in Supabase SQL Editor to add the missing FK
-- from orders.couponCode → coupons.code.

ALTER TABLE public.orders
ADD CONSTRAINT orders_coupon_code_fkey
FOREIGN KEY ("couponCode")
REFERENCES public.coupons(code)
ON DELETE SET NULL;
