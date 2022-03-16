const prompt = require('prompt');

var users = [];

require('fs').readFile('./users.json', 'utf8', (err, jsonString) => {
    if (err) {
        console.log("File read failed:", err)
        return
    }
	users = JSON.parse(jsonString);
})

const properties = [
    {
        name: 'username',
        validator: /^[a-zA-Z\s\-]+$/,
        warning: 'Username must be only letters, spaces, or dashes'
    }
];

prompt.start();

prompt.get(properties, async function (err, result) {
    if (err) { return onErr(err); }
	let foundUser = users.find((data) => result.username === data.username);

	const index = users.indexOf(foundUser);
	if (index > -1) {
	  users.splice(index, 1); // 2nd parameter means remove one item only
	}

	require('fs').writeFile(
		'./users.json',

		JSON.stringify(users),

		function (err) {
			if (err) {
				console.error('Error writing file!');
			}
			else
				console.log(`Sucessfully deleted user ${foundUser.username}`);
		}
	);
});

function onErr(err) {
    console.log(err);
    return 1;
}
