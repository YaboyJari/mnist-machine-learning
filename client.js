import io from 'socket.io-client';

const predictContainer = document.getElementById('predictContainer');
const predictButton = document.getElementById('predict-button');
const classNames = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];

const socket =
    io('http://localhost:3000',
       {reconnectionDelay: 300, reconnectionDelayMax: 300});

predictButton.onclick = () => {
      // Get a surface
  predictButton.disabled = true;
  socket.emit('predictSample');
};

// functions to handle socket events
socket.on('connect', () => {
    document.getElementById('waiting-msg').style.display = 'none';
    document.getElementById('trainingStatus').innerHTML = 'Training in Progress';
});

socket.on('trainingComplete', (hist) => {
  document.getElementById('trainingStatus').innerHTML = 'Training Complete';
  const surface = tfvis.visor().surface({ name: 'History', tab: 'Charts' });
  tfvis.show.history(surface, hist, ['loss', 'acc']);
  predictContainer.style.display = 'block';
});

socket.on('predictResult', async (result) => {
    let [preds, labels] = result;
    labels = tf.tensor1d(labels);
    preds = tf.tensor1d(preds);
    const surface = tfvis.visor().surface({ name: 'ClassAccuracy', tab: 'Charts' });
    const classAccuracy = await tfvis.metrics.perClassAccuracy(labels, preds);
    await tfvis.show.perClassAccuracy(surface, classAccuracy, classNames);
    labels.dispose();
});

socket.on('disconnect', () => {
  document.getElementById('trainingStatus').innerHTML = '';
  predictContainer.style.display = 'none';
  document.getElementById('waiting-msg').style.display = 'block';
});
