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
		python src/camera/cam-server.py &>/dev/null &
		sleep 3
		cd src
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
		cd src/admin
		node listuser.js
		cd ../..
	elif [ "$usercommand" == "adduser" ]; then
		cd src/admin
		node adduser.js
		cd ../..
	elif [ "$usercommand" == "deleteuser" ]; then
		cd src/admin
		node deleteuser.js
		cd ../..
	elif [ "$usercommand" == "reset" ]; then
		pkill python
		pkill node
		cp src/admin/default.json src/admin/users.json
		echo "Reset successful!"
		python src/camera/cam-server.py &>/dev/null &
		sleep 3
		cd src
		node . &>/dev/null &
		cd ..
	elif [ "$usercommand" == "exit" ]; then
		echo	
	else
		echo "Invalid command!"
	fi
done
