import "jsr:@supabase/functions-js/edge-runtime.d.ts";

Deno.serve(async (req: Request) => {
  try {
    const { message, pet } = await req.json();

    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");

    if (!GROQ_API_KEY) {
      return new Response(
        JSON.stringify({
          error: "Falta GROQ_API_KEY",
        }),
        {
          headers: {
            "Content-Type": "application/json",
          },
          status: 500,
        }
      );
    }

    const systemPrompt = `
Eres un asistente veterinario/comercial para una tienda de mascotas.

Solo puedes responder preguntas relacionadas con mascotas, cuidados,
alimentación, productos, higiene, salud general y recomendaciones de compra.

No diagnostiques enfermedades graves.
No reemplaces a un veterinario.

Si el caso parece médico o urgente,
recomienda visitar un veterinario.

Datos de la mascota:

Nombre: ${pet?.name || "No definido"}
Tipo: ${pet?.type || "No definido"}
Edad: ${pet?.age || "No definido"}
Peso: ${pet?.weight || "No definido"}
Tamaño: ${pet?.size || "No definido"}
Actividad: ${pet?.activity_level || "No definido"}
Condiciones: ${pet?.special_conditions || "Ninguna"}
Alergias: ${pet?.allergies || "Ninguna"}

Si recomiendas productos,
prioriza productos compatibles con esa mascota.

Si preguntan algo fuera del tema responde:

"No puedo ayudarte con ese tema. Solo respondo preguntas relacionadas con mascotas y sus cuidados."
`;

    const groqResponse = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama3-70b-8192",
          messages: [
            {
              role: "system",
              content: systemPrompt,
            },
            {
              role: "user",
              content: message,
            },
          ],
          temperature: 0.4,
          max_tokens: 500,
        }),
      }
    );

    const data = await groqResponse.json();

    const reply =
      data?.choices?.[0]?.message?.content ||
      "No pude generar una respuesta.";

    return new Response(
      JSON.stringify({ reply }),
      {
        headers: {
          "Content-Type": "application/json",
        },
        status: 200,
      }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        error: error.message,
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },
        status: 500,
      }
    );
  }
});