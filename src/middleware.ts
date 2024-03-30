import { lucia } from "@src/auth";
import { verifyRequestOrigin } from "lucia";
import { defineMiddleware } from "astro:middleware";
import { db, SpotifyToken, NOW, eq, and, gt } from "astro:db";

export const onRequest = defineMiddleware(async (context, next) => {
	if (context.request.method !== "GET") {
		const originHeader = context.request.headers.get("Origin");
		const hostHeader = context.request.headers.get("Host");
		if (!originHeader || !hostHeader || !verifyRequestOrigin(originHeader, [hostHeader])) {
			return new Response(null, {
				status: 403
			});
		}
	}

	const sessionId = context.cookies.get(lucia.sessionCookieName)?.value ?? null;
	if (!sessionId) {
		context.locals.user = null;
		context.locals.session = null;
		return next();
	}

	const { session, user } = await lucia.validateSession(sessionId);
	console.log({ userFromMiddleware: user });
	if (session && session.fresh) {
		const sessionCookie = lucia.createSessionCookie(session.id);
		context.cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
	}
	if (!session) {
		const sessionCookie = lucia.createBlankSessionCookie();
		context.cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
	}
	context.locals.session = session;
	context.locals.user = user;
	context.locals.getSpotifyToken = async () => {
		console.log("from inside getSpotifyToken");
		if (!user) return null;
		const userId = user.id;
		console.log({ userIdFromInsideGetSpotifyToken: userId })
		const [validToken] = await db.select().from(SpotifyToken).where(
			and(
				eq(SpotifyToken.userId, userId),
				gt(SpotifyToken.expiresAt, NOW),
			)
		).limit(1);

		console.log({ validToken })

		return validToken;

		if (!validToken) {
			// TODO: use the refresh token?
			return null;
		}
	}
	return next();
});
