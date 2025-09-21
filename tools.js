const { jsPDF } = window.jspdf;
/* window.jspdf is the global object created when you load the jsPDF library from the CDN.
   jsPDF exports its functions inside it.
   The curly braces { jsPDF } is destructuring → it pulls out only jsPDF from window.jspdf 
   so you can use new jsPDF() instead of new window.jspdf.jsPDF(). */

const imageInput = document.getElementById("imageInput");
const convertBtn = document.getElementById("convertBtn");
const message = document.getElementById("message");
const previewContainer = document.getElementById("previewContainer");

/* imageInput → points to the <input type="file" id="imageInput">.
   convertBtn → points to the <button id="convertBtn">. */

/* ------------------------------------------
   IMAGE PREVIEW
------------------------------------------- */
imageInput.addEventListener("change", () => {
  previewContainer.innerHTML = ""; // Clear old previews
  const files = imageInput.files;

  if (files.length === 0) {
    message.textContent = "⚠️ Please select at least one image!";
    return;
  }

  message.textContent = "";

  for (let file of files) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const img = document.createElement("img");
      img.src = e.target.result; // base64 string
      img.style.width = "150px";  // thumbnail width
      img.style.height = "auto";  // keep aspect ratio
      img.style.margin = "10px";
      img.style.borderRadius = "8px";
      img.style.boxShadow = "0 2px 6px rgba(0,0,0,0.15)";

      previewContainer.appendChild(img);
    };
    reader.readAsDataURL(file);
  }
});

/* ------------------------------------------
   CONVERT IMAGES TO PDF
------------------------------------------- */
convertBtn.addEventListener("click", async () => {
  const files = imageInput.files;
  if (files.length === 0) {
    message.textContent = "⚠️ Please select at least one image!";
    return;
  }

  message.textContent = "";

  // Create a new PDF document
  const pdf = new jsPDF({ orientation: "portrait", unit: "px", format: "a4" });

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const imgData = await fileToDataURL(file);

    const img = new Image();
    img.src = imgData;

    // Wait for the image to load
    await new Promise((resolve) => {
      img.onload = function () {
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        let width = img.width;
        let height = img.height;
        const ratio = Math.min(pdfWidth / width, pdfHeight / height);
        width *= ratio;
        height *= ratio;

        const x = (pdfWidth - width) / 2;
        const y = (pdfHeight - height) / 2;

        if (i > 0) pdf.addPage(); // Add a new page for each image after the first
        pdf.addImage(imgData, "PNG", x, y, width, height);
        resolve();
      };
    });
  }

  // Save the PDF
  pdf.save("output.pdf");
});

/* ------------------------------------------
   HELPER FUNCTION: Read file as DataURL
------------------------------------------- */
function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}
