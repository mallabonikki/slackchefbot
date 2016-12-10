SELECT *  from session
WHERE admin_id=$1
LIMIT 1;