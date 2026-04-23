update public.cleaners
set "payoutRate" = case tier
  when 'starter' then 0.62
  when 'pro' then 0.78
  when 'luxury' then 0.92
  else "payoutRate"
end
where tier in ('starter', 'pro', 'luxury');

