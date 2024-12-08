# Teleprompter

A simple, elegant teleprompter application built with Electron and React. This project was created entirely through AI pair programming using Cursor's AI features powered by Claude-3.5-sonnet.

## The Experiment

This project is the result of a fascinating experiment in AI-assisted development. The entire codebase was generated through a collaborative dialogue between a human developer (who had no prior experience with Electron or Tailwind) and an AI assistant, without the human writing a single line of code manually.

The development process took approximately 2 hours from start to finish, demonstrating the potential of AI pair programming to accelerate development, even when working with unfamiliar technologies.

## Features

- Clean, modern UI built with React and Tailwind CSS
- Smooth scrolling with adjustable speed
- Customizable font sizes
- Dark/Light mode toggle
- Time remaining and estimated completion time
- Markdown support with GitHub Flavored Markdown
- System tray integration
- Multi-window support (Editor, Preview, and Teleprompter windows)
- Persistent settings
- Native macOS integration

## Controls

- **Space**: Toggle scroll
- **Up/Down**: Manual scroll
- **Left/Right**: Adjust speed
- **[/]**: Adjust font size
- **i**: Invert colors (dark/light mode)
- **Esc**: Back to editor

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run electron:dev

# Build for production
npm run electron:build
```

## Technical Stack

- **Framework**: Electron + React
- **Styling**: Tailwind CSS
- **State Management**: React Hooks
- **Text Rendering**: React Markdown with remark-gfm
- **Build Tools**: Vite + TypeScript
- **Icons**: Custom SVG with ImageMagick conversion

## AI Pair Programming Process

This project showcases a new approach to software development where AI serves as an active pair programming partner. Here's how it worked:

1. The human developer provided high-level requirements and preferences
2. The AI assistant (Claude-3.5-sonnet through Cursor):
   - Suggested appropriate technologies and architecture
   - Generated complete, working code
   - Handled complex integrations (Electron, React, Tailwind)
   - Fixed bugs and implemented improvements
   - Provided explanations and context

The entire development process was conversational, with the human developer providing feedback and direction while the AI handled all code generation and technical implementation details.

## Lessons Learned

This experiment demonstrated that:
- AI can significantly accelerate development, even with unfamiliar technologies
- Complex applications can be built through natural language conversation
- AI can handle both high-level architecture and low-level implementation details
- The human developer can focus on requirements and user experience while the AI handles technical complexities

## Acknowledgments

- Built with [Cursor](https://cursor.sh)
- AI assistance by Claude-3.5-sonnet
- Special thanks to the Electron, React, and Tailwind CSS communities for their excellent documentation 