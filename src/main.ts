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

function getCodeBlockVariableName(offset: number): string {
    return `codeBlock${offset + 1}`;
}

export function markdownToJSX(md: string): string {
    const renderer = new marked.Renderer();

    // Escape braces
    renderer.text = escapeBraces;
    renderer.codespan = text => `<code>${escapeBraces(text)}</code>`;

    // Pull out code blocks (and escape as needed)
    const codeBlocks: string[] = [];
    renderer.code = code => {
        const offset = codeBlocks.length;
        codeBlocks.push(code);
        return `<pre><code>{${getCodeBlockVariableName(offset)}}</code></pre>\n`;
    };
    
    const options: marked.MarkedOptions = {
        renderer,
        xhtml: true,
    };

    const exportString = `export default <>\n${marked.parse(md, options)}</>;\n`;

    // Prepend code block variables
    let result = "";
    for (let i = 0; i < codeBlocks.length; i++) {
        const text = codeBlocks[i];
        result += `const ${getCodeBlockVariableName(i)} = \`${escapeTemplateLiteral(text)}\n\`;\n`;
    }
    
    return result + exportString;
}
