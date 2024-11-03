const express = require('express');
const bodyParser = require('body-parser');
//para enviar eventos para os demais microsserviços
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

const eventos = []

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
          console.error('Utilizando localhost');
        }
      }
      }
}
  
  
app.post('/eventos', (req, res) => {
    const evento = req.body;
    eventos.push(evento);
    enviarEvento('http://host.docker.internal:4000/eventos', evento);
    enviarEvento('http://host.docker.internal:5000/eventos', evento);
    enviarEvento('http://host.docker.internal:6000/eventos', evento);
    enviarEvento('http://host.docker.internal:7000/eventos', evento);
    enviarEvento('http://host.docker.internal:8000/eventos', evento);
    res.status(200).send({ msg: "ok" });
  });

app.listen(10000, () => {
console.log('Barramento de eventos. Porta 10000.')
})

app.get('/eventos', (req, res) => {
    res.send(eventos)
})