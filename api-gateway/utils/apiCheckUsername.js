import axios from 'axios'; 

export async function checkNameSecurity(name) {
	try {
		if (!name || !name.trim() || typeof name !== "string")
			return ({ nsfw: false, data: null, error: "EMPTY_USERNAME" });
		const params = new URLSearchParams({
			text: name,
			lang: "en",
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

		return ({ nsfw, data: response.data });
	} catch (err) {
		console.error("Error da checkNameSecurity:", err);
		return ({ nsfw: false, data: null, error: err.message });
	}
}
