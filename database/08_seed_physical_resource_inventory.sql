-- Sample physical inventory for existing demo clubs and shared school supplies.
-- Requires 01_schema.sql through 03_leaderboard_resources.sql and 07_physical_resource_inventory.sql.
-- Safe to rerun: existing inventory counts are not overwritten.

insert into resources
  (id, club_id, created_by, title, description, category, quantity, unit, storage_location, resource_type, url)
values
  ('d2000000-0000-0000-0000-000000000012','c0000000-0000-0000-0000-000000000001','a0000000-0000-0000-0000-000000000004','Arduino boards','Reusable microcontroller boards for club projects.','Electronics',12,'boards','Robotics cabinet','physical_item',null),
  ('d2000000-0000-0000-0000-000000000013','c0000000-0000-0000-0000-000000000001','a0000000-0000-0000-0000-000000000004','Sensor kits','Assorted distance, light and motion sensors.','Electronics',8,'kits','Robotics cabinet','physical_item',null),
  ('d2000000-0000-0000-0000-000000000014','c0000000-0000-0000-0000-000000000001','a0000000-0000-0000-0000-000000000004','Robot chassis','Mobile robot chassis for team builds.','Robotics',4,'chassis','Workshop shelf','physical_item',null),
  ('d2000000-0000-0000-0000-000000000015','c0000000-0000-0000-0000-000000000002','a0000000-0000-0000-0000-000000000005','Micro:bit boards','Pocket-sized programmable boards for coding activities.','Electronics',15,'boards','Coding lab','physical_item',null),
  ('d2000000-0000-0000-0000-000000000016','c0000000-0000-0000-0000-000000000002','a0000000-0000-0000-0000-000000000005','USB cables','USB cables for connecting and powering project boards.','Accessories',10,'cables','Coding lab','physical_item',null),
  ('d2000000-0000-0000-0000-000000000017','c0000000-0000-0000-0000-000000000003','a0000000-0000-0000-0000-000000000006','Tripods','Adjustable tripods for cameras and phones.','Photography equipment',6,'tripods','Media cupboard','physical_item',null),
  ('d2000000-0000-0000-0000-000000000018','c0000000-0000-0000-0000-000000000003','a0000000-0000-0000-0000-000000000006','Camera batteries','Rechargeable spare batteries for club cameras.','Photography equipment',3,'batteries','Media cupboard','physical_item',null),
  ('d2000000-0000-0000-0000-000000000019','c0000000-0000-0000-0000-000000000004','a0000000-0000-0000-0000-000000000007','Debate timers','Handheld timers for practice rounds and competitions.','Supplies',5,'timers','Debate room','physical_item',null),
  ('d2000000-0000-0000-0000-000000000020','c0000000-0000-0000-0000-000000000004','a0000000-0000-0000-0000-000000000007','Whiteboard markers','Markers used for debate preparation and planning.','Stationery',2,'markers','Debate room','physical_item',null),
  ('d2000000-0000-0000-0000-000000000021','c0000000-0000-0000-0000-000000000005','a0000000-0000-0000-0000-000000000008','Seedling trays','Reusable trays for growing and transplanting seedlings.','Gardening supplies',8,'trays','Greenhouse shelf','physical_item',null),
  ('d2000000-0000-0000-0000-000000000022','c0000000-0000-0000-0000-000000000005','a0000000-0000-0000-0000-000000000008','Gardening gloves','Reusable gloves for club planting activities.','Gardening supplies',12,'pairs','Greenhouse shelf','physical_item',null),
  ('d2000000-0000-0000-0000-000000000023',null,'a0000000-0000-0000-0000-000000000001','Football','Shared school football for sports activities.','Sports equipment',2,'footballs','Sports equipment room','physical_item',null),
  ('d2000000-0000-0000-0000-000000000024',null,'a0000000-0000-0000-0000-000000000001','Training cones','Shared cones for drills and activity setup.','Sports equipment',10,'cones','Sports equipment room','physical_item',null)
on conflict (id) do nothing;
