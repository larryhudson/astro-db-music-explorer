import { db, User, Article, FriendRequest, Friendship, Source, MusicItem } from 'astro:db';
import { generateId } from "lucia";
import { Argon2id } from "oslo/password";
import { validateUsername, validatePassword } from "@src/utils/auth";
import "dotenv/config";

function getEnvVar(name: string): string {
	const value = import.meta?.env?.[name] || process.env[name];
	if (!value) {
		throw new Error(`Missing environment variable ${name}`);
	}
	return value;
}

async function createAdminUser() {
	const ADMIN_USERNAME = getEnvVar("ADMIN_USERNAME");
	const ADMIN_PASSWORD = getEnvVar("ADMIN_PASSWORD");
	const ADMIN_EMAIL = getEnvVar("ADMIN_EMAIL");

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

async function createExampleArticles(adminUserId: string, friendUserId: string) {

	const adminMusicItems = [
		{ url: "https://open.spotify.com/album/1KeJzjoh4vHrJif6BsYKRg", title: "The Greater Wings by Julie Byrne", note: "I loved her last album but haven't given this much of a shot" },
		{ url: "https://open.spotify.com/album/1MnXimslhsID4KeJelVahi", title: "Turned On by Power", note: "Second album by Power. I never got around to listening to this" },
		{ url: "https://open.spotify.com/album/2n3HUMLmNl0Cm2atVwWSK6", title: "Tigers Blood by Waxahatchee", note: "New album by Waxahatchee. Features MJ Lenderman on a few songs" },
		{ url: "https://open.spotify.com/album/5ROzqM7rbMYoKbQIw4i7fp", title: "I've Got Heaven by Mannequin Pussy", note: "New album by Mannequin Pussy. Has great reviews and I like a couple of the singles" },
		{ url: "https://open.spotify.com/album/36z8ptLj0Dag5rxBmwvFxe", title: "The Keeper of the Shepherd by Hannah Frances", note: "New album By Hannah Frances. Liam likes this one." },
		{ url: "https://open.spotify.com/album/3x7dU12xab8PhGkRQksx0h", title: "Hangin' Egg by Clever", note: "Band called Clever - punk band from Brisbane - showed up in similar artists for Power." },
		{ url: "https://open.spotify.com/album/1rDjHlur6uZheIHpBdmLEF", title: "Here Comes the Night by Romare", note: "Latest album by Romare - I listened to this once and liked the sound of it." },
		{ url: "https://open.spotify.com/artist/6sM2JCBjZprP7JLMTZZSxX", title: "Artist called Hum", note: "American band called 'Hum' - recommended by Torquay record store owner." },
		{ url: "https://open.spotify.com/album/07h9Qsx40cCp1h0ykxuqU1", title: "The Window by Ratboys", note: "New album by Ratboys - was number 1 in Treble Zine's top albums of 2023" },
		{ url: "https://open.spotify.com/album/3aoNtxk8uktrh29IWrVfbn", title: "Quiet Signs by Jessica Pratt", note: "Album by Jessica Pratt. Liam likes it" },
	]

	const adminArticles = [
		{ url: "https://youtu.be/52CZVfiiMpY?si=_3wQLlE9d0ZgxUoU", title: "Mdou Moctar on KEXP", note: "Mdou Moctar on KEXP" },
		{ url: "https://www.treblezine.com/chastity-belt-live-laugh-love-review/", title: "Live Laugh Love by Chastity Belt", note: "New album by Chastity Belt, Treble Zine review" },
		{ url: "https://www.treblezine.com/faye-webster-underdressed-at-the-symphony-review/", title: "Underdressed at the Symphony by Faye Webster", note: "New album by Faye Webster, Treble Zine review" },
	]

	const friendMusicItems = [
		{ url: "https://open.spotify.com/album/4N8CfMDL60vLQamW30qZAE", title: "Akoma by Jlin", note: "New album by Jlin. Album of the week on Treble Zine" },
	]

	const friendArticles = [
		{ url: "https://www.last.fm/user/dnsosebee", title: "dnsosebee user on Last.fm", note: "Top listener of Romare - check out their other top artists" },
		{ url: "https://www.treblezine.com/50-best-albums-of-2023/", title: "Treble Zine's top albums of 2023", note: "Treble Zine's top albums of 2023" },
	]

	const adminArticleInsertQueries = adminArticles.map(article => (
		db.insert(Article).values({
			userId: adminUserId,
			url: article.url,
			note: article.note,
			title: article.title
		})
	));


	const adminMusicItemInsertQueries = adminMusicItems.map(musicItem => (
		db.insert(MusicItem).values({
			userId: adminUserId,
			url: musicItem.url,
			note: musicItem.note,
			title: musicItem.title
		})
	));

	const friendArticleInsertQueries = friendArticles.map(article => (
		db.insert(Article).values({
			userId: friendUserId,
			url: article.url,
			note: article.note,
			title: article.title
		})
	));

	const friendMusicItemInsertQueries = friendMusicItems.map(musicItem => (
		db.insert(MusicItem).values({
			userId: friendUserId,
			url: musicItem.url,
			note: musicItem.note,
			title: musicItem.title
		})
	));

	console.log("doing the admin article insert queries");
	await db.batch(adminArticleInsertQueries);
	console.log("doing the admin music item insert queries");
	await db.batch(adminMusicItemInsertQueries);
	console.log("doing the friend article insert queries");
	await db.batch(friendArticleInsertQueries);
	console.log("doing the friend music item insert queries");
	await db.batch(friendMusicItemInsertQueries);
}

async function createAdminSources(adminUserId: string) {

	const sources = [{
		title: "Paste Magazine",
		url: "https://www.pastemagazine.com/article-category/music",
		note: "Seem to have good curation for alternative music"
	},
	{ title: "Treble Zine", url: "https://www.treblezine.com/", note: "Good reviews of new music" },
	{ title: "NPR Music", url: "https://www.npr.org/music/", note: "Good for discovering new music" },
	{ title: "Post-Trash", url: "http://post-trash.com/", note: "More punky stuff" },
	{ title: "Pitchfork", url: "https://pitchfork.com/", note: "Indie reviews" },
	{ title: "RA Mix of the Day", url: "https://ra.co/mix-of-the-day", note: "Electronic mixes" },
	{ title: "Mixmag Music", url: "https://mixmag.net/music", note: "Electronic music news" },
	{ title: "RA Reviews", url: "https://ra.co/music", note: "Electronic music reviews" },
	{ title: "PopMatters", url: "https://www.popmatters.com/category/music", note: "Music reviews" },
	{ title: "KEXP YouTube channel", url: "https://www.youtube.com/@kexp/videos", note: "Live performances" },
	{ title: "Audiotree YouTube channel", url: "https://www.youtube.com/@audiotree/videos", note: "Like KEXP but punkier" },
	{ title: "KCRW website", url: "https://www.kcrw.com/music", note: "Cool radio station" },
	{ title: "Sputnikmusic", url: "https://www.sputnikmusic.com/reviews/staff/albums", note: "Nerdy music community" },
	{ title: "Bandcamp Daily", url: "https://daily.bandcamp.com/", note: "Nice curation of indie music of different genres" },
	{ title: "Reddit r/indieheads", url: "https://www.reddit.com/r/indieheads/", note: "Good for new music" },
	];

	const insertQueries = sources.map(source => (
		db.insert(Source).values({
			userId: adminUserId,
			...source
		})
	))

	await db.batch(insertQueries);
}

// https://astro.build/db/seed
export default async function seed() {
	const adminUserId = await createAdminUser();

	const FRIEND_USERNAME = getEnvVar("FRIEND_USERNAME");
	const FRIEND_PASSWORD = getEnvVar("FRIEND_PASSWORD");
	const FRIEND_EMAIL = getEnvVar("FRIEND_EMAIL");

	const friendUserId = await createExampleFriend({ username: FRIEND_USERNAME, password: FRIEND_PASSWORD, email: FRIEND_EMAIL })
	await createExampleFriendRequest({ fromUserId: adminUserId, toUserId: friendUserId, isAccepted: true });

	const friendRequesterUserId = await createExampleFriend({ username: "friendrequester", password: "password", email: "friendrequester@gmail.com" })
	await createExampleFriendRequest({ fromUserId: friendRequesterUserId, toUserId: adminUserId, isAccepted: false });

	//	await createExampleArticles(adminUserId, friendUserId);

	//	await createAdminSources(adminUserId);
}
