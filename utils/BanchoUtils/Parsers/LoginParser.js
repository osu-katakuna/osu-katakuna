module.exports = (request) => {
	const data = request.req.body.slice(0).toString().split('\n')
	if(data.length < 3) throw new Error("Malformed login data!")

	const client_data = data[2].split("|")

	return {
		username: data[0],
		password: data[1],
		client_build: client_data[0],
		timezoneOffset: client_data[1],
		displayCityLocation: client_data[2],
		clientHash: client_data[3],
		blockNonFriendPM: client_data[4]
	}
};
