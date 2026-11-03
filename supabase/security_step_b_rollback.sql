-- Undo security step B: the rules and the two functions exactly as they were on 2026-11-03.
alter policy "public read duty_shifts"   on public.duty_shifts using (true);
alter policy "public change duty_shifts" on public.duty_shifts using (true) with check (true);
alter policy "public add duty_shifts"    on public.duty_shifts with check (true);
alter policy notif_clicks_rw on public.notif_clicks using (true) with check (true);
alter policy "Admin can read visits" on public.page_visits using (true);

CREATE OR REPLACE FUNCTION public.sync_customer_points(p_phone text)
 RETURNS void LANGUAGE plpgsql SECURITY DEFINER
 SET search_path TO 'public', 'extensions', 'pg_temp'
AS $function$
declare cust_id uuid; o record; earned int;
begin
  select id into cust_id from customers
    where right(regexp_replace(phone,'\D','','g'),9) = right(regexp_replace(p_phone,'\D','','g'),9) limit 1;
  if cust_id is null then return; end if;
  for o in select * from orders
    where right(regexp_replace(customer_phone,'\D','','g'),9) = right(regexp_replace(p_phone,'\D','','g'),9)
  loop
    if not exists (select 1 from points_log where order_number = o.order_number and customer_id = cust_id and type = 'earn') then
      earned := floor(coalesce(o.total,0))::int;
      if earned > 0 then
        update customers set points = coalesce(points,0) + earned where id = cust_id;
        insert into points_log(customer_id, order_number, points, type, note) values (cust_id, o.order_number, earned, 'earn', 'نقاط الطلب');
      end if;
    end if;
  end loop;
end;
$function$;

CREATE OR REPLACE FUNCTION public.sync_order_count(p_phone text)
 RETURNS void LANGUAGE plpgsql SECURITY DEFINER
 SET search_path TO 'public', 'extensions', 'pg_temp'
AS $function$
declare cust_id uuid; cnt int;
begin
  select id into cust_id from customers
    where right(regexp_replace(phone,'\D','','g'),9) = right(regexp_replace(p_phone,'\D','','g'),9) limit 1;
  if cust_id is null then return; end if;
  select count(*) into cnt from orders
    where right(regexp_replace(customer_phone,'\D','','g'),9) = right(regexp_replace(p_phone,'\D','','g'),9)
    and order_status not in ('cancelled','canceled');
  update customers set order_count = cnt where id = cust_id;
end;
$function$;
