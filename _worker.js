export default {
  async fetch(request, env) {
    // ==========================================
    // 1. ISI API KEY (UTUH)
    // ==========================================
    // Karena repo Private, aman tulis langsung di sini.
    const apiKey = "AIzaSyA4zrMJIno66WD08-1ted4H462u7jpJvAo"; 
    // ==========================================

    const url = new URL(request.url);
    
    // ==========================================
    // 2. PARAMETER LENGKAP (q, question, text, prompt, tanya)
    // ==========================================
    const userPrompt = url.searchParams.get("tanya") || 
                       url.searchParams.get("text") || 
                       url.searchParams.get("question") || 
                       url.searchParams.get("prompt") || 
                       url.searchParams.get("q");
    
    // ==========================================
    // 3. DEFAULT MODEL: GEMMA
    // ==========================================
    let modelName = url.searchParams.get("model");
    
    // Jika link polos (tanpa model), otomatis pakai Gemma
    if (!modelName) {
      modelName = "gemma-3-4b-it"; 
    }

    // --- JIKA TIDAK ADA PERTANYAAN, TAMPILKAN INFO ---
    if (!userPrompt) {
      const infoAwal = {
        status: true,
        message: "API Siap Digunakan",
        tips: "Support parameter: ?q=, ?text=, ?question=",
        cara_pakai: "/?q=Halo",
        default_model: "gemma-3-4b-it",
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

      // --- JIKA SUKSES ---
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
