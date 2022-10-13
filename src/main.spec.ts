import { markdownToJSX } from "./main";
import * as assert from "assert";

function createExpected(jsx: string): string {
    return `export default <>\n${jsx}\n</>;\n`;
}

describe("md2jsx", function () {
    it("One paragraph", function () {
        assert.equal(markdownToJSX("Hi"), createExpected("<p>Hi</p>"));
    });

    it("Braces", function () {
        assert.equal(markdownToJSX("{ \\{ \\} }"), createExpected("<p>{'{'} {'{'} {'}'} {'}'}</p>"));
    });

    it("Braces in inline code", function () {
        assert.equal(markdownToJSX("`{ \\{ \\} }`"), createExpected("<p><code>{'{'} \\{'{'} \\{'}'} {'}'}</code></p>"));
    });

    it("Brackets in inline code", function () {
        assert.equal(markdownToJSX("`<html>`"), createExpected("<p><code>&lt;html&gt;</code></p>"));
    });

    it("Fenced code with whitespace", function() {
        assert.equal(markdownToJSX(`\`\`\`
for (let i = 0; i < array.length; i++) {
    console.log(\`<\${array[i]}>\`);
}
\`\`\``), createExpected("<pre><code>{`for (let i = 0; i < array.length; i++) {\n    console.log(\\`<\\${array[i]}>\\`);\n}`}</code></pre>"));
    });
});
