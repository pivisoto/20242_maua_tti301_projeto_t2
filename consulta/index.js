const express = require("express");
const axios = require("axios");
const app = express();
app.use(express.json());

const baseConsulta = {};

const funcoes = {
  LembreteCriado: (lembrete) => {
    baseConsulta[lembrete.contador] = lembrete;
  },
  ObservacaoCriada: (observacao) => {
    const observacoes = baseConsulta[observacao.lembreteId]["observacoes"] || [];
    observacoes.push(observacao);
    baseConsulta[observacao.lembreteId]["observacoes"] = observacoes;
  },
  ObservacaoAtualizada: (observacao) => {
    const observacoes = baseConsulta[observacao.lembreteId]["observacoes"];
    const indice = observacoes.findIndex((o) => o.id === observacao.id); 
    observacoes[indice] = observacao;
  },
};

async function obterEventos() {
  let urls = [
    "http://host.docker.internal:10000/eventos",
    "http://localhost:10000/eventos",
    "http://barramento-de-eventos-service:10000/eventos"
  ];

  for (let url of urls) {
    try {
      const resp = await axios.get(url);
      return resp.data;
    } catch (error) {
    }
  }
  throw new Error("Todas as tentativas de obter eventos falharam.");
}


app.get("/lembretes", (req, res) => {
  res.status(200).send(baseConsulta);
});

app.post("/eventos", (req, res) => {
  try {
    funcoes[req.body.tipo](req.body.dados);
  } catch (err) {
    res.status(200).send({ msg: "ok" });
  }
});

app.listen(6000, async () => {
  console.log("Consultas. Porta 6000");

  const eventos = await obterEventos();

  eventos.forEach((evento) => {
    try {
      funcoes[evento.tipo](evento.dados);
    } catch (err) {
      console.error("Erro ao aplicar evento:", err.message);
    }
  });
});
