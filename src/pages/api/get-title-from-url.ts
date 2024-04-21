import { APIContext } from "astro";
import cheerio from "cheerio";

export async function GET(Astro: APIContext) {
	const url = Astro.url.searchParams.get("url");

	if (!url) {
		return new Response(null, {
			status: 400,
			statusText: 'Missing url parameter'
		});
	}

	const response = await fetch(url);
	const responseHtml = await response.text();

	const $ = cheerio.load(responseHtml);
	const title = $("title").first().text().trim();

	return new Response(
		JSON.stringify({ title }), {
		headers: {
			"Content-Type": "application/json"
		}
	})
}
