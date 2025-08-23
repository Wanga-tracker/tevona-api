// myfunc2.js
const axios = require("axios");

async function fetchBuffer(url) {
  const res = await axios.get(url, { responseType: "arraybuffer", timeout: 20000 });
  return { buffer: Buffer.from(res.data) };
}

module.exports = { fetchBuffer };
