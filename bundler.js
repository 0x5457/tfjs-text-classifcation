const Bundler = require("parcel-bundler");
const path = require("path");
const fs = require("fs-extra");

// 入口文件路径
const file = path.join(__dirname, "./index.html");

const distPath = path.join(__dirname, "./dist");
const modelPath = path.join(__dirname, "model");
const modelDistPath = path.join(distPath, "model");
const dataPath = path.join(__dirname, "data");
const dataDistPath = path.join(distPath, "data");

// Bundler 选项
const options = {
  outFile: "index.html", // 输出文件的名称
  publicUrl: './'
};

// 使用提供的入口文件路径和选项初始化 bundler
const bundler = new Bundler(file, options);

bundler.on("bundled", bundler => {
  // copy model and train data
  if (!fs.existsSync(modelDistPath)) {
    fs.mkdirSync(modelDistPath);
    fs.copySync(modelPath, modelDistPath);
  }

  if (!fs.existsSync(dataDistPath)) {
    fs.mkdirSync(dataDistPath);
    fs.copySync(dataPath, dataDistPath);
  }
});

bundler.bundle();

if (process.env.NODE_ENV !== "production") {
  const app = require("express")();
  app.use(bundler.middleware());
  app.listen(1234);
  console.log("listion port: 1234");
}
