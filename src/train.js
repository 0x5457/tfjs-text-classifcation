import * as tf from "@tensorflow/tfjs";
import ui from "./ui";

const w2cndim = 100;
const epochs = 10;
const batchSize = 50;
const trainLen = 5000;

function createConvModel() {
  const model = tf.sequential();
  model.add(
    tf.layers.conv1d({
      inputShape: [1, w2cndim],
      kernelSize: 1,
      filters: 32,
      activation: "relu"
    })
  );
  model.add(tf.layers.dense({ units: 32, activation: "relu" }));
  model.add(tf.layers.dense({ units: 16, activation: "relu" }));
  model.add(tf.layers.dense({ units: 1, activation: "sigmoid" }));
  model.summary();

  model.compile({
    optimizer: tf.train.adam(1e-4),
    loss: "binaryCrossentropy",
    metrics: ["accuracy"]
  });

  return model;
}

function getSentenceVector(sentence, w2vModel) {
  let sentenceVector = tf.zeros([w2cndim]);
  let len = 0;

  for (let i = 0; i < sentence.length; i++) {
    if (sentence[i] === " ") {
      continue;
    }
    const vec = w2vModel[sentence[i]];
    if (!vec) {
      continue;
    }
    sentenceVector = tf.add(sentenceVector, vec);
    len++;
  }
  return tf.div(sentenceVector, len);
}

(async () => {
  ui.logStatus("fetch word2vec model...");
  const w2vModelText = await fetch("./model/w2v_model.txt").then(res =>
    res.text()
  );
  const w2vModel = {};

  w2vModelText.split("\n").forEach(item => {
    const temp = item.split(" ");
    if (temp.length === w2cndim + 1) {
      return (w2vModel[temp[0]] = tf
        .tensor1d(temp.slice(1).map(item => Number(item)))
        .asType("float32"));
    }
  });

  const trainDataset = tf.data.csv("./data/train.txt");

  const model = createConvModel();

  const flattenedDataset = trainDataset
    .map(({ _, text, y }) => {
      return [
        getSentenceVector(text, w2vModel).as2D(1, w2cndim),
        tf.tensor2d([[y]])
      ];
    })
    .batch(batchSize);

  ui.logStatus("Training model...");
  let trainBatchCount = 0;

  await model.fitDataset(flattenedDataset, {
    epochs,
    callbacks: {
      onBatchEnd: async (_, logs) => {
        trainBatchCount++;
        ui.logStatus(
          `Training... ${trainBatchCount}/${(trainLen / batchSize) * epochs}`
        );
        ui.plotLoss(trainBatchCount, logs.loss, "train");
        ui.plotAccuracy(trainBatchCount, logs.acc, "train");
        await tf.nextFrame();
      },
      onEpochEnd: async (epoch, logs) => {
        ui.plotLoss(trainBatchCount, logs.loss, "validation");
        ui.plotAccuracy(trainBatchCount, logs.acc, "validation");
        await tf.nextFrame();
      }
    }
  });
  ui.showDistinguish();
  const input = document.getElementById("input");
  window.distinguish = () => {
    const res = model
      .predict(getSentenceVector(input.value, w2vModel).as3D(1, 1, w2cndim))
      .as1D()
      .dataSync()[0];
    ui.showAnswer(res > 0.5 ? "文言文" : "白话文");
  };
})();
