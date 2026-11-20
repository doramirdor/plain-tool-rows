# plain-tool-rows

A Claude Code mod that makes tool rows in the transcript easier to scan.

- **Plain-English shell rows.** A collapsed Bash or PowerShell row shows the description Claude wrote for the call ("Search for PostHog keys") instead of the raw command line (`grep -rl -E "phx_|POSTHOG_API_KEY" --include=*.ts ...`). Expand the row to see the real command.
- **A color bar per tool type** (desktop app only). Each row gets a thin bar on its left, colored by what the tool does. A call that failed is red.

| Tool type | Theme color |
| --- | --- |
| Shell: Bash, PowerShell | `bashBorder` |
| Edits: Edit, MultiEdit, Write, NotebookEdit | `success` |
| Read and search: Read, Grep, Glob, LS, ToolSearch | `suggestion` |
| Web and browser: WebFetch, WebSearch, browser MCP tools | `merged` |
| Agents: Agent, Task, Workflow, SendMessage, Skill | `claude` |
| Any other MCP tool | `planMode` |
| A call that failed | `error` |

Colors are theme keys, so they follow light and dark mode. Tools not listed get no bar.

The mod only changes how a row is drawn. The command Claude runs, and what Claude reads back, are never changed.

## Install

At the prompt of a Claude Code terminal session:

```
/plugin install plain-tool-rows --marketplace doramirdor/plain-tool-rows
```

Answer `y` to add the marketplace, then pick a scope (user scope loads it in every session).

From a shell:

```
claude plugin install plain-tool-rows --marketplace doramirdor/plain-tool-rows
```

In the desktop app, where `/plugin` does not run: click + next to the prompt box, then Plugins, Add marketplace with `doramirdor/plain-tool-rows`, then Add plugin. A plugin installed at user scope from a terminal also loads in the desktop app's Code tab.

## Customize

Edit the `KINDS` list in `hooks/register.tsx`: each entry is a tool-name pattern and a color. The first match wins. A color can be a theme key or any CSS color string.

## Test

```
claude plugin test .
```

## License

MIT
