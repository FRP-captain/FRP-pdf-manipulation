

const { PDFDocument } = PDFLib;

/**Grabs the PDFDocument class from the global PDFLib object (created by the pdf-lib script tag).

This lets you call PDFDocument.create() and PDFDocument.load(...) without writing PDFLib.PDFDocument. */

const pdfInput = document.getElementById("pdfInput");
const convertBtn1 = document.getElementById("convertBtn1");
const message = document.getElementById("message");


/**Caches references to your <input type="file" id="pdfInput" multiple> and the “Merge PDF” <button id="convertBtn1">. */
convertBtn1.addEventListener("click", async () => {
    /**When the button is clicked, run this async function (so we can use await inside). */
  const files = pdfInput.files;
  /**Reads the FileList of user-selected PDFs from the file input. */
  if (files.length < 2) {
    message.textContent = "⚠️ Please select at least 2 pdfs first!";
    return;
  }
  message.textContent = "";

  // Creates a brand-new, empty PDF that will hold all merged pages.
  const mergedPdf = await PDFDocument.create();
  for (let file of files) {
  //Loop over each selected file in the order the browser reports them.
    const arrayBuffer = await file.arrayBuffer();
  //Read the file’s bytes into an ArrayBuffer (browser API). This is the raw binary of the PDF.
    const pdf = await PDFDocument.load(arrayBuffer);
  //Parse those bytes into a pdf-lib document you can manipulate (source PDF).
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
  /**Copy all pages from the source PDF into the merged PDF context.

pdf.getPageIndices() returns [0, 1, 2, ...] for every page; copyPages returns an array of page objects ready to insert. */
  
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  //Appends each copied page to the end of the merged PDF, preserving each page’s size.
  }

  // Save merged PDF
  const mergedPdfBytes = await mergedPdf.save();
  //Serializes the merged PDF to a Uint8Array of bytes you can download.
  downloadPdf(mergedPdfBytes, "merged.pdf");
  //Calls a helper to trigger a download of those bytes as merged.pdf. Closes the click handler.
});

function downloadPdf(bytes, filename) {
  //Helper function to download a byte array as a file.
  const blob = new Blob([bytes], { type: "application/pdf" });
  //Wraps the bytes in a Blob with the correct MIME type so the browser knows it’s a PDF.
  const url = URL.createObjectURL(blob);
  //Creates a temporary local URL (blob URL) pointing to that Blob in memory.
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  //Programmatically creates a hidden <a> tag, points it at the blob URL, sets the desired filename, clicks it to start the download, then cleans it up.

  URL.revokeObjectURL(url);
  //Frees the temporary blob URL from memory once we’re done.
}



const previewContainer = document.getElementById("previewContainer");

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
