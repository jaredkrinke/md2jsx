import { basicYamlParser, markdownToJSX } from "../src/lib";
import * as assert from "assert";

const prefix = "// Auto-generated using md2jsx\n\n";

function createExpected(jsx: string, metadata?: string): string {
    return `${prefix}export default <>\n${jsx}\n</>;\n${metadata ? `\nexport const metadata = ${metadata};\n` : ""}`;
}

function createExpectedTemplate(jsx: string): string {
    return `${prefix}export default (context = null) => <>\n${jsx}\n</>;\n`;
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

    it("Substitution", function() {
        assert.equal(markdownToJSX("Hello, {{name}}!", { template: true }), createExpectedTemplate("<p>Hello, {context?.name}!</p>"));
    });

    // TODO: Look into supporting these, if needed
    // it("Substitution in inline code", function() {
    //     assert.equal(markdownToJSX("`Hello, {{name}}!`", { template: true }), createExpectedTemplate("<p><code>Hello, {context.name}!</code></p>"));
    // });

    // it("Substitution in fenced code", function() {
    //     assert.equal(markdownToJSX("```\nHello, {{name}}!\n```", { template: true }), createExpectedTemplate("<pre><code>Hello, {context.name}!</code></pre>"));
    // });

    it("Front matter", function () {
        assert.equal(markdownToJSX(
`---
string: Some value to trim
stringArray: [ value1, value 2 to trim]
---
Hi
`, { parseFrontMatter: basicYamlParser }), createExpected("<p>Hi</p>", JSON.stringify({
    string: "Some value to trim",
    stringArray: [ "value1", "value 2 to trim" ],
}, undefined, 4)));
    });
});
