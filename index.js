const spawn = require("child-process-promise").spawn;
const path = require("path");
const fsp = require("fs-extra");
const pMinDelay = require("p-min-delay");
const APP_PATH = path.join(__dirname, "pip.app");

const parseUrl = async (string) => {
  const url = path.resolve(path.join(process.cwd(), string));
  const magicUrl = path.join(process.cwd(), string).replace(/^\//g, "");

  if (!string.startsWith("http")) {
    if (path.isAbsolute(string) && (await fsp.exists(string))) {
      return `file:///${encodeURIComponent(string)}`;
    }
    if (await fsp.exists(url)) {
      return `file:///${encodeURIComponent(url.replace(/^\//g, ""))}`;
    } else if (await fsp.exists(magicUrl)) {
      return `file:///${encodeURIComponent(magicUrl)}`;
    }
    throw new Error(`Could not find file at any of these locations:\n${magicUrl}\n${url}\n`);
  }

  if (string.startsWith("http")) {
    return string;
  }

  throw new Error(`Could not parse url: ${string}`);
};

const kill = () =>
  Promise.all([spawn("killall", ["pip"]), spawn("killall", ["PIPAgent"])])
    .then(() => true)
    .catch(() => false);

async function cleanup() {
  const errorFile = path.join(APP_PATH, "error.log");
  const exists = await fsp.exists(errorFile);
  if (exists) await fsp.remove(errorFile);
  return exists;
}

async function didFail() {
  const errorFile = path.join(APP_PATH, "error.log");
  const exists = await fsp.exists(errorFile);
  if (exists) await fsp.remove(errorFile);

  return exists;
}

async function open(input) {
  const parsed = await parseUrl(input.replace(/^"/g, "").replace(/"$/g, "").replace(/^'/g, "").replace(/'$/g, ""));
  await kill();
  await cleanup();

  const runner = spawn("open", [APP_PATH, "--args", parsed]).catch((error) => {
    console.error(error);
    throw new Error("Error opening pip.app");
  });

  return pMinDelay(runner, 1000)
    .then(didFail)
    .then((failed) => {
      if (failed) return Promise.reject(false);
      return Promise.resolve(true);
    });
}

module.exports = open;
