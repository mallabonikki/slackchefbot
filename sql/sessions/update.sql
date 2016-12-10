UPDATE session
	SET lunch=$1, price=$2
	WHERE admin_id=$3;