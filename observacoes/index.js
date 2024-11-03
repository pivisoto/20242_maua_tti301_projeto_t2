const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express();
app.use(bodyParser.json());
const observacoesPorLembreteId = {};
const { v4: uuidv4 } = require('uuid');


app.post("/eventos", (req, res) => {
  try {
    funcoes[req.body.tipo](req.body.dados);
  } catch (err) {
    res.status(200).send({ msg: "ok" });
  }
});


app.put('/lembretes/:id/observacoes', async (req, res) => {
  const idObs = uuidv4();
  const { texto } = req.body;
  const observacoesDoLembrete = observacoesPorLembreteId[req.params.id] || [];
  
  observacoesDoLembrete.push({ id: idObs, texto, status: 'aguardando' });
  observacoesPorLembreteId[req.params.id] = observacoesDoLembrete;
  
  const evento = {
    tipo: "ObservacaoCriada",
    dados: { id: idObs, texto, lembreteId: req.params.id, status: 'aguardando' },
  };

  try {
    await axios.post('http://host.docker.internal:10000/eventos', evento);
  } catch (error) {
    console.warn("Erro ao conectar com host.docker.internal, tentando localhost");
    try {
      await axios.post('http://localhost:10000/eventos', evento);
    } catch (err) {
      console.error("Erro ao conectar com localhost:", err.message);
    }
  }
  res.status(201).send(observacoesDoLembrete);
});


const funcoes = {
  ObservacaoClassificada: async (observacao) => {
    const observacoes = observacoesPorLembreteId[observacao.lembreteId];
    const obsParaAtualizar = observacoes.find(o => o.id === observacao.id);
    obsParaAtualizar.status = observacao.status;

    const evento = {
      tipo: "ObservacaoAtualizada",
      dados: {
        id: observacao.id,
        texto: observacao.texto,
        lembreteId: observacao.lembreteId,
        status: observacao.status,
      },
    };

    try {
      await axios.post('http://host.docker.internal:10000/eventos', evento);
    } catch (error) {
      console.warn("Erro ao conectar com host.docker.internal, tentando localhost");
      try {
        await axios.post('http://localhost:10000/eventos', evento);
      } catch (err) {
        console.error("Erro ao conectar com localhost:", err.message);
      }
    }
  },
};


app.get('/lembretes/:id/observacoes', (req, res) => {
  res.send(observacoesPorLembreteId[req.params.id] || []);
});

app.listen(5000, () => {
  console.log('Observacoes. Porta 5000');
});
