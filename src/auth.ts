import { Lucia } from "lucia";
import { AstroDBAdapter } from "lucia-adapter-astrodb";
import { db, Session, User, SpotifyToken, NOW, eq, and, gt } from "astro:db";


const adapter = new AstroDBAdapter(db, Session, User); // your adapter

export const lucia = new Lucia(adapter, {
	sessionCookie: {
		attributes: {
			// set to `true` when using HTTPS
			secure: import.meta.env.PROD
		}
	},
	getUserAttributes: (attributes) => {
		console.log({ attributes });
		return {
			username: attributes.username,
			isAdmin: attributes.isAdmin,
			isApproved: attributes.isApproved,
		}
	}
});

declare module "lucia" {
	interface Register {
		Lucia: typeof lucia;
		DatabaseUserAttributes: DatabaseUserAttributes
	}
}

interface DatabaseUserAttributes {
	id: string;
	username: string;
	isAdmin: boolean;
	isApproved: boolean;
	getSpotifyToken: Function;
}

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
