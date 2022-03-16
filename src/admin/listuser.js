var users = [];

require('fs').readFile('./users.json', 'utf8', (err, jsonString) => {
    if (err) {
        console.log("File read failed:", err)
        return
    }
	users = JSON.parse(jsonString);
	console.log(users);
})
