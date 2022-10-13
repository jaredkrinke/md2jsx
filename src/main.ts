import { marked } from "marked";

function escapeBraces(text: string): string {
    return text.replace(/([{}])/g, "{'$1'}");
}

function escapeTemplateLiteral(text: string): string {
    return text
        .replace(/\\/g, "\\\\")
        .replace(/`/g, "\\`")
        .replace(/[$]/g, "\\$")
    ;
}

const renderer = new marked.Renderer();

// Escape braces
renderer.text = escapeBraces;
renderer.codespan = text => `<code>${escapeBraces(text)}</code>`;

// Escape code blocks to preserve whitespace
renderer.code = code => `<pre><code>{\`${escapeTemplateLiteral(code)}\`}</code></pre>\n`;

const options: marked.MarkedOptions = {
    renderer,
    xhtml: true,
};

export function markdownToJSX(md: string): string {
    return `export default <>\n${marked.parse(md, options)}</>;\n`;
}
