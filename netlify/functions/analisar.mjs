export async function handler(event) {
  try {
    const body = JSON.parse(event.body || "{}");

    const codigo = body.codigo || "";
    const pergunta = body.pergunta || "";

    const resposta = {
      titulo: "Análise do BotFix AI",
      erro: "Nenhum erro encontrado ainda.",
      explicacao: "Envie um código ou erro para análise.",
      comando: "Digite o comando sugerido pelo sistema.",
      codigo_corrigido: codigo
    };

    if (codigo.includes("undefined")) {
      resposta.titulo = "Erro encontrado";
      resposta.erro = "Variável undefined detectada";
      resposta.explicacao =
        "Uma variável está sendo usada antes de receber um valor.";
      resposta.comando =
        "Procure onde a variável foi criada e inicialize ela antes do uso.";
    }

    if (pergunta) {
      resposta.explicacao =
        "Análise solicitada: " + pergunta;
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(resposta)
    };

  } catch (erro) {

    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        titulo: "Erro no analisador",
        erro: erro.message,
        comando: "Verifique o código enviado."
      })
    };

  }
}
