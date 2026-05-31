const fs = require("fs");
const path = require("path");
const axios = require("axios");
const FormData = require("form-data");

(async function () {
  try {
    const filePath = path.join(__dirname, "README.md");
    if (!fs.existsSync(filePath)) throw new Error("README.md not found");

    const tokenPath = path.join(__dirname, "token.txt");
    if (!fs.existsSync(tokenPath)) throw new Error("token.txt not found");
    const token = fs.readFileSync(tokenPath, "utf8").trim();

    const fd = new FormData();
    // send file but override filename to supported extension so multer accepts it
    fd.append("resume", fs.createReadStream(filePath), {
      filename: "sample_resume.docx",
    });

    const headers = Object.assign(fd.getHeaders(), {
      Authorization: `Bearer ${token}`,
    });

    const resp = await axios.post(
      "http://localhost:5000/api/resumes/upload",
      fd,
      { headers, maxBodyLength: Infinity },
    );
    console.log("UPLOAD RESPONSE:", JSON.stringify(resp.data, null, 2));
  } catch (err) {
    if (err.response && err.response.data) {
      console.error("ERROR RESPONSE:", err.response.data);
    } else {
      console.error("ERROR:", err.message || err);
    }
    process.exit(1);
  }
})();
