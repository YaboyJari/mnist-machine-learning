const tf = require('@tensorflow/tfjs');
const mnist = require('./mnist');

let myModel;
const learningRate = 0.003;
const epochs = 50;
const batchSize = 4000;
const validationSplit = 0.2;

const createModel = (learningRate) => {
    const model = tf.sequential();
    model.add(tf.layers.dense({
        inputShape: [28, 28],
        units: 32,
        useBias: true,
    }));
    model.add(tf.layers.flatten());
    model.add(tf.layers.dense({
        units: 32,
        activation: 'relu',
    }));
    model.add(tf.layers.dropout({
        rate: 0.2,
    }));
    model.add(tf.layers.dense({
        units: 10,
        activation: 'softmax',
    }));
    model.compile({
        optimizer: tf.train.adam(learningRate),
        loss: 'sparseCategoricalCrossentropy',
        metrics: ['accuracy'],
    });

    return model
};

const trainModel = async (model, train_features, train_label, epochs, batchSize = null, validationSplit = 0.1) => {
    return await model.fit(train_features, train_label, {
        batchSize,
        epochs,
        shuffle: true,
        validationSplit,
      });
};

const castTensorToArray = (data) => {
    return Array.from(data.dataSync());
}

exports.startTraining = async () => {
    const data = await mnist.getTensorData('mnist_train.csv');

    myModel = createModel(learningRate);

    return await trainModel(myModel, data.x_features, data.y_labels, 
        epochs, batchSize, validationSplit);
};

exports.predictResult = async () => {
    const data = await mnist.getTensorData('mnist_test.csv');
    const testLabels = data.y_labels;
    const predictions = myModel.predict(data.x_features, {batchSize: batchSize}).argMax(-1);
    labelData = castTensorToArray(testLabels);
    predictionData = castTensorToArray(predictions);
    return [predictionData, labelData];
};