# 🤝 Contributing to Auth App

Thank you for your interest in contributing to Auth App! This document provides guidelines and instructions for contributing to this open-source authentication system.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)
- [Security Considerations](#security-considerations)
- [Getting Help](#getting-help)

## 📜 Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. We are committed to providing a welcoming and inclusive environment for all contributors.

### Our Standards

- **Be respectful**: Treat everyone with respect and kindness
- **Be inclusive**: Welcome newcomers and encourage diverse perspectives
- **Be constructive**: Provide helpful feedback and suggestions
- **Be professional**: Maintain professionalism in all interactions

## 🚀 Getting Started

### Prerequisites

Before contributing, ensure you have:

- [Bun](https://bun.sh/) >= 1.0.0 installed
- Node.js >= 18.0.0 (for some frontend tooling)
- Git installed and configured
- A GitHub account

### Fork and Clone

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/auth-app.git
   cd auth-app
   ```
3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/auth-app.git
   ```

## 🛠️ Development Setup

### Installation

1. **Install backend dependencies**:
   ```bash
   cd backend
   bun install
   ```

2. **Install frontend dependencies**:
   ```bash
   cd ../frontend
   bun install
   ```

### Environment Configuration

1. **Backend environment** (`.env` in `backend/` directory):
   ```env
   JWT_SECRET=your-development-secret-key
   PORT=3001
   ```

2. **Frontend environment** (`.env` in `frontend/` directory):
   ```env
   VITE_API_BASE_URL=http://localhost:3001/api
   ```

### Running the Development Environment

1. **Start the backend** (Terminal 1):
   ```bash
   cd backend
   bun run dev
   ```

2. **Start the frontend** (Terminal 2):
   ```bash
   cd frontend
   bun run dev
   ```

3. **Access the application**:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001

## 🔄 How to Contribute

### Types of Contributions

We welcome various types of contributions:

- **🐛 Bug fixes**: Fix issues or unexpected behavior
- **✨ New features**: Add new functionality
- **📚 Documentation**: Improve or add documentation
- **🎨 UI/UX improvements**: Enhance user interface and experience
- **🔧 Refactoring**: Improve code quality and structure
- **🧪 Testing**: Add or improve tests
- **🔒 Security**: Address security vulnerabilities

### Finding Issues to Work On

- Check the [Issues](https://github.com/OWNER/auth-app/issues) page
- Look for issues labeled `good first issue` for beginners
- Issues labeled `help wanted` are great for contributors
- Check the project roadmap for upcoming features

### Creating Issues

Before creating a new issue:

1. **Search existing issues** to avoid duplicates
2. **Use appropriate issue templates**
3. **Provide clear, detailed descriptions**
4. **Include steps to reproduce** for bugs
5. **Add relevant labels** if you have permissions

## 📝 Pull Request Process

### Before Submitting

1. **Create a new branch**:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/issue-number
   ```

2. **Keep your fork updated**:
   ```bash
   git fetch upstream
   git checkout main
   git merge upstream/main
   ```

3. **Make your changes**:
   - Follow coding standards
   - Add tests if applicable
   - Update documentation

4. **Test your changes**:
   ```bash
   # Backend tests
   cd backend
   bun run test  # if tests exist
   
   # Frontend tests
   cd frontend
   bun run test  # if tests exist
   bun run build  # ensure build works
   ```

5. **Commit your changes**:
   ```bash
   git add .
   git commit -m "feat: add user profile management"
   ```

### Commit Message Guidelines

Use [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(auth): add password reset functionality
fix(ui): resolve mobile responsive issues
docs(api): update endpoint documentation
```

### Submitting the Pull Request

1. **Push your branch**:
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create a Pull Request** on GitHub:
   - Use a clear, descriptive title
   - Fill out the PR template completely
   - Link related issues using keywords (e.g., "Closes #123")
   - Add appropriate labels
   - Request review from maintainers

3. **Respond to feedback**:
   - Address review comments promptly
   - Make requested changes
   - Push updates to the same branch

## 🎯 Coding Standards

### General Principles

- **Write clean, readable code**
- **Follow existing code patterns**
- **Use meaningful variable and function names**
- **Add comments for complex logic**
- **Keep functions small and focused**

### Backend Standards (TypeScript/Bun)

```typescript
// Use proper TypeScript types
interface UserData {
  id: number;
  email: string;
  totpEnabled: boolean;
}

// Use async/await for asynchronous operations
export async function createUser(userData: UserData): Promise<User> {
  try {
    const user = await db.createUser(userData);
    return user;
  } catch (error) {
    throw new Error(`Failed to create user: ${error.message}`);
  }
}

// Use proper error handling
app.post('/api/endpoint', async (c) => {
  try {
    // Route logic
    return c.json({ success: true });
  } catch (error) {
    return c.json({ error: 'Something went wrong' }, 500);
  }
});
```

### Frontend Standards (React/TypeScript)

```typescript
// Use proper TypeScript interfaces
interface ComponentProps {
  title: string;
  isLoading?: boolean;
  onSubmit: (data: FormData) => void;
}

// Use functional components with hooks
const MyComponent: React.FC<ComponentProps> = ({ 
  title, 
  isLoading = false, 
  onSubmit 
}) => {
  const [data, setData] = useState<FormData | null>(null);
  
  useEffect(() => {
    // Effect logic
  }, []);
  
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (data) {
      onSubmit(data);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <h2>{title}</h2>
      {/* Component JSX */}
    </form>
  );
};

export default MyComponent;
```

### CSS/Styling Standards

```css
/* Use Tailwind CSS utility classes */
<button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200">
  Submit
</button>

/* For custom styles, use descriptive class names */
.auth-form-container {
  @apply max-w-md mx-auto bg-white rounded-lg shadow-lg p-6;
}
```

## 🧪 Testing Guidelines

### Manual Testing

Before submitting any changes:

1. **Test all affected functionality**
2. **Test on multiple browsers** (Chrome, Firefox, Safari)
3. **Test responsive design** (mobile, tablet, desktop)
4. **Test error scenarios** (network failures, invalid inputs)
5. **Test edge cases** (empty states, long text, etc.)

### Test Checklist

**Authentication Flow:**
- [ ] Registration with valid/invalid data
- [ ] Login with valid/invalid credentials
- [ ] 2FA setup and verification
- [ ] Logout functionality
- [ ] Token persistence across sessions

**UI/UX:**
- [ ] Loading states display correctly
- [ ] Error messages are clear and helpful
- [ ] Forms validate properly
- [ ] Navigation works as expected
- [ ] Responsive design on all screen sizes

## 📚 Documentation

### When to Update Documentation

- **New features**: Add usage examples and API documentation
- **Bug fixes**: Update if the fix changes documented behavior
- **Breaking changes**: Clearly document migration steps
- **API changes**: Update endpoint documentation

### Documentation Standards

- **Use clear, concise language**
- **Include code examples**
- **Add screenshots for UI changes**
- **Update README files**
- **Add inline comments for complex code**

## 🔒 Security Considerations

Security is paramount in an authentication system. When contributing:

### Security Best Practices

- **Never hardcode secrets** or credentials
- **Validate all inputs** on both client and server
- **Use prepared statements** for database queries
- **Implement proper error handling** without exposing sensitive information
- **Follow OWASP guidelines** for web application security

### Security Review Process

- **All security-related changes** require additional review
- **Report security vulnerabilities** privately to maintainers
- **Include security impact** in PR descriptions
- **Test security features** thoroughly

### Common Security Pitfalls to Avoid

- ❌ Storing passwords in plain text
- ❌ Exposing sensitive data in error messages
- ❌ Missing input validation
- ❌ Improper JWT handling
- ❌ Weak password requirements

## 🆘 Getting Help

### Communication Channels

- **GitHub Issues**: For bug reports and feature requests
- **GitHub Discussions**: For questions and general discussion
- **Email**: [maintainer-email] for security issues

### Before Asking for Help

1. **Check existing documentation**
2. **Search closed issues** for similar problems
3. **Review the troubleshooting guide**
4. **Try debugging steps** mentioned in documentation

### When Asking for Help

- **Provide context** about what you're trying to achieve
- **Include error messages** and stack traces
- **Share relevant code snippets**
- **Mention your environment** (OS, Node version, etc.)

## 🎉 Recognition

Contributors will be recognized in:

- **README.md** contributor section
- **Release notes** for significant contributions
- **Hall of Fame** for outstanding contributors

## 📄 License

By contributing to Auth App, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Auth App! Your efforts help make this project better for everyone. 🚀 