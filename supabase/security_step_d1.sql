-- Security step D1 (draft 2026-11-03): stop anyone from LISTING the door-photos folder (door photos +
-- pharmacy prescriptions «rx-…»). Links already sent on WhatsApp keep working: a public bucket serves a file by its
-- exact link without these read rules. Uploads keep working (they only need the insert rule).
-- Also: only pictures, at most 15 MB each (today: jpeg / png / webp, biggest 8.8 MB).
-- The nightly clean-up (cron "cleanup-old-door-photos", 30 days) is not changed.
-- Undo: security_step_d1_rollback.sql
alter policy "Allow public read door-photos" on storage.objects using (false);
alter policy "Public read door photos"       on storage.objects using (false);
update storage.buckets set file_size_limit = 15728640, allowed_mime_types = array['image/*'] where id = 'door-photos';
