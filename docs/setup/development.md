# Development Setup Guide

## Prerequisites

### System Requirements
- **Operating System**: Windows 10/11 (64-bit)
- **RAM**: Minimum 8GB, recommended 16GB
- **Storage**: 5GB free space for development
- **Processor**: Modern CPU with 64-bit support

### Required Software

#### Core Development Tools
1. **Node.js** (v18.0 or higher)
   ```bash
   # Download and install from https://nodejs.org/
   # Verify installation:
   node --version  # Should be v18.0.0+
   npm --version   # Should be v9.0.0+
   ```

2. **Rust** (v1.75.0 or higher)
   ```bash
   # Install Rust using rustup:
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   # Restart terminal and verify:
   rustc --version  # Should be 1.75.0+
   cargo --version  # Should match rustc version
   ```

3. **Git** (v2.30 or higher)
   ```bash
   # Download from https://git-scm.com/
   # Verify installation:
   git --version
   ```

4. **Claude Code CLI** (latest version)
   ```bash
   # Install globally:
   npm install -g @anthropic-ai/claude-code
   # Verify installation:
   claude-code --version
   ```

#### Recommended Development Tools

##### Visual Studio Code
- **Download**: https://code.visualstudio.com/
- **Required Extensions**:
  ```
  - Rust Analyzer
  - ES7+ React/Redux/React-Native snippets
  - TypeScript Importer
  - Prettier - Code formatter
  - ESLint
  - Auto Rename Tag
  - Bracket Pair Colorizer
  - GitLens
  - Thunder Client (for API testing)
  ```

##### Additional Tools
- **Windows Terminal**: Modern terminal experience
- **PowerShell 7**: Enhanced PowerShell experience
- **Docker Desktop**: For containerized development (optional)

## Initial Setup

### 1. Clone the Repository
```bash
# Clone the repository
git clone https://github.com/Handdoek11/SpaarApp.git
cd SpaarApp

# Verify the structure
ls -la
```

### 2. Install Dependencies

#### Frontend Dependencies
```bash
# Install Node.js dependencies
npm install

# Verify installation
npm run --version  # Should show package.json scripts
```

#### Backend Dependencies
```bash
# Install Rust dependencies
cargo build

# Verify installation
cargo check  # Should complete without errors
```

### 3. Environment Configuration
```bash
# Copy environment template
cp .env.example .env.local

# Edit environment file
notepad .env.local  # Or use your preferred editor
```

**Required Environment Variables:**
```env
# Claude AI Configuration
ANTHROPIC_API_KEY=your_anthropic_api_key_here
OPENAI_API_KEY=your_openai_api_key_here

# Database Configuration
DATABASE_ENCRYPTION_KEY=your_32_character_encryption_key_here

# Development Settings
APP_DEBUG=true
APP_LOG_LEVEL=debug
```

### 4. Claude Code CLI Setup
```bash
# Initialize Claude Code configuration
claude-code init

# Verify setup
claude-code agents list
claude-code skills list
```

## Development Workflow

### Starting Development Server
```bash
# Start full development environment
npm run dev

# Or start components individually:
npm run dev:vite      # Frontend only
npm run dev:tauri     # Backend only
```

The development server will start:
- **Frontend**: http://localhost:1420
- **Backend**: Tauri development window
- **Hot Reload**: Enabled for both frontend and backend

### Running Tests
```bash
# Run all tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run specific test suites
npm run test:unit        # Unit tests only
npm run test:integration # Integration tests only
npm run test:e2e        # End-to-end tests only
```

### Code Quality
```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Type checking
npm run type-check
```

### Building
```bash
# Development build
npm run build:dev

# Production build
npm run build

# Package for distribution
npm run package
```

## Claude Code CLI Integration

### Available Commands
```bash
# Development commands
claude-code spaarapp:dev        # Start development with AI assistance
claude-code spaarapp:build      # Build with AI optimization
claude-code spaarapp:test       # Run tests with AI analysis
claude-code spaarapp:security   # Security audit with AI
claude-code spaarapp:deploy     # Deployment preparation

# AI-powered analysis
claude-code spaarapp:analyze    # Analyze codebase
claude-code spaarapp:optimize   # Optimize performance
claude-code spaarapp:review     # Code review with AI
claude-code spaarapp:debug      # Debug with AI assistance
```

### Using Specialized Agents
```bash
# Use frontend development agent
claude-code --agent frontend "Create new budget component with Material-UI"

# Use backend development agent
claude-code --agent backend "Implement secure transaction storage"

# Use financial analysis agent
claude-code --agent financial "Analyze spending patterns and suggest optimizations"

# Use accessibility agent
claude-code --agent ui-visual-validator "Review ADHD-friendliness of current UI"
```

