const predictClassification = require("../services/inferenceService");
const crypto = require("crypto");
const storeData = require("../services/storeData");
const { Firestore } = require("@google-cloud/firestore");

async function postPredictHandler(request, h) {
  const { image } = request.payload;
  const { model } = request.server.app;

  const { confidenceScore, label, suggestion } = await predictClassification(
    model,
    image
  );
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();

  const data = {
    id: id,
    result: label,
    suggestion: suggestion,
    confidenceScore: confidenceScore,
    createdAt: createdAt,
  };

  await storeData(id, data);

  const response = h.response({
    status: "success",
    message:
      confidenceScore > 99
        ? "Model is predicted successfully."
        : "Model is predicted successfully but under threshold. Please use the correct picture",
    data,
  });
  response.code(201);
  return response;
}

async function getPredictHandler(request, h) {
  const db = new Firestore();
  const predictCollection = db.collection("predictions");

  const snapshot = await predictCollection.get();
  if (snapshot.empty) {
    return h
      .response({
        status: "success",
        data: [],
      })
      .code(200);
  }

  const responseData = snapshot.docs.map((doc) => ({
    id: doc.id,
    history: {
      result: doc.data().result,
      createdAt: doc.data().createdAt,
      suggestion: doc.data().suggestion,
      id: doc.id,
    },
  }));

  const response = h.response({
    status: "success",
    data: responseData,
  });

  response.code(200);
  return response;
}

module.exports = { postPredictHandler, getPredictHandler };
