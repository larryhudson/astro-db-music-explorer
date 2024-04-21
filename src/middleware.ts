import { lucia } from "@src/auth";
import { verifyRequestOrigin } from "lucia";
import { defineMiddleware } from "astro:middleware";
import { db, SpotifyToken, NOW, eq, and, gt, desc } from "astro:db";

export const onRequest = defineMiddleware(async (context, next) => {
	//	if (context.request.method !== "GET") {
	//		const originHeader = context.request.headers.get("Origin");
	//		const hostHeader = context.request.headers.get("Host");
	//		if (!originHeader || !hostHeader || !verifyRequestOrigin(originHeader, [hostHeader])) {
	//			return new Response(null, {
	//				status: 403
	//			});
	//		}
	//	}

	const sessionId = context.cookies.get(lucia.sessionCookieName)?.value ?? null;
	if (!sessionId) {
		context.locals.user = null;
		context.locals.session = null;
		return next();
	}

	const { session, user } = await lucia.validateSession(sessionId);
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
		const [newestToken] = await db.select().from(SpotifyToken).where(
			and(
				eq(SpotifyToken.userId, userId),
			)
		)
			.orderBy(desc(SpotifyToken.expiresAt))
			.limit(1);

		const now = new Date();

		const validToken = newestToken && newestToken.expiresAt > now;

		if (validToken) {

			console.log({ validToken })

			return validToken;
		}

		const expiredToken = newestToken && newestToken.expiresAt < now;

		if (expiredToken) {
			const refreshToken = newestToken.refreshToken;

			const spotifyTokenResponse = await fetch(
				"https://accounts.spotify.com/api/token",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/x-www-form-urlencoded",
						Authorization: `Basic ${btoa(
							`${import.meta.env.SPOTIFY_CLIENT_ID}:${import.meta.env.SPOTIFY_CLIENT_SECRET}`,
						)}`,
					},
					body: new URLSearchParams({
						grant_type: "refresh_token",
						refresh_token: refreshToken,
						client_id: import.meta.env.SPOTIFY_CLIENT_ID
					}),
				},
			);

			const spotifyToken = await spotifyTokenResponse.json();

			console.log({ spotifyToken });

			if (spotifyToken.error) {
				console.error(spotifyToken.error);
			}

			const createdToken = await db.insert(SpotifyToken).values({
				accessToken: spotifyToken.access_token,
				refreshToken,
				expiresAt: new Date(Date.now() + spotifyToken.expires_in * 1000),
				userId: context.locals.user.id,
			}).returning();

			return createdToken;

		}

		return null;
	}
	return next();
});
