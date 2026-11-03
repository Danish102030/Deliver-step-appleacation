-- Undo security step D1
alter policy "Allow public read door-photos" on storage.objects using (bucket_id = 'door-photos');
alter policy "Public read door photos"       on storage.objects using (bucket_id = 'door-photos');
update storage.buckets set file_size_limit = null, allowed_mime_types = null where id = 'door-photos';
