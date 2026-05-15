-- Fase 6: bucket de comprovantes
-- Rodar no Supabase SQL Editor antes de usar upload de comprovantes

insert into storage.buckets (id, name, public)
values ('comprovantes', 'comprovantes', false)
on conflict do nothing;

create policy "service_role_comprovantes"
  on storage.objects for all to service_role
  using (bucket_id = 'comprovantes');

create policy "authenticated_comprovantes"
  on storage.objects for all to authenticated
  using (bucket_id = 'comprovantes');
