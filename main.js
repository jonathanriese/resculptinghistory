
// the link to your model locally or the link from Teachable Machines
const URL = "./tm-my-image-model/";
const flip = false;
const limit = 0;
const noEl = document.getElementById("no-container");
const yesEl = document.getElementById("yes-container");
const audioEl = document.getElementById("fanfare");
//-------------------------------------------------------
let model, webcam, labelContainer, maxPredictions;
let lastLabel = "none";

function swapDivs(label) {
  // console.log(label);
  const yesLabel = "Economy";
  const noLabel = "Other";
  // if(label == noLabel && currentLabel == yesLabel){
  //   if(lastTime - thisTime < limit ) return;
  // }

  if (lastLabel == label)
    return;

  if (label == noLabel) {
    // hide yes, show no
    noEl.classList.remove("hide");
    yesEl.classList.add("hide");

  } else if (label == yesLabel) {
    // hide no, show yes
    yesEl.classList.remove("hide");
    noEl.classList.add("hide");

    // audioEl.play();

  } else {
    // hide both
    noEl.classList.add("hide");
    yesEl.classList.add("hide");
  }

  lastLabel = label;
}

// Load the image model and setup the webcam
async function init() {
  const modelURL = URL + "model.json";
  const metadataURL = URL + "metadata.json";

  // load the model and metadata
  model = await tmImage.load(modelURL, metadataURL);
  maxPredictions = model.getTotalClasses();

  // convenience function to setup a webcam
  let webCamWidth = window.innerWidth;
  let webCamHeight = window.innerHeight;

  console.log("width: " + webCamWidth);
  console.log("height: " + webCamHeight);

  webcam = new tmImage.Webcam(webCamWidth, webCamHeight,
                              flip); // width, height, flip
  await webcam.setup(
      {facingMode : "environment"}); // request access to the webcam

  document.getElementById("webcam-container").appendChild(webcam.webcam);

  let wc = document.getElementsByTagName('video')[0];
  wc.setAttribute(
      "playsinline",
      true); // written with "setAttribute" bc. iOS buggs otherwise :-)
  wc.muted = "true"
  wc.id = "webcamVideo";

  // only now start the webcam --> **after video-object added to DOM and
  // attributes are set**
  await webcam.play();
  window.requestAnimationFrame(loop);

  // append elements to the DOM
}

async function loop() {
  webcam.update();
  await predict();
  window.requestAnimationFrame(loop);
}

// run the webcam image through the image model
async function predict() {
  // predict can take in an image, video or canvas html element
  const prediction = await model.predict(webcam.canvas);
  let highestProbability = 0;
  let bestLabel = "";

  for (let i = 0; i < maxPredictions; i++) {
    const classPrediction =
        prediction[i].className + ": " + prediction[i].probability.toFixed(2);
    // console.log(classPrediction);
    if (prediction[i].probability > highestProbability &&
        prediction[i].probability > limit) {
      bestLabel = prediction[i].className;
      highestProbability = prediction[i].probability;
    }
  }

  swapDivs(bestLabel);
}

init();
