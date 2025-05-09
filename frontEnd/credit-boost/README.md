# CreditBoost Frontend

This is the frontend application for the CreditBoost platform, built with React and Tailwind CSS.

## 🌟 Features

### Universal Credit Passport
- **Official Document**: Generate a professional credit passport document with country information
- **Institution Stamps**: Allow financial institutions to add verification stamps
- **QR Code Verification**: Include QR codes for easy verification
- **Country Detection**: Automatically detect and display user's country with flag
- **Sharing Controls**: Share passport with controlled access

### Financial Dashboard
- **Data-Driven Insights**: Comprehensive analysis of financial data
- **Credit Score Visualization**: Interactive displays of credit score and factors
- **Budget Analysis**: Breakdown of income, expenses, and savings
- **Debt Management**: Strategies for debt reduction
- **Personalized Recommendations**: Tailored financial product recommendations

### Data Integration
- **Auto-Connect**: Automatically connect to financial data sources
- **Manual Upload**: Upload bank statements, M-Pesa transactions, and credit reports
- **Data Persistence**: Store data securely for future use
- **Real-Time Updates**: Keep financial information current

### Multi-Language Support
- **Language Switcher**: Toggle between multiple languages
- **Auto-Detection**: Detect user's preferred language
- **Localized Content**: Translated content throughout the application

## 🚀 Recent Enhancements

### Enhanced Credit Passport
- Added country detection with flags
- Implemented institution stamping system
- Created downloadable HTML passport document
- Added CreditBoost logo and branding
- Implemented sharing history and controls

### Comprehensive Financial Dashboard
- Added financial breakdown with visualizations
- Implemented credit score simulation tool
- Created personalized recommendation engine
- Added automatic data connection
- Enhanced data upload center

### Improved User Experience
- Added multi-language support
- Enhanced mobile responsiveness
- Improved accessibility features
- Streamlined data upload process

## 🔧 Technical Implementation

### Component Structure

```
src/
├── components/
│   ├── CreditPassport/
│   │   ├── EnhancedPassportDocument.jsx  # Generates downloadable passport
│   │   ├── PassportPreview.jsx           # Visual preview of passport
│   │   ├── StampModal.jsx                # Modal for adding institution stamps
│   │   └── EmbeddedLogo.jsx              # Base64 encoded logo for documents
│   ├── DataUploadCenter.jsx              # Manual data upload interface
│   ├── AutoConnectData.jsx               # Automatic data connection
│   ├── CreditSimulator.jsx               # Credit score simulation tool
│   ├── FinancialBreakdown.jsx            # Financial data analysis
│   ├── RecommendationEngine.jsx          # Personalized recommendations
│   ├── LanguageSwitcher.jsx              # Language selection component
│   └── ui/                               # UI components
├── context/
│   ├── AppContext.jsx                    # Application state management
│   └── TranslationContext.jsx            # Multi-language support
├── pages/
│   ├── CreditPassport.jsx                # Credit passport page
│   ├── FinancialDashboard.jsx            # Financial dashboard page
│   ├── DataConnectionPage.jsx            # Data connection page
│   └── ...                               # Other pages
└── ...
```

### Key Technologies

- **React**: Frontend framework
- **Tailwind CSS**: Styling
- **Context API**: State management
- **Recharts**: Data visualization
- **HTML5**: Downloadable documents

## 📦 Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/CreditBoost.git
   ```

2. Navigate to the frontend directory
   ```
   cd CreditBoost/frontEnd/credit-boost
   ```

3. Install dependencies
   ```
   npm install
   ```

4. Start the development server
   ```
   npm run dev
   ```

5. Access the application at `http://localhost:5173`

## 🧪 Testing

Run tests with:
```
npm test
```

## 🔨 Building for Production

Build the application for production:
```
npm run build
```

## 📱 Usage Guide

### Credit Passport

1. Navigate to the Credit Passport page
2. View your passport preview with country information
3. Download your official Credit Passport document
4. Add institution stamps for verification
5. Share your passport with financial institutions

### Financial Dashboard

1. Connect your financial data sources
2. View your comprehensive financial breakdown
3. Simulate credit score changes with different scenarios
4. Get personalized financial product recommendations
5. Track your financial progress over time

### Data Connection

1. Use the automatic connection feature for seamless integration
2. Alternatively, upload financial statements manually
3. View and manage your connected data sources
4. Refresh data as needed

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

Built with ❤️ by the CreditBoost Team