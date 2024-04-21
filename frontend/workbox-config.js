// workbox-config.js

module.exports = {
  globDirectory: "build/",
  globPatterns: ["**/*.{json,ico,html,js,css,png,jpg}"],
  swDest: "build/service-worker.js",
  clientsClaim: true,
  skipWaiting: true,
};
