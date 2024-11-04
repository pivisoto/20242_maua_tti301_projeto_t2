const express = require('express');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());

const logs = [];

const adicionarLog = (tipo) => {
  const dataHora = new Date().toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
  logs.push({
    id: uuidv4(),
    tipo_evento: tipo,
    data_hora: dataHora
  });
};

app.post('/eventos', (req, res) => {
  const { tipo } = req.body;
  adicionarLog(tipo);
  res.status(200).send({ msg: 'Log registrado com sucesso' });
});

app.get('/logs', (req, res) => {
  res.status(200).send(logs);
});

app.listen(8000, () => {
  console.log('Logs. Porta 8000');
});
