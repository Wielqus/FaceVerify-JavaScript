import { nets, detectSingleFace } from "face-api.js";

const fps = 30;
const timeout = 3600 / fps;
const modelsPath = "https://wielqus.github.io/FaceVerify-site/models/";

export class FaceVerify {
  static init(container, callback) {
    const faceVerify = new FaceVerify();
    faceVerify.container = container;
    faceVerify.createHtml();
    faceVerify.callback = callback;

    return faceVerify;
  }

  createHtml() {
    const canvas = document.createElement("canvas");
    const positionInfo = this.container.getBoundingClientRect();
    const videoContainer = document.createElement("div");
    videoContainer.style.position = "relative";
    videoContainer.width = positionInfo.width;

    const video = document.createElement("video");
    video.width = positionInfo.width;
    canvas.style.display = "none";

    const landmark = document.createElement("div");
    landmark.style.borderColor = "green";
    landmark.style.borderWidth = "5px";
    landmark.style.borderStyle = "solid";
    landmark.style.position = "absolute";
    landmark.style.top = "0px";
    landmark.style.left = "0px";
    landmark.style.display = "none";

    this.container.append(canvas);
    videoContainer.append(video);
    videoContainer.append(landmark);
    this.container.append(videoContainer);

    this.canvas = canvas;
    this.video = video;
    this.videoContainer = videoContainer;
    this.landmark = landmark;
    this.initCamera();
  }

  async initCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
    this.stream = stream;
    this.video.srcObject = stream;
    this.video.autoplay = true;
    this.loadModels();
  }

  async loadModels() {
    await nets.ssdMobilenetv1.loadFromUri(modelsPath);
    await nets.faceExpressionNet.loadFromUri(modelsPath);
    setTimeout(() => {
      this.detectFace();
    }, 1000);
  }

  async detectFace() {
    this.canvas.width = this.video.videoWidth;
    this.canvas.height = this.video.videoHeight;
    const context = this.canvas.getContext("2d");
    context.drawImage(
      this.video,
      0,
      0,
      this.video.videoWidth,
      this.video.videoHeight,
    );
    const result = await detectSingleFace(this.canvas).withFaceExpressions();

    if (!result) {
      this.landmark.style.display = "none";
      setTimeout(() => {
        return this.detectFace();
      }, timeout);
      return;
    }

    /*
    this.landmark.style.borderColor = this.getColorForPercentage((result.detection.score + result.expressions.happy ) / 2)
    
    this.landmark.style.display = "block"
    this.landmark.style.width = `${result.detection.box.width}px`;
    this.landmark.style.height = `${result.detection.box.height}px`;
    this.landmark.style.top = `${result.detection.box.top}px`;
    this.landmark.style.left = `${result.detection.box.left}px`;
    */
    if (result.detection.score > 0.95 && result.expressions.happy > 0.5) {
      this.callback(this.canvas.toDataURL());
    } else {
      setTimeout(() => {
        return this.detectFace();
      }, timeout);
    }
  }

  getColorForPercentage(pct) {
    const percentColors = [
      { pct: 0.0, color: { r: 0xff, g: 0x00, b: 0 } },
      { pct: 0.5, color: { r: 0xff, g: 0xff, b: 0 } },
      { pct: 1.0, color: { r: 0x00, g: 0xff, b: 0 } },
    ];

    for (var i = 1; i < percentColors.length - 1; i++) {
      if (pct < percentColors[i].pct) {
        break;
      }
    }
    var lower = percentColors[i - 1];
    var upper = percentColors[i];
    var range = upper.pct - lower.pct;
    var rangePct = (pct - lower.pct) / range;
    var pctLower = 1 - rangePct;
    var pctUpper = rangePct;
    var color = {
      r: Math.floor(lower.color.r * pctLower + upper.color.r * pctUpper),
      g: Math.floor(lower.color.g * pctLower + upper.color.g * pctUpper),
      b: Math.floor(lower.color.b * pctLower + upper.color.b * pctUpper),
    };
    return "rgb(" + [color.r, color.g, color.b].join(",") + ")";
  }
}
