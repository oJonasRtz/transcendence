import axios from 'axios';

const LANGS_TO_TEST = ["pt", "en", "es", "fr", "it", "de"];

export async function checkNameSecurity(name) {
     if (typeof name !== "string" || !name || !name.trim())
	 return ({ nsfw: false, data: null, error: "EMPTY_USERNAME" });
     for (const langCode of LANGS_TO_TEST) {
	try {
		console.log("langCode testing:", langCode);
		const params = new URLSearchParams({
			text: name,
			lang: langCode,
			mode: "ml",
			api_user: process.env.SIGHTENGINE_USER,
			api_secret: process.env.SIGHTENGINE_SECRET
		});

		const response = await axios.post(
			"http://api.sightengine.com/1.0/text/check.json",
			params,
			{ headers: { "Content-Type" : "application/x-www-form-urlencoded" } }
		);

		const result = response.data;
		const classes = result.moderation_classes || {};

		const nsfw = (classes.sexual || 0) > 0.3 ||
			     (classes.discriminatory || 0) > 0.3 ||
			     (classes.insulting || 0) > 0.3 ||
			     (classes.violent || 0) > 0.3 ||
			     (classes.toxic || 0) > 0.3;

		//console.log("Result CheckNameSecurity:", result);

		if (nsfw)
			return ({ nsfw, data: response.data });
	} catch (err) {
		console.error("Error da checkNameSecurity:", err);
		return ({ nsfw: false, data: null, error: err.message });
	}
    }
    return { nsfw: false, data: null };
}
