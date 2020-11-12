import {nets, detectSingleFace, fetchNetWeights, SsdMobilenetv1, SsdMobilenetv1Options, ssdMobilenetv1, net} from 'face-api.js';
import model from './models/ssd_mobilenetv1.weights'

const fps = 30;
const timeout = 3600/30;
const modelsPath = "/FaceVerify-JavaScript/dist/models/"

export class FaceVerify{

  static init(container, options){
    const faceVerify = new FaceVerify;
    faceVerify.container = container
    faceVerify.createHtml()

    return faceVerify
  }

  createHtml(){
    const canvas = document.createElement("canvas")
    canvas.width = this.container.clientWidth
    canvas.height = this.container.clientHeight
    canvas.style.display = "none";

    const videoContainer = document.createElement("div")
    videoContainer.style.position = "relative"
    videoContainer.width = this.container.clientWidth
    videoContainer.height = this.container.clientHeight

    const video = document.createElement("video")
    video.width = this.container.clientWidth
    video.height = this.container.clientHeight

    const landmark = document.createElement("div")
    landmark.style.borderColor = "green"
    landmark.style.borderWidth = "5px";
    landmark.style.borderStyle = "solid"
    landmark.style.position = "absolute"
    landmark.style.top = "0px"
    landmark.style.left = "0px"
    
    

    this.container.append(canvas)
    videoContainer.append(video)
    videoContainer.append(landmark)
    this.container.append(videoContainer)

    this.canvas = canvas
    this.video = video
    this.videoContainer = videoContainer
    this.landmark = landmark
    this.initCamera()
  }

  async initCamera(){
    const stream = await navigator.mediaDevices.getUserMedia({ video: {} })
    this.stream = stream
    this.video.srcObject = stream
    this.video.autoplay = true
    this.loadModels()
    
  }

  async loadModels(){
    await nets.ssdMobilenetv1.loadFromUri(modelsPath)
    this.detectFace()
  }

  async detectFace(){
    const context = this.canvas.getContext('2d');
    context.drawImage(this.video,  0 , 0, this.video.width, this.video.height);
    const result = await detectSingleFace(this.canvas)
    if(!result){
      setTimeout(() => this.detectFace(), timeout)
      return;
    }
    if(result.score < 0.9){
      this.landmark.style.borderColor = this.getColorForPercentage(0)
    }else{
      this.landmark.style.borderColor = this.getColorForPercentage((result.score - 0.9) * 10)
    }
    
    this.landmark.style.width = `${result.box.width}px`;
    this.landmark.style.height = `${result.box.height}px`;
    this.landmark.style.top = `${result.box.top}px`;
    this.landmark.style.left = `${result.box.left}px`;
    
    if(result.score > 0.99){
      this.videoContainer.style.display = "none";
      this.canvas.style.display = "block";
    }else{
      setTimeout(() => this.detectFace(), timeout)
    }
    
  }

  getColorForPercentage(pct) {
    const percentColors = [
      { pct: 0.0, color: { r: 0xff, g: 0x00, b: 0 } },
      { pct: 0.5, color: { r: 0xff, g: 0xff, b: 0 } },
      { pct: 1.0, color: { r: 0x00, g: 0xff, b: 0 } } 
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
        b: Math.floor(lower.color.b * pctLower + upper.color.b * pctUpper)
    };
    return 'rgb(' + [color.r, color.g, color.b].join(',') + ')';
};

}