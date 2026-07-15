export async function handler(event) {

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({
        erro: "Método não permitido"
      })
    };
  }

  try {

    const { mensagem } = JSON.parse(event.body);


    const resposta = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "Authorization":
          `Bearer ${process.env.OPENAI_API_KEY}`
        },

        body: JSON.stringify({

          model: "gpt-4.1-mini",

          input: `
Você é o BotFix AI, um programador especialista.

Ajude usuários que criam bots, sites e códigos.

Analise o problema:

${mensagem}

Responda sempre em português brasileiro.

Formato obrigatório:

TÍTULO:
(nome do problema)

EXPLICAÇÃO:
(o que aconteceu)

CAUSA:
(por que aconteceu)

SOLUÇÃO:
(passos para corrigir)

CÓDIGO:
(se precisar, gere o código completo)

COMANDO:
(comando para executar no terminal)

Tenha cuidado:
- Não mande comandos perigosos sem explicar.
- Não apague arquivos sem confirmação.
`
        })
      }
    );


    const dados = await resposta.json();


    return {
      statusCode: 200,

      body: JSON.stringify({

        resposta:
        dados.output_text || "Sem resposta"

      })
    };


  } catch (erro) {

    return {

      statusCode:500,

      body:JSON.stringify({

        erro:"Erro interno da IA"

      })

    };

  }

}o obrigatório:

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
