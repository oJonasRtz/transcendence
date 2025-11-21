import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';

export async function checkImageSafety(localPath) {
	try {
		const form = new FormData();
		form.append("media", fs.createReadStream(localPath));
		form.append("models", "nudity-2.1,wad,offensive,gore-2.0,violence,type");
		form.append("api_user", process.env.SIGHTENGINE_USER);
		form.append("api_secret", process.env.SIGHTENGINE_SECRET);

		const response = await axios.post("http://api.sightengine.com/1.0/check.json",form, {
			headers: form.getHeaders()
		});

		const data = response.data;

		const nsfw = data.nudity?.erotica > 0.2 ||
  			data.nudity?.sexual_activity > 0.02 ||
 			data.nudity?.sexual_display > 0.02 ||
			data.nudity?.very_suggestive > 0.4 ||
  			data.nudity?.suggestive > 0.5 ||
  			data.nudity?.mildly_suggestive > 0.6 ||
  			data.violence?.prob > 0.3 ||
  			data.weapon > 0.4 ||
  			data.alcohol > 0.3 ||
  			data.drugs > 0.3 ||
			data.gore?.prob > 0.3 ||
			data.gore?.classes?.very_bloody > 0.2 ||
  			data.gore?.classes?.serious_injury > 0.2 ||
  			data.gore?.classes?.corpse > 0.2 ||
  			data.gore?.classes?.skull > 0.2 ||
  			data.gore?.type?.animated > 0.5;

		//console.log("nsfw:", nsfw, "data:", data);
		//console.log("nsfw:", nsfw); // check if pass or not pass

		return { nsfw, details: data };
	} catch (err) {
		console.error("Sightengine API error:", err.message);
		return ( { nsfw: false, details: { error: err.message } });
	}
}
