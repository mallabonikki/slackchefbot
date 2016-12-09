-- SELECT * 
-- FROM sessions 
-- WHERE user = $1

select *  from sessions 
WHERE user_id=$1
order by id desc LIMIT 1;