export default {
  async fetch(request, env) {
    const apiKey = "GANTI_KODE_AIZA_DISINI"; 

    const url = new URL(request.url);
    const userPrompt = url.searchParams.get("tanya");
    let modelName = url.searchParams.get("model");
    
    if (!modelName) {
      modelName = "gemini-1.5-flash"; 
    }

    if (!userPrompt) {
      const html = `
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Gemini Multi-Model</title>
        <style>body{font-family:sans-serif;padding:20px;} input,select,button{width:100%;padding:10px;margin-top:10px;}</style>
      </head>
      <body>
        <h3>Panel Kontrol Model</h3>
        <p>Model saat ini: <b>${modelName}</b></p>
        <form method="GET">
          <label>Ganti Model (Ketik Manual):</label>
          <input type="text" name="model" value="${modelName}" placeholder="contoh: gemini-1.5-pro">
          
          <label>Pertanyaan:</label>
          <input type="text" name="tanya" placeholder="Halo..." required>
          <button type="submit">Kirim</button>
        </form>
      </body>
      </html>`;
      return new Response(html, { headers: { "content-type": "text/html" } });
    }

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

      if (data.error) {
        return new Response(
          "GAGAL MENGHUBUNGI MODEL: " + modelName + "\n\n" +
          "PESAN GOOGLE: " + data.error.message, 
          { headers: { "content-type": "text/plain" } }
        );
      }

      if (data.candidates) {
        const info = "[Dijawab oleh model: " + modelName + "]\n------------------\n";
        return new Response(info + data.candidates[0].content.parts[0].text, {
          headers: { "content-type": "text/plain" }
        });
      } else {
        return new Response("Tidak ada jawaban.", { headers: { "content-type": "text/plain" } });
      }

    } catch (e) {
      return new Response("Error Sistem: " + e.message, { status: 500 });
    }
  }
};
