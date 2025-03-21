This extension uses pnpm as a package manager.
To install:
npm install -g pnpm@latest-10

See https://pnpm.io/installation for other way of installing pnpm.

---

To build the extension:
pnpm install
pnpm package

Will compile all ts files to js, create the zip file of the extension and put it to ./extension/web-ext-artifacts/

---

To run the extension:
pnpm start

Will start Firefox on the test page with the plugin installed