### Development Skills
```bash
# Use specific development skills
claude-code --skill tauri-development "Add new Tauri command for CSV import"
claude-code --skill react-typescript "Create responsive dashboard component"
claude-code --skill financial-data-processing "Implement transaction categorization"
claude-code --skill accessibility-compliance "Verify WCAG 2.1 AA compliance"
```

## Project Structure

### Understanding the Layout
```
SpaarApp/
├── .claude/                 # Claude Code CLI configuration
│   ├── config.json         # Project configuration
│   ├── agents/             # Custom agents
│   ├── skills/             # Development skills
│   └── commands/           # Custom commands
├── docs/                   # Documentation
│   ├── architecture/       # System architecture
│   ├── api/               # API documentation
│   ├── setup/             # Setup guides
│   └── guides/            # Development guides
├── spaarapp/              # Main application code
│   ├── frontend/          # React UI
│   ├── backend/           # Rust backend
│   ├── shared/            # Shared code
│   └── ai-services/       # AI integration
├── tools/                 # Development tools
│   └── claude-code-toolkit/ # Claude Code marketplace
├── tests/                 # Test suites
├── scripts/               # Build and utility scripts
└── .github/              # GitHub workflows
```

### Key Files to Understand

#### Configuration Files
- **`.claude/config.json`**: Claude Code CLI project configuration
- **`package.json`**: Node.js dependencies and scripts
- **`Cargo.toml`**: Rust workspace configuration
- **`.env.example`**: Environment variable template

#### Entry Points
- **`spaarapp/frontend/src/main.tsx`**: React application entry
- **`spaarapp/backend/src/main.rs`**: Tauri backend entry
- **`src-tauri/tauri.conf.json`**: Tauri application configuration

#### Documentation
- **`README.md`**: Project overview and quick start
- **`docs/architecture/`**: Technical architecture documentation
- **`docs/setup/`**: Setup and configuration guides

## Development Best Practices

### Code Organization
1. **Component Structure**: Keep components focused and reusable
2. **Type Safety**: Use TypeScript for all frontend code
3. **Error Handling**: Implement comprehensive error handling
4. **Testing**: Write tests for all new features
5. **Documentation**: Document complex logic and APIs

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/new-budget-component

# Make changes and commit
git add .
git commit -m "feat: add budget overview component with Material-UI"

# Push and create pull request
git push origin feature/new-budget-component
```

### Commit Message Format
```
type(scope): description

feat(frontend): add budget overview component
fix(backend): resolve transaction import validation
docs(readme): update installation instructions
test(ai): add Claude SDK integration tests
```

### Security Practices
1. **API Keys**: Never commit API keys to repository
2. **Data Validation**: Validate all user inputs
3. **Encryption**: Use provided encryption for sensitive data
4. **Dependencies**: Keep dependencies updated and secure

## Troubleshooting

### Common Issues

#### Rust Installation Issues
```bash
# If Rust installation fails, try:
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y

# Update PATH manually:
echo 'export PATH="$HOME/.cargo/bin:$PATH"' >> ~/.bashrc
```

#### Node.js Version Conflicts
```bash
# Use nvm to manage Node.js versions:
nvm install 18
nvm use 18
nvm alias default 18
```

#### Claude Code CLI Issues
```bash
# Reinstall Claude Code CLI:
npm uninstall -g @anthropic-ai/claude-code
npm install -g @anthropic-ai/claude-code

# Clear cache:
claude-code cache clear
```

#### Build Failures
```bash
# Clean build cache:
cargo clean
rm -rf node_modules
npm install
cargo build
```

#### Database Issues
```bash
# Reset database (WARNING: This deletes all data):
rm -f data/spaarapp.db
rm -rf data/
```

### Getting Help

#### Resources
- **Claude Code Documentation**: https://docs.claude.com/claude-code
- **Tauri Documentation**: https://tauri.app/
- **React Documentation**: https://react.dev/
- **Material-UI Documentation**: https://mui.com/

#### Community Support
- **GitHub Issues**: https://github.com/Handdoek11/SpaarApp/issues
- **Discord Community**: [Link to Discord server]
- **Stack Overflow**: Use tags `tauri`, `react`, `rust`

#### Debug Information
```bash
# Collect debug information:
npm run debug:info
cargo doctor
claude-code --version
node --version
rustc --version
```

This development setup ensures you have a complete, optimized environment for developing SpaarApp with full Claude Code CLI integration and AI-powered development assistance.