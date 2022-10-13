# md2jsx
md2jsx is an ahead-of-time/build-time tool for converting from Markdown to JSX. This differs from [react-markdown](https://github.com/remarkjs/react-markdown), which appears to dynamically convert from Markdown to JSX at run-time.

The advantage of an ahead-of-time tool is that there is no overhead on the client. You can also easily inspect the output (and compare differences, if you use source control for the resulting files).

Features:

* Ahead-of-time/build-time conversion of Markdown to JSX
* Preserves whitespace in codeblocks (simply copy-pasting to JSX *doesn't* preserve whitespace--this was the original motivation for creating md2jsx)
* Limited template support for inserting values into JSX at run-time

## Command line interface
The command line interface uses standard input and standard output for reading and writing files (use `<` and `>` or your shell's equivalents).

```
npx md2jsx [options] < input.md > output.jsx
```

Options:

* `-t`: Enable template support (this returns a function instead of plain old JSX--see documentation below)

## API
The API operates on strings and is just one function:

```ts
export declare function markdownToJSX(md: string, options?: { template?: boolean; }): string;
```

## Example
Here's some simple Markdown (in a file named `default.md`):

````md
# Header
This is some text.

```
for (let i = 0; i < 3; i++) {
    console.log(`And some code!`);
}
```
````

Run the tool: `npx md2jsx < default.md`

Here's the output:

```jsx
// Auto-generated using md2jsx

export default <>
<h1 id="header">Header</h1>
<p>This is some text.</p>
<pre><code>{`for (let i = 0; i < 3; i++) {
    console.log(\`And some code!\`);
}`}</code></pre>
</>;
```

You can write the output to a file by redirecting standard output (e.g. `> output.jsx` in most shells).

## Template example
md2jsx also has some rudimentary support for inserting values (identified in the Markdown input via `{{someProperty}}`) into the resulting JSX at run time (a.k.a. templates):

```md
# This is an example with substitutions
Hello, {{name}}!

I also like {{like}}.

That is all.
```

Run the tool: `npx md2jsx -t < template.md > template.jsx`

Output:

```jsx
// Auto-generated using md2jsx

export default (context = null) => <>
<h1 id="this-is-an-example-with-substitutions">This is an example with substitutions</h1>
<p>Hello, {context?.name}!</p>
<p>I also like {context?.like}.</p>
<p>That is all.</p>
</>;
```

The template is exported as an arrow function that taxes a JavaScript object whose properties are inserted when `{{property}}` is encountered in the Markdown input. Here's how to use the export from above (assuming it's in `template.tsx` and is being used from TypeScript):

```tsx
import { default as template } from "./template";
...
public render() {
    return template({
        name: "Bill",
        like: "money",
    });
}
```
