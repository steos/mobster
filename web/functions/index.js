const functions = require("firebase-functions");

exports.now = functions.region("europe-west3").https.onCall((data, context) => {
  const now = new Date().getTime();
  const delta = now - data.now;
  return { now, delta };
});
