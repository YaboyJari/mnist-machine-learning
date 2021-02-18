const fs = require('fs');
const path = require('path');
const csv = require('fast-csv');
const tf = require('@tensorflow/tfjs');

const ARRAY_X = 28;
const ARRAY_Y = 28;

const mapRowToTwoDimensionalArray = (row) => {
    const featureArray = [];

    const rowKeys = Object.keys(row);
    const rowValues = [];
    rowKeys.forEach(key => {
        rowValues.push(row[key]);
    });

    for (let y = 0; y < ARRAY_Y; y++) {
        splicedValues = rowValues.splice(0, ARRAY_X);
        featureArray.push(splicedValues);
    }

    return featureArray;
};

const getData = async (fileName) => {

    let promise = new Promise(function (resolve, reject) {
        const results = [];
        const labelArray = [];
        fs.createReadStream(path.resolve(__dirname, 'files', fileName))
            .pipe(csv.parse({
                headers: true,
            }))
            .on('error', error => console.error(error))
            .on('data', row => {
                labelArray.push(row.label);
                delete row.label;
                mappedRow = mapRowToTwoDimensionalArray(row);
                results.push(mappedRow);
            })
            .on('end', rowCount => {
                console.log(`Parsed ${rowCount} rows`);
                resolve({'featureArray': results,
                         'labelArray': labelArray});
            });
    });

    return promise;
};

const normalizeDataSet = (ThreeDimensionalArray) => {
    return ThreeDimensionalArray.map(yArray =>
        yArray.map(xArray => xArray.map(xValue => 
            xValue = parseFloat((xValue / 255.0).toFixed(2)))))
};

const transferToTensorData = (features, labels) => {
    return tf.tidy(() => {
        features = tf.tensor(features);
        labels = tf.tensor(labels);
        return {
            'x_features': features,
            'y_labels': labels,
        }
    });
};

exports.getTensorData = async (filePath) => {
    const data = await getData(filePath);
    let features = data.featureArray;
    let labels = new Float32Array(data.labelArray);
    features = normalizeDataSet(features);
    return transferToTensorData(features, labels);
};