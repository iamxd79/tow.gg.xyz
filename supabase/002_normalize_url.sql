create function public.normalize_thesis_url() returns trigger language plpgsql set search_path=public as $$ begin
new.gg_thesis_url:=regexp_replace(trim(new.gg_thesis_url),'[?#].*$','');
new.gg_thesis_url:=regexp_replace(new.gg_thesis_url,'^https?://(www\.)?gg\.xyz/','https://gg.xyz/','i');
new.gg_thesis_url:=regexp_replace(new.gg_thesis_url,'/+$','');
return new; end $$;
create trigger normalize_thesis_url before insert or update of gg_thesis_url on public.thesis_entries for each row execute function public.normalize_thesis_url();
