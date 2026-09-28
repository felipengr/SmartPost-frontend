// Updater do commit-and-tag-version: mantém `expo.version` do app.json igual à do package.json.
// A versão do app.json é a que aparece para o usuário nas lojas (iOS/Android).

module.exports.readVersion = (contents) => JSON.parse(contents).expo.version;

module.exports.writeVersion = (contents, version) => {
  const json = JSON.parse(contents);
  json.expo.version = version;
  return `${JSON.stringify(json, null, 2)}\n`;
};
