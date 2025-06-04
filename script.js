const MAX_BYTES_V40_H = 1852;

const QUIET_ZONE_MODULES = 4;

function generateAutoVersionQR({
  text,
  elementId = "qrcode",
  size = 1080,
  imageFile = null,
  backgroundColor = "#ffffff",
  foregroundColor = "#000000",
}) {
  const qr = qrcode(0, "H");

  const utf8ByteString = unescape(encodeURIComponent(text));
  qr.addData(utf8ByteString, "Byte");
  qr.make();

  const moduleCount = qr.getModuleCount();
  const versionNumber = (moduleCount - 17) / 4;

  const container = document.getElementById(elementId);
  container.innerHTML = "";

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = size;
  canvas.height = size;
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, size, size);

  const totalModulesWithBorder = moduleCount + 2 * QUIET_ZONE_MODULES;
  const cellSize = size / totalModulesWithBorder;

  for (let r = 0; r < moduleCount; r++) {
    for (let c = 0; c < moduleCount; c++) {
      ctx.fillStyle = qr.isDark(r, c) ? foregroundColor : backgroundColor;
      const x = (c + QUIET_ZONE_MODULES) * cellSize;
      const y = (r + QUIET_ZONE_MODULES) * cellSize;
      ctx.fillRect(x, y, cellSize, cellSize);
    }
  }

  if (imageFile) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target.result;
      img.onload = () => {
        const qrAreaSize = moduleCount * cellSize;
        const imgSize = qrAreaSize * 0.25; // 25% of QR area
        const canvasCenter = size / 2;
        const x = canvasCenter - imgSize / 2;
        const y = canvasCenter - imgSize / 2;
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(x - 5, y - 5, imgSize + 10, imgSize + 10);
        ctx.drawImage(img, x, y, imgSize, imgSize);

        wrapCanvasInDownload(container, canvas);
      };
    };
    reader.readAsDataURL(imageFile);
  } else {
    wrapCanvasInDownload(container, canvas);
  }

  return versionNumber;
}

function wrapCanvasInDownload(container, canvas) {
  const dataURL = canvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.href = dataURL;
  link.download = "qr-code.png";
  link.title = "Click to download";
  link.appendChild(canvas);

  container.innerHTML = "";
  container.appendChild(link);
}

function handleGenerate() {
  const text = document.getElementById("textInput").value;
  const imageFile = document.getElementById("imageInput").files[0];
  const fg = document.getElementById("fgColor").value;
  const bg = document.getElementById("bgColor").value;

  const encoder = new TextEncoder();
  const byteLength = encoder.encode(text).length;

  const infoDiv = document.getElementById("qrInfo");
  if (byteLength > MAX_BYTES_V40_H) {
    infoDiv.textContent = `Error: ${byteLength} bytes (exceeds Version 40-H max of ${MAX_BYTES_V40_H} bytes!).`;
    infoDiv.style.color = "red";
    document.getElementById("qrcode").innerHTML = "";
    return;
  }

  infoDiv.style.color = "black";
  const chosenVersion = generateAutoVersionQR({
    text: text,
    imageFile: imageFile,
    foregroundColor: fg,
    backgroundColor: bg,
    elementId: "qrcode",
    size: 1080,
  });

  infoDiv.textContent = `Version ${chosenVersion} selected; Used ${byteLength} bytes / Max ${MAX_BYTES_V40_H} bytes`;
}
