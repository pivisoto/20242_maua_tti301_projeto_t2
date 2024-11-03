const express = require("express");
const axios = require("axios");
const app = express();
app.use(express.json());

const palavraChave = "importante";

async function enviarEvento(url, evento) {
  try {
    await axios.post(url, evento);
  } catch (error) {
    if (url.includes('host.docker.internal')) {
      const fallbackUrl = url.replace('host.docker.internal', 'localhost');
      console.error(`Erro ao conectar com ${url}. Tentando com ${fallbackUrl}`);
      try {
        await axios.post(fallbackUrl, evento);
      } catch (err) {
        console.error(`Erro ao conectar com ${fallbackUrl}:`, err.message);
      }
    } else {
      console.error(`Erro ao conectar com ${url}:`, error.message);
    }
  }
}

const funcoes = {
  ObservacaoCriada: (observacao) => {
    observacao.status = 
      observacao.texto.includes(palavraChave) ? "importante" : "comum";
    enviarEvento("http://host.docker.internal:10000/eventos", {
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
