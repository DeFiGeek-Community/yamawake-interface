const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { createRequire } = require("node:module");
const root = path.resolve(__dirname, "../..");
const appRequire = createRequire(path.join(root, "apps/web/package.json"));
const ts = appRequire("typescript");

// Execute repository sources with real crypto and cookies, injecting only service boundaries.
function createLoader(mocks = {}, env = {}) {
  const cache = new Map();
  function load(relative) {
    const candidate = path.resolve(root, relative);
    const filename = [
      candidate,
      `${candidate}.ts`,
      `${candidate}.tsx`,
      `${candidate}/index.ts`,
    ].find((file) => fs.existsSync(file) && fs.statSync(file).isFile());
    if (!filename) throw new Error(`Source not found: ${relative}`);
    if (cache.has(filename)) return cache.get(filename).exports;
    if (filename.endsWith(".json")) return JSON.parse(fs.readFileSync(filename, "utf8"));
    const mod = { exports: {} };
    cache.set(filename, mod);
    const source = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2020,
        esModuleInterop: true,
      },
      fileName: filename,
    }).outputText;
    vm.runInNewContext(
      source,
      {
        module: mod,
        exports: mod.exports,
        require(name) {
          if (Object.hasOwn(mocks, name)) return mocks[name];
          if (name.startsWith("lib/")) return load(`packages/lib/${name.slice(4)}`);
          if (name.startsWith(".")) {
            const resolved = path.resolve(path.dirname(filename), name);
            const libPath = path.relative(path.join(root, "packages/lib"), resolved);
            if (!libPath.startsWith("..") && Object.hasOwn(mocks, `lib/${libPath}`)) {
              return mocks[`lib/${libPath}`];
            }
            return load(resolved);
          }
          return appRequire(name);
        },
        process: { env },
        Error,
        TypeError,
        Date,
        URL,
        Buffer,
        setTimeout,
        clearTimeout,
        console: { ...console, error() {} },
      },
      { filename },
    );
    return mod.exports;
  }
  return load;
}

function response() {
  return {
    statusCode: 200,
    headers: {},
    getHeader(name) {
      return this.headers[name.toLowerCase()];
    },
    setHeader(name, value) {
      this.headers[name.toLowerCase()] = value;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
    send(body) {
      this.body = body;
      return this;
    },
    end(body) {
      this.body = body;
      return this;
    },
  };
}
function cookieFrom(res) {
  return res.getHeader("set-cookie").at(-1).split(";")[0];
}
module.exports = { createLoader, response, cookieFrom, appRequire };
