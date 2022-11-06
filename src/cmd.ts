#!/usr/bin/env node

import { readFileSync, writeFileSync } from "fs";
import { basicYamlParser, markdownToJSX } from "./lib";

const markdownInput = readFileSync(0, "utf-8");
writeFileSync(1, markdownToJSX(markdownInput, {
    template: (process.argv.indexOf("-t") >= 0),
    parseFrontMatter: (process.argv.indexOf("-y") >= 0) ? basicYamlParser : undefined,
}));
