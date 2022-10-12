import { markdownToJSX } from "./main";
import * as assert from "assert";

describe("md2jsx", function () {
    it("One paragraph", function () {
        assert.equal(markdownToJSX("Hi"), "export default <>\n<p>Hi</p>\n</>;\n");
    });

    it("Braces", function () {
        assert.equal(markdownToJSX("{ \\{ \\} }"), "export default <>\n<p>{'{'} {'{'} {'}'} {'}'}</p>\n</>;\n");
    });

    it("Braces in inline code", function () {
        assert.equal(markdownToJSX("`{ \\{ \\} }`"), "export default <>\n<p><code>{'{'} \\{'{'} \\{'}'} {'}'}</code></p>\n</>;\n");
    });

    it("Brackets in inline code", function () {
        assert.equal(markdownToJSX("`<html>`"), "export default <>\n<p><code>&lt;html&gt;</code></p>\n</>;\n");
    });

    it("Fenced code with whitespace", function() {
        assert.equal(markdownToJSX(`\`\`\`
for (let i = 0; i < array.length; i++) {
    console.log(\`<\${array[i]}>\`);
}
\`\`\``), "const codeBlock1 = `for (let i = 0; i < array.length; i++) {\n    console.log(\\`<\\${array[i]}>\\`);\n}\n`;\nexport default <>\n<pre><code>{codeBlock1}</code></pre>\n</>;\n");
    });
});
