import { resolve } from "node:path";
import { defineConfig } from "vite";
import checker from "vite-plugin-checker";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
	build: {
		outDir: "extension/src",
		assetsDir: ".",
		sourcemap: mode === "development",
		minify: mode === "production",

		rollupOptions: {
			input: {
				background: resolve(__dirname, "src/background.ts"),
				options: resolve(__dirname, "src/options.ts"),
			},
			output: {
				entryFileNames: "[name].js",
				chunkFileNames: "[name].js",
				assetFileNames: "[name].[extname]",
			},
		},
	},
	plugins: [
		checker({
			typescript: true,
			biome: {
				command: "check",
				flags: "./src",
			},
		}),
	],
}));
