import { readFileSync, writeFileSync } from "fs";
import { markdownToJSX } from "./main";

const markdownInput = readFileSync(0, "utf-8");
writeFileSync(1, markdownToJSX(markdownInput));
