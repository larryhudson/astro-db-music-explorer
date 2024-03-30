export function validateUsername(username: string) {

	console.log("Got here - inside validating username");

	if (
		typeof username !== "string" ||
		username.length < 3 ||
		username.length > 31 ||
		!/^[a-z0-9_-]+$/.test(username)
	) {
		return false;
	}

	return true;
}

export function validatePassword(password: string) {

	if (typeof password !== "string" || password.length < 6 || password.length > 255) {
		return false;
	}

	return true;
}
