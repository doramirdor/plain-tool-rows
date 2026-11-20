import type { Color, Register } from 'claude-code'

type ShellInput = { command: string; description?: string }

const isShell = (tool: string, input: unknown): input is ShellInput =>
  (tool === 'Bash' || tool === 'PowerShell') &&
  typeof (input as Partial<ShellInput> | null)?.command === 'string'

// Theme keys, so the bar follows light and dark mode. First match wins; any other tool gets no bar.
const KINDS: [RegExp, Color][] = [
  [/^(Bash|PowerShell)$/, 'bashBorder'],
  [/^(Edit|MultiEdit|Write|NotebookEdit)$/, 'success'],
  [/^(Read|Grep|Glob|LS|ToolSearch)$/, 'suggestion'],
  [/^(WebFetch|WebSearch)$|^mcp__(Claude_Browser|claude-in-chrome)__/, 'merged'],
  [/^(Agent|Task|Workflow|SendMessage|Skill)$/, 'claude'],
  [/^mcp__/, 'planMode'],
]

const colorOf = (tool: string, isErrored: boolean): Color | undefined =>
  isErrored ? 'error' : KINDS.find(([kind]) => kind.test(tool))?.[1]

// Collapsed shell rows show the call's description in place of the raw command; an expanded
// row keeps the real command. On desktop each row also gets a bar colored by tool type.
// The model's call is never changed, only how its row is drawn.
export const register: Register = on => {
  on('ui.render', { component: 'ToolUse' }, async ($, e, next) => {
    const { tool, input, isExpanded, isErrored } = e.props
    const shell = isShell(tool, input) ? input : undefined
    const label = shell?.description?.trim()

    const row = await next(
      shell && label && !isExpanded
        ? { ...e, props: { ...e.props, input: { ...shell, command: label } } }
        : e,
    )

    // ponytail: desktop only; the terminal row already has its own colored dot, and mobile would draw the bar as an extra line.
    const color = e.surface === 'desktop' ? colorOf(tool, isErrored) : undefined
    if (!color) {
      return row
    }

    const { Box, Text } = $.ui.resolve(e)

    return (
      <Box flexDirection="row" gap={1}>
        <Text color={color}>▍</Text>
        <Box flexGrow={1}>{row}</Box>
      </Box>
    )
  })
}
