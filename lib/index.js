import {nets, detectSingleFace, fetchNetWeights, SsdMobilenetv1, SsdMobilenetv1Options, ssdMobilenetv1, net} from 'face-api.js';
import model from './models/ssd_mobilenetv1.weights'

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

    const video = document.createElement("video")
    video.width = this.container.clientWidth
    video.height = this.container.clientHeight
    video.id = "face-verify-video"

    this.container.append(canvas)
    this.container.append(video)

    this.canvas = canvas
    this.video = video
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
    await nets.ssdMobilenetv1.loadFromUri('http://127.0.0.1:5500/FaceVerify-JavaScript/dist/models/')
    this.detectFace()
  }

  async detectFace(){
    const context = this.canvas.getContext('2d');
    context.drawImage(this.video,  0 , 0, this.canvas.width, this.canvas.height);
    const result = await detectSingleFace(this.canvas)
    if(!result){
      setTimeout(() => this.detectFace(), 1000)
      return;
    }

    if(result.score > 0.99){
      this.video.style.display = "none";
      this.canvas.style.display = "block";
    }else{
      setTimeout(() => this.detectFace(), 1000)
    }
    
  }

}