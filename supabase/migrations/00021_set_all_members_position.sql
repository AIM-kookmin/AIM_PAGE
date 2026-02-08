-- Set all existing members' position to '운영진'
UPDATE public.member_profiles
SET position = '운영진'
WHERE position IS NULL OR position = '' OR position NOT IN ('운영진', '관리자', '회장');
