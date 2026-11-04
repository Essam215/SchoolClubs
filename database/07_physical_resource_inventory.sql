-- Upgrade the resource library to club-owned physical inventory.
-- Existing online resources are retained but are no longer shown in the inventory.
-- Safe to run in Supabase > SQL Editor without altering or dropping existing data.

alter table resources
  add column if not exists quantity integer not null default 0,
  add column if not exists unit text not null default 'items',
  add column if not exists storage_location text;

alter table resources alter column url drop not null;
alter table resources alter column resource_type set default 'physical_item';

alter table resources drop constraint if exists resources_resource_type_check;
alter table resources
  add constraint resources_resource_type_check
  check (resource_type in ('article','video','document','website','physical_item'));

alter table resources drop constraint if exists resources_quantity_check;
alter table resources
  add constraint resources_quantity_check check (quantity >= 0);

create index if not exists resources_physical_inventory_idx
  on resources (club_id, category, title)
  where resource_type = 'physical_item';
