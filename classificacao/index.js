const express = require("express");
const axios = require("axios");
const app = express();
app.use(express.json());

const palavraChave = "importante";

async function enviarEvento(evento) {
  const urls = [
    "http://host.docker.internal:10000/eventos",
    "http://localhost:10000/eventos",
    "http://barramento-de-eventos-service:10000/eventos"
  ];

  for (let url of urls) {
    try {
      await axios.post(url, evento);
      console.log(`Evento enviado com sucesso para ${url}`);
      return;
    } catch (error) {
    }
  }
  throw new Error("Todas as tentativas de enviar o evento falharam.");
}


const funcoes = {
  ObservacaoCriada: (observacao) => {
    const regex = new RegExp(`\\b${palavraChave}\\b`, 'i');
    observacao.status = regex.test(observacao.texto) ? "importante" : "comum";
    console.log(observacao);
    enviarEvento({
      tipo: "ObservacaoClassificada",
      dados: observacao,
    });
  },
};


app.post("/eventos", (req, res) => {
  try {
    funcoes[req.body.tipo](req.body.dados);
  } catch (err) {}
    res.status(200).send({ msg: "ok" });
});

app.listen(7000, () => console.log("Classificação. Porta 7000"));
