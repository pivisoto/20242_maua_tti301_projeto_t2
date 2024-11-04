const express = require('express');
const bodyParser = require('body-parser');
//para enviar eventos para os demais microsserviços
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

const eventos = []

async function enviarEvento(url, evento, servico) {
    porta = servico+'-clusterip-service'
    const fallbacks = [
        url.replace('host.docker.internal', 'localhost'),
        url.replace('host.docker.internal', porta),
    ];

    try {
        await axios.post(url, evento);
    } catch (error) {
        for (const fallbackUrl of fallbacks) {
            try {
                await axios.post(fallbackUrl, evento);
                console.log(`Evento enviado com sucesso para ${fallbackUrl}`);
                return; 
            } catch (err) {
            }
        }
        console.error('Todas as tentativas falharam.');
    }
}

  
app.post('/eventos', (req, res) => {
    const evento = req.body;
    eventos.push(evento);
    enviarEvento('http://host.docker.internal:4000/eventos',evento,'lembretes');
    enviarEvento('http://host.docker.internal:5000/eventos',evento,'observacoes');
    enviarEvento('http://host.docker.internal:6000/eventos',evento,'consulta');
    enviarEvento('http://host.docker.internal:7000/eventos',evento,'classificacao');
    enviarEvento('http://host.docker.internal:8000/eventos',evento,'logs');
    res.status(200).send({ msg: "ok" });
  });

app.listen(10000, () => {
console.log('Barramento de eventos. Porta 10000.')
})

app.get('/eventos', (req, res) => {
    res.send(eventos)
})