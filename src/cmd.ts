import { readFileSync, writeFileSync } from "fs";
import { markdownToJSX } from "./lib";

const markdownInput = readFileSync(0, "utf-8");
writeFileSync(1, markdownToJSX(markdownInput, {
    template: process.argv.map(arg => (arg === "-t")).reduce((previous, current) => (previous || current)),
}));
