const tf = require('@tensorflow/tfjs-node');
const InputError = require('../exceptions/InputError');

async function predictClassification(model, image) {
  try {
    const tensor = tf.node
      .decodeJpeg(image)
      .resizeNearestNeighbor([224, 224])
      .expandDims()
      .toFloat()

    const prediction = model.predict(tensor);
    const score = await prediction.data();
    const confidenceScore = Math.max(...score) * 100;

    const classes = ['Cancer', 'Non-Cancer'];

    const classResult = tf.argMax(prediction, 1).dataSync()[0];
    const label = classes[classResult];

    let suggestion;

    if (label === 'Cancer') {
      suggestion = "Segera konsultasi dengan dokter secepatnya"
    }
  
    if (label === 'Non-Cancer') {
      suggestion = "Puji tuhan anda sehat wal'afiat "
    }

    return { confidenceScore, label, suggestion };
  } catch (error) {
    throw new InputError(`Terjadi kesalahan prediksi: ${error.message}`);
  }
}

module.exports = predictClassification;
