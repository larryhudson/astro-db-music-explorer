import { APIContext } from "astro";

export async function GET(Astro: APIContext) {
	console.log(Astro.url);
	const q = Astro.url.searchParams.get("q");
	const searchType = Astro.url.searchParams.get("type");

	if (!q || !searchType) {
		return new Response(null, {
			status: 400,
			statusText: 'Missing q or searchType parameter'
		});
	}

	const spotifyToken = await Astro.locals.getSpotifyToken();
	if (!spotifyToken) {
		return new Response(null, {
			status: 403,
			statusText: 'Not logged in to Spotify'
		});
	}
	const accessToken = spotifyToken.accessToken;

	const spotifySearchUrl = new URL("https://api.spotify.com/v1/search");
	spotifySearchUrl.searchParams.set("q", q);
	spotifySearchUrl.searchParams.set("type", searchType);
	spotifySearchUrl.searchParams.set("market", "AU");


	const spotifySearchResponse = await fetch(spotifySearchUrl.toString(), {
		headers: {
			Authorization: `Bearer ${accessToken}`
		}
	})

	if (!spotifySearchResponse.ok) {
		console.log({ status: spotifySearchResponse.status, statusText: spotifySearchResponse.statusText });
		const responseText = await spotifySearchResponse.text();
		return new Response(responseText, {
			status: spotifySearchResponse.status,
			statusText: spotifySearchResponse.statusText
		});
	}

	const spotifySearchData = await spotifySearchResponse.json();

	const searchTypePlural = searchType + "s";

	const firstSearchResult = spotifySearchData[searchTypePlural].items[0];

	if (!firstSearchResult) {
		return new Response(null, {
			status: 404,
			statusText: 'No results found'
		});
	}

	console.log(JSON.stringify(firstSearchResult, null, 2));

	function getTitleFromSearchResult(searchResult) {
		if (searchType === "album") {
			const artistString = searchResult.artists.map(artist => artist.name).join(", ");
			return `${artistString} - ${searchResult.name}`;
		} else if (searchType === "track") {
			const artistString = searchResult.artists.map(artist => artist.name).join(", ");
			return `${artistString} - ${searchResult.name}`;
		} else if (searchType === "artist") {
			return `Artist: ${searchResult.name}`;
		}
	}


	const spotifyUrl = firstSearchResult.external_urls.spotify;
	const title = getTitleFromSearchResult(firstSearchResult);

	return new Response(
		JSON.stringify({ title, url: spotifyUrl }), {
		headers: {
			"Content-Type": "application/json"
		}
	})
}
