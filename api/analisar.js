export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      erro: "Método não permitido"
    });
  }

  try {
    const { erro } = req.body;

    if (!erro || !erro.trim()) {
      return res.status(400).json({
        erro: "Envie um erro para análise."
      });
    }

    const resposta = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-4.1-mini",
          input: `
Você é o cérebro do aplicativo BotFix.

Analise erros de programação, Node.js, JavaScript,
JSON, Python, Termux e bots de WhatsApp.

Explique em português brasileiro simples.

Erro enviado pelo usuário:

${erro}

Responda SOMENTE em JSON válido neste formato:

{
  "titulo": "nome simples do erro",
  "explicacao": "o que aconteceu",
  "causa": "causa provável",
  "solucao": "como corrigir passo a passo",
  "comando": "comando recomendado ou Nenhum comando recomendado",
  "risco": false
}

Se o comando puder apagar arquivos, pastas ou dados,
defina risco como true.
`
        })
      }
    );

    const dados = await resposta.json();

    if (!resposta.ok) {
      console.error(dados);

      return res.status(500).json({
        erro: "A IA não conseguiu analisar o erro."
      });
    }

    const texto = dados.output_text;

    const analise = JSON.parse(texto);

    return res.status(200).json(analise);

  } catch (erro) {
    console.error(erro);

    return res.status(500).json({
      erro: "Erro interno do BotFix."
    });
  }
}
