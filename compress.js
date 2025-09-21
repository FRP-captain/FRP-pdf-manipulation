



const pdfInput = document.getElementById("pdfInput");
const previewContainer = document.getElementById("previewContainer");
const message = document.getElementById("message");
const compressBtn = document.getElementById("compressBtn");
const compressBtn1 = document.getElementById("compressBtn1");
const compressBtn2 = document.getElementById("compressBtn2");
const downloadLink = document.getElementById("downloadLink");
const statusBox = document.getElementById("status");

function dataURLToArrayBuffer(dataURL) {
  const base64 = dataURL.split(',')[1];
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}



pdfInput.addEventListener("change", async () => {
  previewContainer.innerHTML = ""; // Clear old previews

  const files = pdfInput.files;
  for (let file of files) {
    const arrayBuffer = await file.arrayBuffer();

    // Load PDF with pdf.js
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const page = await pdf.getPage(1); // first page

    const viewport = page.getViewport({ scale: 0.3 }); // scale down for thumbnail
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({ canvasContext: context, viewport: viewport }).promise;

    // Add canvas to preview container
    previewContainer.appendChild(canvas);
  }
});
compressBtn.addEventListener("click", async () => {
  const file = pdfInput.files[0];
  if (!file) {
    message.textContent = "Please select a PDF file first!";
    return;
  }

  try {
    // Read PDF into ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    // Load PDF into pdf-lib
    const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);

    // Save PDF with compression options
    const compressedPdfBytes = await pdfDoc.save({
      useObjectStreams: true,        //compresses PDF object into streams
      addDefaultPage: false,         //Doesn't add unnecessary default pages 
      objectStreamThreshold: 1,      //Aggresive object stream compression
      updateFileIdAppearances: false //skips form field appearance updates
    });  
     // Create Blob and URL for download
    const blob = new Blob([compressedPdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    downloadLink.href = url;
    downloadLink.download = "compressed.pdf";
    downloadLink.style.display = "inline";
    downloadLink.textContent = "Download Compressed PDF";

    statusBox.textContent = "Compression finished!";
  } catch (e) {
    console.error(e);
    statusBox.textContent = "Compression failed: " + e.message;
  }

})

// second option

compressBtn1.addEventListener("click", async () => {
  const file = pdfInput.files[0];
  if (!file) return alert("Select a PDF first");

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const newPdfDoc = await PDFLib.PDFDocument.create();

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 1 }); // adjust scale for resolution
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const context = canvas.getContext("2d");
    await page.render({ canvasContext: context, viewport }).promise;

    // Convert canvas to JPEG (compressed)
    const jpegDataUrl = canvas.toDataURL("image/jpeg", 0.95); // quality 0.6
    const jpegBytes = await fetch(jpegDataUrl).then(res => res.arrayBuffer());
    const img = await newPdfDoc.embedJpg(jpegBytes);

    const newPage = newPdfDoc.addPage([viewport.width, viewport.height]);
    newPage.drawImage(img, { x: 0, y: 0, width: viewport.width, height: viewport.height });
  }

  const compressedPdfBytes = await newPdfDoc.save();
  const blob = new Blob([compressedPdfBytes], { type: "application/pdf" });
  downloadLink.href = URL.createObjectURL(blob);
  downloadLink.download = "compressed.pdf";
  downloadLink.style.display = "inline";
  downloadLink.textContent = "Download Compressed PDF";
});


// third option

compressBtn2.addEventListener("click", async () => {
  const file = pdfInput.files[0];
  if (!file) return alert("Select a PDF first");

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const newPdfDoc = await PDFLib.PDFDocument.create();

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale:0.5 }); // adjust scale for resolution
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const context = canvas.getContext("2d");
    await page.render({ canvasContext: context, viewport }).promise;

    // Convert canvas to JPEG (compressed)
    const jpegDataUrl = canvas.toDataURL("image/jpeg",  0.6); // quality 0.6
    const jpegBytes = await fetch(jpegDataUrl).then(res => res.arrayBuffer());
    const img = await newPdfDoc.embedJpg(jpegBytes);

    const newPage = newPdfDoc.addPage([viewport.width, viewport.height]);
    newPage.drawImage(img, { x: 0, y: 0, width: viewport.width, height: viewport.height });
  }

  const compressedPdfBytes = await newPdfDoc.save();
  const blob = new Blob([compressedPdfBytes], { type: "application/pdf" });
  downloadLink.href = URL.createObjectURL(blob);
  downloadLink.download = "compressed.pdf";
  downloadLink.style.display = "inline";
  downloadLink.textContent = "Download Compressed PDF";
});
document.getElementById("toolsBtn").addEventListener("click", function(e) {
    e.preventDefault();
    document.getElementById("toolsMenu").classList.toggle("show");
});

window.addEventListener("click", function(e) {
    if (!e.target.closest(".dropdown")) {
    document.getElementById("toolsMenu").classList.remove("show");
    }
});

