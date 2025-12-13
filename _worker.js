export default {
	async fetch(request, env) {
		// ==========================================
		// 1. AMBIL KUNCI DARI BRANKAS CLOUDFLARE (AMAN)
		// ==========================================
		// Jangan tulis AIza... di sini lagi.
		// Kita suruh kode mengambil dari settingan 'API_KEY' yang sudah Anda simpan.
		const apiKey = env.API_KEY;
		// ==========================================

		const url = new URL(request.url);
		const userPrompt = url.searchParams.get("tanya") || url.searchParams.get("text");

		// Ambil model dari link, kalau tidak ada pakai Flash
		let modelName = url.searchParams.get("model");
		if (!modelName) {
				modelName = "gemma-3-4b-it";
				}

			//
			if (!userPrompt) {
					const infoAwal = {
						status: true,
						message: "API Gemini Siap Digunakan",
						cara_pakai: "/?tanya=Halo&model=gemma-3-4b-it",
						author: "AngelaImut"
						};
					return new Response(JSON.stringify(infoAwal, null, 2), {
							headers: { "content-type": "application/json; charset=utf-8" }
							});
					}

				//
				try {
					const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

					const response = await fetch(apiUrl, {
							method: "POST",
							headers: { "Content-Type": "application/json" },
							body: JSON.stringify({
									contents: [{ parts: [{ text: userPrompt }] }]
									})
							});

					const data = await response.json();

					//
					if (data.error) {
							const errorJson = {
								status: false,
								author: "AngelaImut",
								error_message: data.error.message,
								model_used: modelName
								};
							return new Response(JSON.stringify(errorJson, null, 2), {
									headers: { "content-type": "application/json; charset=utf-8" }
									});
							}

						//
						if (data.candidates) {
								const textJawaban = data.candidates[0].content.parts[0].text;

								const finalJson = {
									status: true,
									author: "AngelaImut",
									model: modelName,
									result: textJawaban
									};

								return new Response(JSON.stringify(finalJson, null, 2), {
										headers: { "content-type": "application/json; charset=utf-8" }
										});

								} else {
								return new Response(JSON.stringify({ status: false, message: "No response" }), {
										headers: { "content-type": "application/json" }
										});
								}

							} catch (e) {
							return new Response(JSON.stringify({ status: false, error: e.message }), {
									headers: { "content-type": "application/json" }, status: 500
									});
							}
						}
					};