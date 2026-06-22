# Contributing to Tenspilot Patient App

Thank you for your interest in contributing! 🎉 Contributions of all kinds are welcome — bug fixes, new features, documentation improvements, and more.

---

## 🚀 Getting Started

### 1. Fork & Clone

```bash
# Fork the repo on GitHub, then:
git clone https://github.com/YOUR_USERNAME/remix-of-tenspilot1.git
cd remix-of-tenspilot1
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment

```bash
cp .env.example .env.local
# Add your Firebase and Groq API keys
```

### 4. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/issue-description
```

---

## 🧑‍💻 Development Workflow

```bash
# Start dev server
npm run dev

# Run tests
npm run test

# Run linter
npm run lint

# Type check
npx tsc --noEmit
```

---

## 📝 Commit Convention

We follow **Conventional Commits**:

| Prefix | When to use |
|--------|------------|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `docs:` | Documentation changes |
| `style:` | Formatting, no logic change |
| `refactor:` | Code restructuring |
| `test:` | Adding or updating tests |
| `chore:` | Tooling, dependencies |

**Examples:**
```
feat: add pain tracker export to CSV
fix: resolve video call reconnection bug
docs: update README quick start steps
```

---

## 🔀 Pull Request Process

1. Ensure your branch is up to date with `main`
2. Run tests and lint — no failures allowed
3. Write a clear PR description explaining what changed and why
4. Reference any related issues: `Closes #123`
5. Request a review from [@Akachi240](https://github.com/Akachi240)

---

## 🐛 Reporting Bugs

Please use [GitHub Issues](https://github.com/Akachi240/remix-of-tenspilot1/issues) and include:
- Steps to reproduce
- Expected vs actual behaviour
- Browser/OS/device info
- Screenshots or console logs if relevant

---

## 💡 Feature Requests

Open a [GitHub Issue](https://github.com/Akachi240/remix-of-tenspilot1/issues) with the label `enhancement` and describe:
- The problem you're solving
- Your proposed solution
- Any alternative approaches considered

---

## 📋 Code Standards

- **TypeScript first** — no `any` types without justification
- **Components** — small, focused, single-responsibility
- **Styling** — use Tailwind utilities and shadcn/ui primitives
- **Tests** — add tests for any non-trivial logic
- **Accessibility** — ensure keyboard navigation and ARIA labels

---

## 🙏 Thank You

Every contribution matters. Whether it's fixing a typo or building a new feature — thank you for making Tenspilot better for patients everywhere. ❤️
