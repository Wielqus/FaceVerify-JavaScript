const path = require("path");

module.exports = {
  entry: "./lib/index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "index.js",
    library: "FaceVerify",
  },
  module: {
    rules: [
      {
        test: /\.(weights)$/i,
        use: [
          {
            loader: "file-loader",
          },
        ],
      },
    ],
  },
};
