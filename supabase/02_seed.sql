-- Demo data. Run AFTER 01_migration.sql (safe to run once).
update settings set business_name='Sree Ganesh Stores',address='12, Usman Road, T. Nagar, Chennai 600017',phone='+91 98400 12345' where id=1;
insert into products(name,sku,category,purchase_price,selling_price,stock,unit) values
('Basmati Rice 5kg','GR-001','Grocery',310,368,42,'bag'),('Toor Dal 1kg','GR-002','Grocery',128,152,8,'kg'),
('Sunflower Oil 1L','GR-003','Grocery',118,139,26,'btl'),('Filter Coffee 250g','BV-001','Beverages',96,120,5,'pack'),
('Tea Powder 500g','BV-002','Beverages',142,175,19,'pack'),('Sugar 1kg','GR-004','Grocery',41,49,60,'kg'),
('Bath Soap','HC-001','Home care',28,38,74,'pc'),('Detergent 1kg','HC-002','Home care',88,110,9,'pack'),
('Biscuits Family','SN-001','Snacks',22,30,88,'pc'),('Banana Chips 200g','SN-002','Snacks',48,65,31,'pack'),
('Notebook A5','ST-001','Stationery',34,48,45,'pc'),('Ball Pen (10)','ST-002','Stationery',52,75,12,'set');
insert into customers(name,phone) values('Meena Iyer','98410 22334'),('Karthik R','98840 55671'),('Lakshmi Traders','94440 10987'),('Farhan Ali','97910 88231'),('Divya S','99401 76543');
insert into expenses(name,category,amount,expense_date,payment_method,notes) values
('Shop rent','Rent',28000,current_date-24,'UPI / QR','September rent'),('Staff salary','Salary',22000,current_date-20,'Cash','2 staff'),
('Electricity bill','Electricity',3650,current_date-14,'UPI / QR','TNEB'),('Auto freight','Transport',1200,current_date-6,'Cash','Stock delivery'),
('Broadband','Internet',999,current_date-3,'Card','Monthly');
-- 90 days of bills (direct inserts, so product stock above is left as-is)
do $$ declare d int; j int; c customers; p products; bid uuid; sub numeric; disc numeric; ts timestamptz; q int;
begin
  for d in reverse 89..0 loop
    for j in 1..(floor(random()*3)::int+case when d<10 then 1 else 0 end) loop
      ts:=date_trunc('day',now())-make_interval(days=>d)+make_interval(hours=>9+floor(random()*11)::int,mins=>floor(random()*60)::int);
      select * into c from customers order by random() limit 1;
      insert into bills(invoice_no,customer_id,customer_name,customer_phone,subtotal,total,payment_method,created_at)
      values('INV-'||lpad(nextval('invoice_seq')::text,5,'0'),c.id,c.name,c.phone,0,0,(array['Cash','Card','UPI / QR'])[1+floor(random()*3)::int],ts) returning id into bid;
      for p in select * from products order by random() limit 1+floor(random()*3)::int loop
        q:=1+floor(random()*3)::int;
        insert into bill_items(bill_id,product_id,name,qty,selling_price,purchase_price) values(bid,p.id,p.name,q,p.selling_price,p.purchase_price);
      end loop;
      select sum(qty*selling_price) into sub from bill_items where bill_id=bid;
      disc:=case when random()<.2 then round(sub*.05) else 0 end;
      update bills set subtotal=sub,discount_value=case when disc>0 then 5 else 0 end,discount_amount=disc,total=sub-disc where id=bid;
    end loop;
  end loop;
end $$;
