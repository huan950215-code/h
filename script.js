const fileInput = document.getElementById("file-input");
const dropzone = document.getElementById("dropzone");
const fileInfo = document.getElementById("file-info");
const scaleInput = document.getElementById("scale-input");
const scaleValue = document.getElementById("scale-value");
const smoothingToggle = document.getElementById("smoothing-toggle");
const processBtn = document.getElementById("process-btn");
const downloadBtn = document.getElementById("download-btn");
const statusText = document.getElementById("status-text");
const sourceCanvas = document.getElementById("source-canvas");
const resultCanvas = document.getElementById("result-canvas");
const sourceMeta = document.getElementById("source-meta");
const resultMeta = document.getElementById("result-meta");

const MAX_SIZE_MB = 20;
let sourceImage = null;

const withCtx = (canvas) => canvas.getContext("2d");

function updateScaleLabel() {
  scaleValue.textContent = `${Number(scaleInput.value).toFixed(1)}x`;
}

function setStatus(message) {
  statusText.textContent = message;
}

function resetResult() {
  resultCanvas.width = 0;
  resultCanvas.height = 0;
  resultMeta.textContent = "未生成";
  downloadBtn.disabled = true;
}

function renderSourcePreview(image) {
  const ctx = withCtx(sourceCanvas);
  sourceCanvas.width = image.naturalWidth;
  sourceCanvas.height = image.naturalHeight;
  ctx.clearRect(0, 0, sourceCanvas.width, sourceCanvas.height);
  ctx.drawImage(image, 0, 0);
  sourceMeta.textContent = `${image.naturalWidth} x ${image.naturalHeight}`;
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("图片读取失败"));
      img.src = reader.result;
    };
    reader.onerror = () => reject(new Error("文件读取失败"));
    reader.readAsDataURL(file);
  });
}

async function handleFiles(files) {
  const [file] = files;
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    setStatus("请选择图片文件");
    return;
  }

  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    setStatus(`文件过大，请选择不超过 ${MAX_SIZE_MB}MB 的图片`);
    return;
  }

  setStatus("加载图片中...");
  fileInfo.textContent = `${file.name} · ${(file.size / 1024 / 1024).toFixed(2)} MB`;
  resetResult();
  processBtn.disabled = true;

  try {
    sourceImage = await loadImage(file);
    renderSourcePreview(sourceImage);
    processBtn.disabled = false;
    setStatus("已加载，选择倍数后点击开始放大");
  } catch (error) {
    console.error(error);
    setStatus(error.message || "加载失败");
  }
}

async function upscale() {
  if (!sourceImage) return;
  const scale = Number(scaleInput.value);
  updateScaleLabel();
  setStatus("放大处理中...");
  processBtn.disabled = true;

  const width = Math.round(sourceImage.naturalWidth * scale);
  const height = Math.round(sourceImage.naturalHeight * scale);
  resultCanvas.width = width;
  resultCanvas.height = height;

  const ctx = withCtx(resultCanvas);
  ctx.imageSmoothingEnabled = smoothingToggle.checked;
  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(sourceImage, 0, 0, width, height);

  resultMeta.textContent = `${width} x ${height} (${scale.toFixed(1)}x)`;
  downloadBtn.disabled = false;
  processBtn.disabled = false;
  setStatus("放大完成，可下载结果");
}

function downloadImage() {
  const link = document.createElement("a");
  link.download = `upscale-${Date.now()}.png`;
  link.href = resultCanvas.toDataURL("image/png");
  link.click();
}

function setupDragAndDrop() {
  dropzone.addEventListener("click", () => fileInput.click());

  dropzone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropzone.classList.add("dragover");
  });

  dropzone.addEventListener("dragleave", () => {
    dropzone.classList.remove("dragover");
  });

  dropzone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropzone.classList.remove("dragover");
    handleFiles(e.dataTransfer.files);
  });
}

function setupEvents() {
  fileInput.addEventListener("change", (e) => handleFiles(e.target.files));
  scaleInput.addEventListener("input", () => {
    updateScaleLabel();
    resetResult();
  });
  smoothingToggle.addEventListener("change", () => {
    if (resultCanvas.width && resultCanvas.height) upscale();
  });
  processBtn.addEventListener("click", upscale);
  downloadBtn.addEventListener("click", downloadImage);
}

function init() {
  updateScaleLabel();
  setupDragAndDrop();
  setupEvents();
}

init();
