import { expect, test, type TestBody } from 'claude-code/testing'

type Row = { input: unknown; tool?: string; isExpanded?: boolean; isErrored?: boolean }
type Surface = 'terminal' | 'desktop'

const CALL = {
  tool_use_id: 't1',
  tool: 'Bash',
  isRunning: false,
  isErrored: false,
  isInterrupted: false,
}
const GREP = { command: 'grep -rl -E "phx_" .', description: 'Search for PostHog keys' }

// Mounts one row and returns what reached the engine's row, plus the color bar if one was drawn.
const draw = async (
  $: Parameters<TestBody>[0],
  on: Parameters<TestBody>[1],
  surface: Surface,
  props: Row,
) => {
  const seen: unknown[] = []
  on('ui.render', { component: 'ToolUse' }, (_, e, next) => {
    seen.push(e.props.input)
    return next(e)
  })
  const ui = await $.ui.mount({
    plugin: 'plain-tool-rows',
    component: 'ToolUse',
    surface,
    props: { ...CALL, ...props },
  })
  const bar = await ui.find({ type: 'Text', text: '▍' })
  await ui.unmount()
  return { input: seen.at(-1), bar: bar?.props.color }
}

for (const surface of ['terminal', 'desktop'] as const) {
  test(`${surface}: a collapsed Bash row shows the description`, async ($, on) => {
    const { input } = await draw($, on, surface, { input: GREP })
    expect(input).toEqual({ ...GREP, command: 'Search for PostHog keys' })
  })

  test(`${surface}: an expanded row keeps the real command`, async ($, on) => {
    const { input } = await draw($, on, surface, { input: GREP, isExpanded: true })
    expect(input).toEqual(GREP)
  })

  test(`${surface}: no description, no change`, async ($, on) => {
    const { input } = await draw($, on, surface, { input: { command: 'ls' } })
    expect(input).toEqual({ command: 'ls' })
  })

  test(`${surface}: other tools pass through`, async ($, on) => {
    const read = { file_path: '/tmp/a.txt' }
    const { input } = await draw($, on, surface, { tool: 'Read', input: read })
    expect(input).toEqual(read)
  })
}

const COLORS: [string, string | undefined][] = [
  ['Bash', 'bashBorder'],
  ['Edit', 'success'],
  ['Read', 'suggestion'],
  ['WebFetch', 'merged'],
  ['mcp__Claude_Browser__navigate', 'merged'],
  ['Agent', 'claude'],
  ['mcp__supabase__execute_sql', 'planMode'],
  ['TodoWrite', undefined],
]

for (const [tool, color] of COLORS) {
  test(`desktop: ${tool} gets ${color ?? 'no bar'}`, async ($, on) => {
    const { bar } = await draw($, on, 'desktop', { tool, input: {} })
    expect(bar).toEqual(color)
  })
}

test('desktop: an errored call is red whatever the tool', async ($, on) => {
  const { bar } = await draw($, on, 'desktop', { tool: 'Edit', input: {}, isErrored: true })
  expect(bar).toBe('error')
})

test('terminal: no color bar', async ($, on) => {
  const { bar } = await draw($, on, 'terminal', { input: GREP })
  expect(bar).toBeUndefined()
})

test('desktop: the engine row is kept inside the bar', async $ => {
  const ui = await $.ui.mount({
    plugin: 'plain-tool-rows',
    component: 'ToolUse',
    surface: 'desktop',
    props: { ...CALL, input: GREP },
  })
  expect(await ui.keepsBeneath()).toBe(true)
  await ui.unmount()
})
