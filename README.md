# 📊 Benford's Law Analyzer

A comprehensive web-based tool for analyzing numerical data against Benford's Law distribution patterns. Perfect for fraud detection, data validation, and statistical analysis.

## 🌟 Features

### 📥 Data Input
- **CSV Upload**: Support for files up to 1MB with automatic column detection
- **Multi-column Support**: Select specific columns from CSV files
- **Text Input**: Paste numbers separated by commas, tabs, or newlines
- **Data Validation**: Automatic cleaning and validation of numerical data

### 🔍 Benford Analysis
- **First Digit Extraction**: Analyzes the distribution of first significant digits (1-9)
- **Statistical Comparison**: Compares observed vs expected Benford distribution
- **Anomaly Detection**: Configurable threshold for detecting deviations
- **Comprehensive Results**: Detailed breakdown with counts, percentages, and differences

### 📊 Visualization
- **Interactive Charts**: Bar chart comparison using Chart.js
- **Results Table**: Sortable table with anomaly highlighting
- **Dark Mode**: Toggle between light and dark themes
- **Responsive Design**: Mobile-first responsive layout

### 🎲 Test Data Generator
- **Benford-Conforming Data**: Generate test datasets that follow Benford's Law
- **Multiple Formats**: Integer, currency, and decimal number types
- **Configurable Size**: Generate 10 to 10,000 records
- **Export Options**: Download generated data as CSV

### 🛠 Utility Features
- **Export Results**: Download analysis results as CSV
- **Clear/Reset**: Easy data clearing functionality
- **Error Handling**: Graceful handling of invalid data
- **Toast Notifications**: User-friendly feedback system

## 🚀 Quick Start

### Local Development
```bash
# Clone or download the project
cd benfords-law-app

# Start local server
npm start
# or
python3 -m http.server 8000

# Open browser to http://localhost:8000
```

### Netlify Deployment
1. Connect your repository to Netlify
2. Set build command: `echo 'Static site deployment'`
3. Set publish directory: `.` (root)
4. Deploy!

## 📖 How to Use

1. **Upload Data**: 
   - Upload a CSV file or paste numbers directly
   - For multi-column CSV, select the column to analyze

2. **Configure Analysis**:
   - Set anomaly detection threshold (default: 5%)
   - Click "Analyze Data" to run the analysis

3. **Review Results**:
   - View the comparison chart
   - Check the detailed results table
   - Look for anomaly alerts

4. **Generate Test Data** (Optional):
   - Use the data generator to create Benford-conforming datasets
   - Experiment with different number types and sizes

## 🧮 About Benford's Law

Benford's Law states that in many naturally occurring datasets, the first digit follows a logarithmic distribution:

- Digit 1: ~30.1% of the time
- Digit 2: ~17.6% of the time
- Digit 3: ~12.5% of the time
- ...
- Digit 9: ~4.6% of the time

The mathematical formula is: **P(d) = log₁₀(1 + 1/d)**

### Applications
- **Fraud Detection**: Identifying manipulated financial data
- **Data Quality**: Validating naturally occurring datasets
- **Forensic Accounting**: Detecting irregularities in accounting records
- **Scientific Research**: Analyzing measurement data

## 🔧 Technical Details

### Technologies Used
- **Frontend**: HTML5, CSS3 (Tailwind CSS), Vanilla JavaScript
- **Visualization**: Chart.js
- **Deployment**: Netlify (static hosting)
- **File Processing**: Client-side CSV parsing

### Browser Support
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

### File Limitations
- CSV files: Maximum 1MB
- Supported formats: .csv
- Number formats: Integers, decimals, currency (with automatic cleaning)

## 🎯 Use Cases

### Financial Analysis
- Audit financial statements
- Detect potential fraud in expense reports
- Validate accounting data integrity

### Scientific Data
- Analyze measurement datasets
- Validate experimental results
- Check for data manipulation

### Business Intelligence
- Validate sales figures
- Analyze customer transaction data
- Quality control for data imports

## 🔒 Privacy & Security

- **Client-Side Processing**: All data processing happens in your browser
- **No Data Storage**: No data is sent to external servers
- **Secure Headers**: Security headers configured for Netlify deployment
- **Local Analysis**: Your sensitive data never leaves your device

## 🤝 Contributing

This is a static web application built with vanilla JavaScript. To contribute:

1. Fork the repository
2. Make your changes
3. Test locally using `npm start`
4. Submit a pull request

## 📄 License

MIT License - feel free to use this tool for personal or commercial projects.

## 🆘 Support

If you encounter issues:
1. Check that your data contains valid positive numbers
2. Ensure CSV files are properly formatted
3. Try the test data generator to verify functionality
4. Check browser console for error messages

---

**Built with ❤️ using Cascade AI**
