// script.js

/**
 * Maximum bytes for Version 40-H (binary mode) ≈ 1852 bytes.
 * If your text exceeds this, even version 40 cannot encode it.
 */
const MAX_BYTES_V40_H = 1852;

/**
 * Number of “quiet‐zone” modules (on each side) to leave blank.
 * QR spec recommends at least 4 modules of margin for reliable scanning.
 */
const QUIET_ZONE_MODULES = 4;

/**
 * Convert a JavaScript string (UTF-16) into a “byte‐string” where each
 * JS character has code = one UTF-8 byte. This is what qrcode-generator expects
 * when you call qr.addData(..., "Byte").
 */
function toUtf8ByteString(str) {
  const utf8 = new TextEncoder().encode(str);
  // Turn each byte (0–255) into a single JS character with that code:
  let byteString = "";
  for (let i = 0; i < utf8.length; i++) {
    byteString += String.fromCharCode(utf8[i]);
  }
  return byteString;
}

/**
 * Generate a QR code with:
 *  - “auto” version selection (1 to 40)
 *  - Error Correction Level H
 *  - 1080×1080 pixels
 *  - 4-module quiet-zone border
 *  - Optional center image
 *  - Custom fg/bg colors
 *  - Wrapped in a download link (click to download PNG)
 *  - FULL UTF-8 support (emojis, CJK, etc.)
 */
function generateAutoVersionQR({
  text,
  elementId = "qrcode",
  size = 1080,
  imageFile = null,
  backgroundColor = "#ffffff",
  foregroundColor = "#000000",
}) {
  // 1) Create a QR instance with version=0 (auto) and EC=H
  const qr = qrcode(0, "H");

  // 2) Convert text into a “byte‐string” (UTF-8)
  const utf8ByteString = toUtf8ByteString(text);
  qr.addData(utf8ByteString, "Byte");
  qr.make(); // pick the smallest version that fits

  // 3) Determine which version was actually chosen:
  //    moduleCount = 17 + 4 × versionNumber
  const moduleCount = qr.getModuleCount();
  const versionNumber = (moduleCount - 17) / 4;

  // 4) Prepare the container
  const container = document.getElementById(elementId);
  container.innerHTML = "";

  // 5) Create a 1080×1080 canvas and fill with background color
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = size;
  canvas.height = size;
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, size, size);

  // 6) Compute cellSize so that (moduleCount + 2×border) fits into size
  const totalModulesWithBorder = moduleCount + 2 * QUIET_ZONE_MODULES;
  const cellSize = size / totalModulesWithBorder;

  // 7) Draw each module, offset by QUIET_ZONE_MODULES
  for (let r = 0; r < moduleCount; r++) {
    for (let c = 0; c < moduleCount; c++) {
      ctx.fillStyle = qr.isDark(r, c) ? foregroundColor : backgroundColor;
      const x = (c + QUIET_ZONE_MODULES) * cellSize;
      const y = (r + QUIET_ZONE_MODULES) * cellSize;
      ctx.fillRect(x, y, cellSize, cellSize);
    }
  }

  // 8) If there’s an overlay image, draw it at the center of the QR area
  if (imageFile) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target.result;
      img.onload = () => {
        // The “QR area” (excluding border) is moduleCount * cellSize,
        // so we center within the full canvas, and it naturally sits
        // inside that quiet-zone border.
        const qrAreaSize = moduleCount * cellSize;
        const imgSize = qrAreaSize * 0.25; // 25% of QR area
        // To center the overlay on full canvas:
        const canvasCenter = size / 2;
        const x = canvasCenter - imgSize / 2;
        const y = canvasCenter - imgSize / 2;
        // Optional small background behind the image:
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(x - 5, y - 5, imgSize + 10, imgSize + 10);
        ctx.drawImage(img, x, y, imgSize, imgSize);

        wrapCanvasInDownload(container, canvas);
      };
    };
    reader.readAsDataURL(imageFile);
  } else {
    // 9) No image: immediately wrap canvas in download link
    wrapCanvasInDownload(container, canvas);
  }

  return versionNumber;
}

/**
 * Wraps a <canvas> in an <a download> so clicking it downloads the PNG.
 */
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

/**
 * Called when the user clicks “Generate QR”.
 * 1. Reads text, image, fg/bg colors
 * 2. Computes UTF-8 byte length
 * 3. If byteLength > MAX_BYTES_V40_H, show error and skip
 * 4. Otherwise call generateAutoVersionQR()
 * 5. Display version chosen + byte usage in #qrInfo
 */
function handleGenerate() {
  const text = document.getElementById("textInput").value;
  const imageFile = document.getElementById("imageInput").files[0];
  const fg = document.getElementById("fgColor").value;
  const bg = document.getElementById("bgColor").value;

  // Compute UTF-8 byte length accurately (for capacity check)
  const encoder = new TextEncoder();
  const byteLength = encoder.encode(text).length;

  const infoDiv = document.getElementById("qrInfo");
  // If text exceeds capacity of even version 40-H:
  if (byteLength > MAX_BYTES_V40_H) {
    infoDiv.textContent = `Error: ${byteLength} bytes (exceeds Version 40-H max of ${MAX_BYTES_V40_H} bytes!).`;
    infoDiv.style.color = "red";
    document.getElementById("qrcode").innerHTML = "";
    return;
  }

  // Otherwise generate and get back the version used:
  infoDiv.style.color = "black";
  const chosenVersion = generateAutoVersionQR({
    text: text,
    imageFile: imageFile,
    foregroundColor: fg,
    backgroundColor: bg,
    elementId: "qrcode",
    size: 1080,
  });

  // Show version + byte usage
  infoDiv.textContent = `Version ${chosenVersion} selected; Used ${byteLength} bytes / Max ${MAX_BYTES_V40_H} bytes`;
}
