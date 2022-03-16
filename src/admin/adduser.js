const bcrypt = require('bcrypt');
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
    },
    {
        name: 'password',
        hidden: true
    },
    {
        name: 'type'
    }
];

prompt.start();

prompt.get(properties, async function (err, result) {
    if (err) { return onErr(err); }

	hashPassword = await bcrypt.hash(result.password, 10);

	let newUser = {
		id: Date.now(),
		username: result.username,
		password: hashPassword,
    		type: result.type,
	};

	users.push(newUser);

	require('fs').writeFile(
		'./users.json',

		JSON.stringify(users),

		function (err) {
			if (err) {
				console.error('Error writing file!');
			}
			else
				console.log(`Sucessfully added user ${newUser.username}`);
		}
	);
});

function onErr(err) {
    console.log(err);
    return 1;
}
