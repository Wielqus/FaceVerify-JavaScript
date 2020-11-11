export default class FaceVerify{

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

    this.container.append(canvas)
    this.container.append(video)

    this.canvas = canvas
    this.video = video
    this.initCamera()
  }

  async initCamera(){
    const stream = await navigator.mediaDevices.getUserMedia({ video: {} })
    console.log(stream)
    this.video.srcObject = stream
    this.video.play()
  }
}