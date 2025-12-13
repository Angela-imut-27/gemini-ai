export default {
  async fetch(request, env) {
    // ==========================================
    // 1. ISI API KEY ANDA DI SINI
    // ==========================================
    const apiKey = "AIzaSyA4zrMJIno66WD08-1ted4H462u7jpJvAo"; 
    // ==========================================

    const url = new URL(request.url);
    const userPrompt = url.searchParams.get("tanya") || url.searchParams.get("text"); // Bisa pakai ?tanya= atau ?text=
    
    // Ambil model dari link, kalau tidak ada pakai Flash
    let modelName = url.searchParams.get("model");
    if (!modelName) {
      modelName = "gemini-1.5-flash"; 
    }

    // --- JIKA TIDAK ADA PERTANYAAN, TAMPILKAN PESAN JSON SEDERHANA ---
    if (!userPrompt) {
      const infoAwal = {
        status: true,
        message: "API Gemini Siap Digunakan",
        cara_pakai: "/?tanya=Halo&model=gemini-1.5-flash",
        author: "AngelaImut"
      };
      return new Response(JSON.stringify(infoAwal, null, 2), {
        headers: { "content-type": "application/json; charset=utf-8" }
      });
    }

    // --- PROSES KE GOOGLE ---
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

      // --- JIKA ERROR DARI GOOGLE ---
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

      // --- JIKA SUKSES (OUTPUT JSON SEPERTI CONTOH ANDA) ---
      if (data.candidates) {
        const textJawaban = data.candidates[0].content.parts[0].text;
        
        // Ini struktur JSON mirip punya ElrayyXml
        const finalJson = {
          status: true,
          author: "AngelaImut", // Bisa diganti nama Anda
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
