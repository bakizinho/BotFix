export default async function (req) {
  const headers = {
    "Content-Type": "application/json"
  };

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({
        erro: "Método não permitido"
      }),
      {
        status: 405,
        headers
      }
    );
  }

  try {
    const corpo = await req.json();
    const erroUsuario = corpo.erro;

    if (
      !erroUsuario ||
      !String(erroUsuario).trim()
    ) {
      return new Response(
        JSON.stringify({
          erro: "Envie um erro para análise."
        }),
        {
          status: 400,
          headers
        }
      );
    }

    const chave = process.env.OPENAI_API_KEY;

    if (!chave) {
      return new Response(
        JSON.stringify({
          erro: "Chave da IA não configurada."
        }),
        {
          status: 500,
          headers
        }
      );
    }

    const resposta = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${chave}`
        },
        body: JSON.stringify({
          model: "gpt-4.1-mini",
          input: `
Você é a inteligência artificial do aplicativo BotFix.

Sua função é analisar erros de programação,
JavaScript, Node.js, JSON, Python, Termux
e bots de WhatsApp.

Explique tudo em português brasileiro simples.

ERRO DO USUÁRIO:

${erroUsuario}

Responda SOMENTE com JSON válido.

Formato obrigatório:

{
  "titulo": "nome simples do erro",
  "explicacao": "explique o que aconteceu",
  "causa": "explique a causa provável",
  "solucao": "explique como corrigir",
  "comando": "comando recomendado ou Nenhum comando recomendado",
  "risco": false
}

Se o comando apagar arquivos, pastas ou dados,
use risco true.
`
        })
      }
    );

    const dados = await resposta.json();

    if (!resposta.ok) {
      console.error(
        "Erro OpenAI:",
        JSON.stringify(dados)
      );

      return new Response(
        JSON.stringify({
          erro: "A IA não conseguiu analisar o erro."
        }),
        {
          status: 500,
          headers
        }
      );
    }

    let texto = "";

    for (const item of dados.output || []) {
      for (const conteudo of item.content || []) {
        if (
          conteudo.type === "output_text" &&
          conteudo.text
        ) {
          texto += conteudo.text;
        }
      }
    }

    texto = texto
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    const analise = JSON.parse(texto);

    return new Response(
      JSON.stringify(analise),
      {
        status: 200,
        headers
      }
    );

  } catch (erro) {
    console.error("Erro BotFix:", erro);

    return new Response(
      JSON.stringify({
        erro: "Erro interno do BotFix."
      }),
      {
        status: 500,
        headers
      }
    );
  }
}
