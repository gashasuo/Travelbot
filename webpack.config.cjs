const path = require("path");

module.exports = {
	mode: "development",
	entry: path.resolve(__dirname, "source/index.ts"),
	output: {
		path: path.resolve(__dirname, "dist"),
		filename: "bundle.js",
	},
	watch: true,
	module: {
		rules: [
			{
				test: /\.ts$/,
				use: "ts-loader",
				exclude: /node_modules/,
			},
		],
	},
	resolve: {
		extensions: [".ts", ".js"],
	},
};
