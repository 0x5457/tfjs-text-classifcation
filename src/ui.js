import * as tfvis from "@tensorflow/tfjs-vis";

const statusElement = document.getElementById("status");
const messageElement = document.getElementById("message");
const lossLabelElement = document.getElementById("loss-label");
const accuracyLabelElement = document.getElementById("accuracy-label");
const distinguishWrapper = document.getElementById("distinguish-wrapper");
const resContainer = document.getElementById("res");
const lossValues = [[], []];
const accuracyValues = [[], []];

export default {
  logStatus(message) {
    statusElement.innerText = message;
  },
  trainingLog(message) {
    messageElement.innerText = `${message}\n`;
  },
  plotLoss(batch, loss, set) {
    const series = set === "train" ? 0 : 1;
    lossValues[series].push({ x: batch, y: loss });
    const lossContainer = document.getElementById("loss-canvas");
    tfvis.render.linechart(
      { values: lossValues, series: ["train", "validation"] },
      lossContainer,
      {
        xLabel: "Batch #",
        yLabel: "Loss",
        width: 400,
        height: 300
      }
    );
    lossLabelElement.innerText = `last loss: ${loss.toFixed(3)}`;
  },
  plotAccuracy(batch, accuracy, set) {
    const accuracyContainer = document.getElementById("accuracy-canvas");
    const series = set === "train" ? 0 : 1;
    accuracyValues[series].push({ x: batch, y: accuracy });
    tfvis.render.linechart(
      { values: accuracyValues, series: ["train", "validation"] },
      accuracyContainer,
      {
        xLabel: "Batch #",
        yLabel: "Loss",
        width: 400,
        height: 300
      }
    );
    accuracyLabelElement.innerText = `last accuracy: ${(accuracy * 100).toFixed(
      1
    )}%`;
  },
  showDistinguish() {
    distinguishWrapper.classList.remove("disabled");
  },
  showAnswer(answer) {
    resContainer.innerHTML = answer;
  }
};
