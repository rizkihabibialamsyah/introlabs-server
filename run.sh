#!/bin/bash

echo "==Introlabs Server==
Available commands :
start		: start the server
stop		: stop the server
htop		: resource monitor
publicip	: show public ip of the server
listuser	: list all users
adduser		: add new user
deleteuser	: delete a user
reset		: reset the server
exit		: exit
"

while [ "$usercommand" != "exit" ]; do
	read -p "Command: "  usercommand
	if [ "$usercommand" == "start" ]; then
		python /server/camera/cam-server.py &>/dev/null &
		sleep 3
		cd server
		node . &>/dev/null &
		cd ..
	elif [ "$usercommand" == "stop" ]; then
		pkill python
		pkill node
	elif [ "$usercommand" == "htop" ]; then
		htop
	elif [ "$usercommand" == "publicip" ]; then
		curl ifconfig.me
		echo
	elif [ "$usercommand" == "listuser" ]; then
		cd server/admin
		node listuser.js
		cd ../..
	elif [ "$usercommand" == "adduser" ]; then
		cd server/admin
		node adduser.js
		cd ../..
	elif [ "$usercommand" == "deleteuser" ]; then
		cd server/admin
		node deleteuser.js
		cd ../..
	elif [ "$usercommand" == "reset" ]; then
		pkill python
		pkill node
		cp server/admin/default.json server/admin/users.json
		echo "Reset successful!"
		python server/camera/cam-server.py &>/dev/null &
		sleep 3
		cd server
		node . &>/dev/null &
		cd ..
	elif [ "$usercommand" == "exit" ]; then
		
	else
		echo "Invalid command!"
	fi
done
