# Contributing to CreditBoost

Thank you for your interest in contributing to CreditBoost! This document provides guidelines and instructions for contributing to this project.

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. Please be respectful and considerate of others.

## How Can I Contribute?

### Reporting Bugs

- Check if the bug has already been reported in the Issues section
- Use the bug report template when creating a new issue
- Include detailed steps to reproduce the bug
- Add screenshots if applicable
- Describe the expected behavior and what actually happened

### Suggesting Enhancements

- Check if the enhancement has already been suggested in the Issues section
- Use the feature request template when creating a new issue
- Provide a clear description of the proposed enhancement
- Explain why this enhancement would be useful to most users

### Pull Requests

1. Fork the repository
2. Create a new branch for your feature or bug fix
3. Make your changes
4. Run tests to ensure your changes don't break existing functionality
5. Submit a pull request with a clear description of the changes

## Development Setup

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB (for backend)

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/CreditBoost.git
   ```

2. Install dependencies
   ```
   cd CreditBoost
   npm install
   ```

3. Start the development server
   ```
   npm run dev
   ```

## Coding Guidelines

### JavaScript/React

- Use functional components with hooks
- Follow ESLint rules configured in the project
- Write meaningful component and function names
- Add JSDoc comments for complex functions
- Use proper prop types

### CSS/Styling

- Use Tailwind CSS for styling
- Follow the project's design system
- Ensure responsive design for all components

### Testing

- Write tests for new features
- Ensure all tests pass before submitting a pull request
- Aim for good test coverage

## Git Workflow

1. Create a branch from `main` with a descriptive name
   - Feature branches: `feature/your-feature-name`
   - Bug fix branches: `fix/issue-description`
   - Documentation branches: `docs/what-you-documented`

2. Make your changes in small, logical commits
   - Use clear commit messages that explain what and why
   - Format: `[type]: Short description` (e.g., `[feat]: Add language switcher`)

3. Push your branch and create a pull request
   - Reference any related issues in the PR description
   - Add reviewers who are familiar with the code you modified

## Release Process

1. Update the version in package.json according to SemVer
2. Update the CHANGELOG.md with the new version and changes
3. Create a new release on GitHub with release notes
4. Tag the release with the version number

## Questions?

If you have any questions about contributing, please reach out to the maintainers at developers@creditboost.co.ke.

Thank you for contributing to CreditBoost!