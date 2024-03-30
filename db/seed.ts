import { db, User, Bookmark, FriendRequest, Friendship } from 'astro:db';
import { generateId } from "lucia";
import { Argon2id } from "oslo/password";
import { validateUsername, validatePassword } from "@src/utils/auth";

async function createAdminUser() {
	const ADMIN_USERNAME = import.meta.env.ADMIN_USERNAME;
	const ADMIN_PASSWORD = import.meta.env.ADMIN_PASSWORD;
	const ADMIN_EMAIL = import.meta.env.ADMIN_EMAIL;

	console.log("got here - creating admin user");

	const usernameIsValid = validateUsername(ADMIN_USERNAME);
	if (
		!usernameIsValid
	) {
		throw new Error("Invalid ADMIN_USERNAME");
	}

	console.log("got here - after validating username");

	const passwordIsValid = validatePassword(ADMIN_PASSWORD);
	if (!passwordIsValid) {
		throw new Error("Invalid ADMIN_PASSWORD")
	}

	const userId = generateId(15);
	const hashedPassword = await new Argon2id().hash(ADMIN_PASSWORD);

	await db.insert(User).values({
		id: userId,
		username: ADMIN_USERNAME,
		email: ADMIN_EMAIL,
		hashedPassword,
		isAdmin: true,
		isApproved: true,
	});

	return userId;
}

async function createExampleFriend({ username, password, email }) {

	const usernameIsValid = validateUsername(username);
	if (!usernameIsValid) {
		throw new Error("Invalid username");
	}

	const passwordIsValid = validatePassword(password);
	if (!passwordIsValid) {
		throw new Error("Invalid password");
	}

	const userId = generateId(15);
	const hashedPassword = await new Argon2id().hash(password);

	await db.insert(User).values({
		id: userId,
		username,
		email,
		hashedPassword,
		isAdmin: false,
		isApproved: false,
	});

	return userId;
}

async function createExampleFriendRequest({ fromUserId, toUserId, isAccepted }) {
	const friendRequestId = generateId(15);
	await db.insert(FriendRequest).values({
		id: friendRequestId,
		fromUserId,
		toUserId,
		acceptedAt: isAccepted ? new Date() : undefined,
	});
	if (isAccepted) {
		// create friendship
		await db.insert(Friendship).values({
			userId: fromUserId,
			friendId: toUserId,
			friendRequestId
		})
	}
	return friendRequestId;
}

async function createExampleBookmarks(adminUserId: string, friendUserId: string) {

	const adminBookmarks = [
		{ url: "https://open.spotify.com/album/1KeJzjoh4vHrJif6BsYKRg", note: "The Greater Wings by Julie Byrne. I loved her last album but haven't given this much of a shot" },
		{ url: "https://open.spotify.com/album/1MnXimslhsID4KeJelVahi", note: "Second album by Power. I never got around to listening to this" },
		{ url: "https://open.spotify.com/album/2n3HUMLmNl0Cm2atVwWSK6", note: "New album by Waxahatchee. Features MJ Lenderman on a few songs" },
		{ url: "https://open.spotify.com/album/5ROzqM7rbMYoKbQIw4i7fp", note: "New album by Mannequin Pussy. Has great reviews and I like a couple of the singles" },
		{ url: "https://open.spotify.com/album/36z8ptLj0Dag5rxBmwvFxe", note: "New album By Hannah Frances. Liam likes this one." },
		{ url: "https://open.spotify.com/album/3x7dU12xab8PhGkRQksx0h", note: "Band called Clever - punk band from Brisbane - showed up in similar artists for Power." },
		{ url: "https://open.spotify.com/album/1rDjHlur6uZheIHpBdmLEF", note: "Latest album by Romare - I listened to this once and liked the sound of it." },
		{ url: "https://open.spotify.com/artist/6sM2JCBjZprP7JLMTZZSxX", note: "American band called 'Hum' - recommended by Torquay record store owner." },
		{ url: "https://open.spotify.com/album/07h9Qsx40cCp1h0ykxuqU1", note: "New album by Ratboys - was number 1 in Treble Zine's top albums of 2023" },
		{ url: "https://youtu.be/52CZVfiiMpY?si=_3wQLlE9d0ZgxUoU", note: "Mdou Moctar on KEXP" },
		{ url: "https://open.spotify.com/album/3aoNtxk8uktrh29IWrVfbn", note: "Album by Jessica Pratt. Liam likes it" },
		{ url: "https://www.treblezine.com/chastity-belt-live-laugh-love-review/", note: "New album by Chastity Belt, Treble Zine review" },
		{ url: "https://www.treblezine.com/faye-webster-underdressed-at-the-symphony-review/", note: "New album by Faye Webster, Treble Zine review" },
	]

	const friendBookmarks = [
		{ url: "https://open.spotify.com/album/4N8CfMDL60vLQamW30qZAE", note: "New album by Jlin. Album of the week on Treble Zine" },
		{ url: "https://www.last.fm/user/dnsosebee", note: "Top listener of Romare - check out their other top artists" },
		{ url: "https://www.treblezine.com/50-best-albums-of-2023/", note: "Treble Zine's top albums of 2023" },
	]

	const adminInsertQueries = adminBookmarks.map(bookmark => (
		db.insert(Bookmark).values({
			userId: adminUserId,
			url: bookmark.url,
			note: bookmark.note,
		})
	));

	const friendInsertQueries = adminBookmarks.map(bookmark => (
		db.insert(Bookmark).values({
			userId: friendUserId,
			url: bookmark.url,
			note: bookmark.note,
		})
	));

	await db.batch(adminInsertQueries);
	await db.batch(friendInsertQueries);
}



// https://astro.build/db/seed
export default async function seed() {
	const adminUserId = await createAdminUser();
	const friendUserId = await createExampleFriend({ username: "friend", password: "password", email: "friend@gmail.com" })
	await createExampleFriendRequest({ fromUserId: adminUserId, toUserId: friendUserId, isAccepted: true });

	const friendRequesterUserId = await createExampleFriend({ username: "friendrequester", password: "password", email: "friendrequester@gmail.com" })
	await createExampleFriendRequest({ fromUserId: friendRequesterUserId, toUserId: adminUserId, isAccepted: false });

	await createExampleBookmarks(adminUserId, friendUserId);
}
