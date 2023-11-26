const express = require("express");
const multer = require("multer");
const fs = require("fs");
const pdfPoppler = require("pdf-poppler");

const { create } = require("pdf-creator-node");
const pdf2img = require("pdf2img");

const app = express();
const port = 3000;

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post("/image-to-pdf", upload.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    const imageData = req.file.buffer;

    // Use pdf-creator-node to create a PDF
    const pdfOptions = {
      format: "A4",
      orientation: "portrait",
      border: "10mm",
      header: {
        height: "10mm",
        contents:
          '<div style="text-align: center; font-size: 12px;">Image to PDF Conversion</div>',
      },
    };

    const document = {
      html: `<img src="data:image/png;base64,${imageData.toString(
        "base64"
      )}"/>`,
      data: {},
      path: "output.pdf",
    };

    create(document, pdfOptions)
      .then((result) => {
        const pdfPath = result.filename;
        res.download(pdfPath, "output.pdf", (err) => {
          fs.unlinkSync(pdfPath);
        });
      })
      .catch((error) => {
        console.error("Error creating PDF:", error);
        res.status(500).json({ error: "Internal Server Error" });
      });
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
