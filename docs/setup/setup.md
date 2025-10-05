## Prerequisites

Before starting, ensure you have:

- Claude Code installed (command-line tool for agentic coding)
- Python 3.8+ installed
- Node.js and npm installed
- uv (Python package manager) installed
- VS Code installed

## Setting Up Serena MCP Server

```
uvx --from git+https://github.com/oraios/serena serena start-mcp-server --transport stdio --context ide-assistant
```

claude mcp add serena -- uvx --from git+https://github.com/oraios/serena serena start-mcp-server --context ide-assistant --project .