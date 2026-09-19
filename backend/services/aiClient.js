const axios = require("axios");

async function processDocument({ filePath, documentType, applicationId }) {
  const response = await axios.post(
    `${process.env.AI_SERVICE_URL}/process-document`,
    {
      filePath,
      documentType,
      applicationId
    },
    {
      timeout: 120000
    }
  );

  return response.data;
}

module.exports = {
  processDocument
};
