const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express();
app.use(bodyParser.json());

const lembretes = {};
let contador = 0;

const funcoes = {
  LembreteCriado: (lembrete) => {
    lembretes[lembrete.contador] = lembrete;
  }
};


app.post("/eventos", (req, res) => {
  try {
    funcoes[req.body.tipo](req.body.dados);
  } catch (err) {
    res.status(200).send({ msg: "ok" });
  }
});


app.get('/lembretes', (req, res) => {
  res.send(lembretes);
});

app.put('/lembretes', async (req, res) => {
  contador++;
  const { texto } = req.body;
  lembretes[contador] = { contador, texto };

  const evento = {
    tipo: "LembreteCriado",
    dados: { contador, texto },
  };

  try {
    await axios.post("http://host.docker.internal:10000/eventos", evento);
  } catch (error) {
    console.warn("Erro ao conectar com host.docker.internal, tentando localhost");
    try {
      await axios.post("http://localhost:10000/eventos", evento);
    } catch (err) {
      console.error("Erro ao conectar com localhost:", err.message);
    }
  }

  res.status(201).send(lembretes[contador]);
});

app.listen(4000, () => {
  console.log('Lembretes. Porta 4000');
});
