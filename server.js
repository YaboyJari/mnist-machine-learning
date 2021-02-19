require('@tensorflow/tfjs-node');

const http = require('http');
const socketio = require('socket.io');
const model = require('./model');

const PORT = 3000;

async function run() {
  const port = process.env.PORT || PORT;
  const server = http.createServer();
  const io = socketio(server);

  server.listen(port, () => {
    console.log(`Running socket on port: ${port}`);
  });

  io.on('connection', (socket) => {
    socket.on('predictSample', async () => {
      io.emit('predictResult', await model.predictResult());
    });
  });

  const hist = await model.startTraining()

  io.emit('trainingComplete', hist);
}

run();