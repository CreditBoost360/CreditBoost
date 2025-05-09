# Multi-Language Support Guide

This document provides a comprehensive guide to the multi-language support feature in CreditBoost.

## Overview

CreditBoost offers multi-language support to make the platform accessible to users from different linguistic backgrounds. The system automatically detects the user's preferred language and provides translated content throughout the application.

## Supported Languages

Currently, CreditBoost supports the following languages:

- English (en) 🇬🇧
- Kiswahili (sw) 🇰🇪
- French (fr) 🇫🇷
- Spanish (es) 🇪🇸
- Arabic (ar) 🇸🇦
- Chinese (zh) 🇨🇳

## Features

### Language Switcher

The Language Switcher component allows users to manually select their preferred language:
- Located in the navigation bar
- Shows current language with flag
- Dropdown menu with all available languages
- Persists language preference across sessions

### Automatic Language Detection

The system automatically detects the user's preferred language based on:
- Browser language settings
- Previous language selection (stored in localStorage)
- Geographic location (if available)

### Translated Content

The following content is available in multiple languages:
- User interface elements
- Error messages and notifications
- Financial insights and recommendations
- Credit passport and documents
- Help and support content

## How to Use

### Changing Your Language

1. Look for the language icon in the navigation bar
2. Click on it to open the language dropdown
3. Select your preferred language
4. The interface will immediately update to the selected language

### Setting Default Language

1. Change to your preferred language using the language switcher
2. The system will remember your choice for future sessions
3. You can change your language at any time

### Using Translated Documents

1. When downloading documents (like the Credit Passport)
2. The document will be generated in your currently selected language
3. You can switch languages before downloading to get the document in a different language

## Technical Details

### Translation System

The translation system uses:
- A context-based approach with React Context API
- JSON translation files for each supported language
- Dynamic loading of translations
- Fallback to English for missing translations

### Adding New Languages

For developers who want to add support for new languages:
1. Create a new translation file in the translations directory
2. Add the language to the supported languages list
3. Translate all key-value pairs
4. Add the language to the language switcher component

### Translation Keys

The system uses a key-based approach for translations:
- Keys follow a hierarchical structure (e.g., `app.name`, `common.save`)
- Placeholders can be used for dynamic content
- HTML formatting is supported in translations

## Best Practices

### For Users

- Set your preferred language when you first use the application
- Report any untranslated content or incorrect translations
- Use the language that you're most comfortable with for important financial information

### For Developers

- Always use translation keys instead of hardcoded text
- Test the application in all supported languages
- Ensure that all new features include translations for all supported languages
- Consider text expansion/contraction in different languages when designing UI

## Troubleshooting

### Common Issues

**Language not changing**
- Clear your browser cache
- Ensure you've selected the correct language
- Try refreshing the page

**Missing translations**
- Some newer content might not be translated yet
- Report missing translations to support
- The system will fall back to English for untranslated content

**Text overflow or layout issues**
- Some languages may require more space than others
- Report layout issues to support
- Try adjusting your browser's zoom level

## Support

For additional support with language settings or to report translation issues, please contact support@creditboost.co.ke.