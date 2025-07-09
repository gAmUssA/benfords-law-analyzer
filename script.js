// Benford's Law Analyzer - Main JavaScript

class BenfordAnalyzer {
    constructor() {
        this.chart = null;
        this.currentData = null;
        this.currentChartType = 'bar';
        this.benfordExpected = this.calculateBenfordExpected();
        this.initializeEventListeners();
        this.initializeDarkMode();
    }

    // Calculate Benford's Law expected distribution
    calculateBenfordExpected() {
        const expected = {};
        for (let d = 1; d <= 9; d++) {
            expected[d] = Math.log10(1 + 1/d) * 100;
        }
        return expected;
    }

    // Initialize event listeners
    initializeEventListeners() {
        document.getElementById('fileInput').addEventListener('change', (e) => this.handleFileUpload(e));
        document.getElementById('analyzeBtn').addEventListener('click', () => this.analyzeData());
        document.getElementById('clearBtn').addEventListener('click', () => this.clearAll());
        document.getElementById('generateBtn').addEventListener('click', () => this.generateTestData());
        document.getElementById('downloadBtn').addEventListener('click', () => this.downloadGeneratedData());
        document.getElementById('exportBtn').addEventListener('click', () => this.exportResults());
        document.getElementById('darkModeToggle').addEventListener('click', () => this.toggleDarkMode());
        document.getElementById('columnSelect').addEventListener('change', () => this.handleColumnChange());
        
        // Chart type toggle buttons
        document.getElementById('barChartBtn').addEventListener('click', () => this.setChartType('bar'));
        document.getElementById('cumulativeChartBtn').addEventListener('click', () => this.setChartType('cumulative'));
        
        // Explainer button
        document.getElementById('explainerBtn')?.addEventListener('click', () => this.toggleExplainer());
    }

    // Dark mode functionality
    initializeDarkMode() {
        const isDark = localStorage.getItem('darkMode') === 'true' || 
                      (!localStorage.getItem('darkMode') && window.matchMedia('(prefers-color-scheme: dark)').matches);
        
        if (isDark) {
            document.documentElement.classList.add('dark');
        }
    }

    toggleDarkMode() {
        document.documentElement.classList.toggle('dark');
        const isDark = document.documentElement.classList.contains('dark');
        localStorage.setItem('darkMode', isDark);
    }

    // File upload handler
    async handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Check file size (1MB limit)
        if (file.size > 1024 * 1024) {
            this.showError('File size exceeds 1MB limit');
            return;
        }

        // Check file type
        if (!file.name.toLowerCase().endsWith('.csv')) {
            this.showError('Please upload a CSV file');
            return;
        }

        try {
            const text = await file.text();
            this.parseCSV(text);
        } catch (error) {
            this.showError('Error reading file: ' + error.message);
        }
    }

    // Parse CSV and handle multi-column selection
    parseCSV(csvText) {
        const lines = csvText.trim().split('\n');
        if (lines.length === 0) {
            this.showError('Empty CSV file');
            return;
        }

        // Parse first line to detect columns
        const firstLine = lines[0];
        const columns = this.parseCSVLine(firstLine);
        
        if (columns.length > 1) {
            // Multiple columns detected - show column selector
            this.showColumnSelector(columns, csvText);
        } else {
            // Single column - process directly
            this.processCSVData(csvText, 0);
        }
    }

    // Parse a single CSV line
    parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        
        result.push(current.trim());
        return result;
    }

    // Show column selector for multi-column CSV
    showColumnSelector(columns, csvText) {
        const selector = document.getElementById('columnSelection');
        const select = document.getElementById('columnSelect');
        
        select.innerHTML = '';
        columns.forEach((col, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = `Column ${index + 1}: ${col.substring(0, 30)}${col.length > 30 ? '...' : ''}`;
            select.appendChild(option);
        });
        
        selector.classList.remove('hidden');
        this.currentCSV = csvText;
    }

    // Handle column selection change
    handleColumnChange() {
        if (this.currentCSV) {
            const columnIndex = parseInt(document.getElementById('columnSelect').value);
            this.processCSVData(this.currentCSV, columnIndex);
        }
    }

    // Process CSV data for a specific column
    processCSVData(csvText, columnIndex) {
        const lines = csvText.trim().split('\n');
        const numbers = [];
        
        for (let i = 0; i < lines.length; i++) {
            const columns = this.parseCSVLine(lines[i]);
            if (columns[columnIndex]) {
                const cleaned = this.cleanNumber(columns[columnIndex]);
                if (cleaned !== null) {
                    numbers.push(cleaned);
                }
            }
        }
        
        if (numbers.length === 0) {
            this.showError('No valid numbers found in selected column');
            return;
        }
        
        document.getElementById('textInput').value = numbers.join('\n');
        this.showSuccess(`Loaded ${numbers.length} numbers from CSV`);
    }

    // Clean and validate a number
    cleanNumber(str) {
        // Remove currency symbols, commas, whitespace
        const cleaned = str.replace(/[$,\s%]/g, '').trim();
        
        // Check if it's a valid number
        const num = parseFloat(cleaned);
        if (isNaN(num) || num <= 0) {
            return null;
        }
        
        return num;
    }

    // Extract first significant digit
    getFirstDigit(number) {
        const str = Math.abs(number).toString();
        const firstChar = str.replace(/^0+/, '')[0];
        const digit = parseInt(firstChar);
        return (digit >= 1 && digit <= 9) ? digit : null;
    }

    // Analyze data
    analyzeData() {
        const textInput = document.getElementById('textInput').value.trim();
        if (!textInput) {
            this.showError('Please provide data to analyze');
            return;
        }

        // Parse input data
        const rawNumbers = textInput.split(/[,\t\n]+/).map(s => s.trim()).filter(s => s);
        const numbers = [];
        
        for (const raw of rawNumbers) {
            const cleaned = this.cleanNumber(raw);
            if (cleaned !== null) {
                numbers.push(cleaned);
            }
        }

        if (numbers.length === 0) {
            this.showError('No valid numbers found in input');
            return;
        }

        if (numbers.length < 10) {
            this.showWarning('Small sample size may not follow Benford\'s Law reliably');
        }

        // Calculate digit frequencies
        const digitCounts = {};
        for (let d = 1; d <= 9; d++) {
            digitCounts[d] = 0;
        }

        let validNumbers = 0;
        for (const num of numbers) {
            const firstDigit = this.getFirstDigit(num);
            if (firstDigit !== null) {
                digitCounts[firstDigit]++;
                validNumbers++;
            }
        }

        if (validNumbers === 0) {
            this.showError('No valid first digits found');
            return;
        }

        // Calculate percentages and differences
        const results = [];
        const threshold = parseFloat(document.getElementById('thresholdInput').value) || 5;
        let hasAnomalies = false;
        const anomalies = [];

        for (let d = 1; d <= 9; d++) {
            const count = digitCounts[d];
            const observed = (count / validNumbers) * 100;
            const expected = this.benfordExpected[d];
            const difference = Math.abs(observed - expected);
            
            const isAnomaly = difference > threshold;
            if (isAnomaly) {
                hasAnomalies = true;
                anomalies.push(d);
            }

            results.push({
                digit: d,
                count: count,
                observed: observed,
                expected: expected,
                difference: difference,
                isAnomaly: isAnomaly
            });
        }

        // Calculate statistical tests
        const observedPercentages = results.map(r => r.observed);
        const expectedPercentages = results.map(r => r.expected);
        const chiSquaredTest = this.calculateChiSquared(observedPercentages, expectedPercentages, validNumbers);
        const madTest = this.calculateMAD(observedPercentages, expectedPercentages);
        
        // Store results
        this.currentData = {
            results: results,
            total: validNumbers,
            hasAnomalies: anomalies.length > 0,
            anomalies: anomalies,
            threshold: threshold,
            chiSquared: chiSquaredTest,
            mad: madTest
        };

        this.displayResults();
        this.updateChart();
        this.checkAnomalies();
    }

    // Display results in table
    displayResults() {
        const tbody = document.getElementById('resultsBody');
        tbody.innerHTML = '';
        
        this.currentData.results.forEach(result => {
            const row = tbody.insertRow();
            const anomalyClass = result.isAnomaly ? 'anomaly-row' : '';
            row.className = anomalyClass;
            
            row.insertCell(0).textContent = result.digit;
            row.insertCell(1).textContent = result.count;
            row.insertCell(2).textContent = result.observed.toFixed(1) + '%';
            row.insertCell(3).textContent = result.expected.toFixed(1) + '%';
            row.insertCell(4).textContent = result.difference.toFixed(1) + '%';
        });
        
        // Display statistical tests and advanced analytics
        this.displayStatisticalTests();
        this.displayAdvancedAnalytics();
        document.getElementById('exportBtn').classList.remove('hidden');
    }
    
    // Display statistical test results
    displayStatisticalTests() {
        const testsDiv = document.getElementById('statisticalTests');
        testsDiv.classList.remove('hidden');
        
        // Chi-squared test results
        const chiSquared = this.currentData.chiSquared;
        document.getElementById('chiSquaredValue').textContent = chiSquared.value.toFixed(3);
        document.getElementById('chiSquaredPValue').textContent = chiSquared.pValue;
        document.getElementById('chiSquaredInterpretation').textContent = chiSquared.interpretation;
        
        const chiSquaredResult = document.getElementById('chiSquaredResult');
        if (chiSquared.isSignificant) {
            chiSquaredResult.className = 'mt-3 p-2 rounded bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700';
        } else {
            chiSquaredResult.className = 'mt-3 p-2 rounded bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700';
        }
        
        // MAD test results
        const mad = this.currentData.mad;
        document.getElementById('madValue').textContent = mad.value.toFixed(4);
        document.getElementById('madConformity').textContent = mad.conformity;
        document.getElementById('madInterpretation').textContent = mad.interpretation;
        
        const madConformitySpan = document.getElementById('madConformity');
        const madResult = document.getElementById('madResult');
        
        if (mad.conformity === 'High') {
            madConformitySpan.className = 'font-semibold text-green-600 dark:text-green-400';
            madResult.className = 'mt-3 p-2 rounded bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700';
        } else if (mad.conformity === 'Moderate') {
            madConformitySpan.className = 'font-semibold text-blue-600 dark:text-blue-400';
            madResult.className = 'mt-3 p-2 rounded bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700';
        } else if (mad.conformity === 'Marginal') {
            madConformitySpan.className = 'font-semibold text-yellow-600 dark:text-yellow-400';
            madResult.className = 'mt-3 p-2 rounded bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700';
        } else {
            madConformitySpan.className = 'font-semibold text-red-600 dark:text-red-400';
            madResult.className = 'mt-3 p-2 rounded bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700';
        }
    }
    
    // Display advanced analytics
    displayAdvancedAnalytics() {
        const analyticsDiv = document.getElementById('advancedAnalytics');
        if (!analyticsDiv) {
            console.error('Advanced analytics div not found');
            return;
        }
        
        analyticsDiv.classList.remove('hidden');
        
        // Calculate advanced metrics
        const deviations = this.currentData.results.map(r => Math.abs(r.difference));
        const maxDeviation = Math.max(...deviations);
        const avgDeviation = deviations.reduce((a, b) => a + b, 0) / deviations.length;
        const conformityScore = Math.max(0, 100 - (avgDeviation * 10)); // Simple scoring algorithm
        
        // Update metrics display
        const maxDeviationEl = document.getElementById('maxDeviation');
        const avgDeviationEl = document.getElementById('avgDeviation');
        const conformityScoreEl = document.getElementById('conformityScore');
        
        if (maxDeviationEl) maxDeviationEl.textContent = maxDeviation.toFixed(1) + '%';
        if (avgDeviationEl) avgDeviationEl.textContent = avgDeviation.toFixed(1) + '%';
        if (conformityScoreEl) conformityScoreEl.textContent = conformityScore.toFixed(0);
        
        // Generate heatmap
        this.generateHeatmap();
    }
    
    // Toggle explainer modal
    toggleExplainer() {
        const modal = document.getElementById('explainerModal');
        if (!modal) {
            console.error('Explainer modal not found');
            return;
        }
        
        if (modal.classList.contains('hidden')) {
            modal.classList.remove('hidden');
            
            // Close button functionality
            const closeBtn = modal.querySelector('.close-modal');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    modal.classList.add('hidden');
                });
            }
            
            // Close when clicking outside
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.add('hidden');
                }
            });
        } else {
            modal.classList.add('hidden');
        }
    }
    
    // Generate digit deviation heatmap
    generateHeatmap() {
        const heatmapContainer = document.getElementById('digitHeatmap');
        heatmapContainer.innerHTML = '';
        
        const maxDeviation = Math.max(...this.currentData.results.map(r => Math.abs(r.difference)));
        
        this.currentData.results.forEach(result => {
            const cell = document.createElement('div');
            const deviation = Math.abs(result.difference);
            const intensity = deviation / maxDeviation;
            
            // Color intensity based on deviation
            const red = Math.round(255 * intensity);
            const green = Math.round(255 * (1 - intensity));
            const blue = 50;
            
            cell.className = 'w-8 h-8 rounded flex items-center justify-center text-xs font-bold text-white cursor-pointer transition-transform hover:scale-110';
            cell.style.backgroundColor = `rgb(${red}, ${green}, ${blue})`;
            cell.textContent = result.digit;
            cell.title = `Digit ${result.digit}: ${deviation.toFixed(1)}% deviation`;
            
            heatmapContainer.appendChild(cell);
        });
    }
    
    // Chart type management
    setChartType(type) {
        this.currentChartType = type;
        this.updateChart();
        
        // Update button states
        const barBtn = document.getElementById('barChartBtn');
        const cumulativeBtn = document.getElementById('cumulativeChartBtn');
        
        if (type === 'bar') {
            barBtn.className = 'bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded-md transition-colors duration-200';
            cumulativeBtn.className = 'bg-gray-400 hover:bg-gray-500 text-white text-sm px-3 py-1 rounded-md transition-colors duration-200';
        } else {
            barBtn.className = 'bg-gray-400 hover:bg-gray-500 text-white text-sm px-3 py-1 rounded-md transition-colors duration-200';
            cumulativeBtn.className = 'bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded-md transition-colors duration-200';
        }
    }

    // Update chart
    updateChart() {
        if (!this.currentData || !this.currentData.results) {
            console.log('No data available for chart');
            return;
        }
        
        // Check if Chart.js is available
        if (typeof Chart === 'undefined') {
            console.error('Chart.js not loaded');
            this.showError('Chart library not available. Please refresh the page.');
            return;
        }
        
        // Destroy existing chart first
        if (this.chart) {
            this.chart.destroy();
            this.chart = null;
        }
        
        // Get canvas element
        let canvas = document.getElementById('benfordChart');
        if (!canvas) {
            console.error('Chart canvas not found');
            return;
        }
        
        // Force canvas to be visible and properly sized
        canvas.style.display = 'block';
        canvas.style.width = '100%';
        canvas.style.height = '400px';
        
        // Get the container and ensure it's visible
        const container = canvas.parentElement;
        if (container) {
            container.style.display = 'block';
            container.style.position = 'relative';
            container.style.height = '400px';
        }
        
        // Reset canvas dimensions
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        
        // Create a new canvas element if context acquisition fails
        let ctx;
        try {
            ctx = canvas.getContext('2d');
            if (!ctx) {
                console.error('Could not get 2D context from canvas, trying alternative approach');
                
                // Replace the canvas with a new one
                const newCanvas = document.createElement('canvas');
                newCanvas.id = 'benfordChart';
                newCanvas.style.width = '100%';
                newCanvas.style.height = '400px';
                newCanvas.width = canvas.clientWidth;
                newCanvas.height = canvas.clientHeight;
                
                if (container) {
                    container.innerHTML = '';
                    container.appendChild(newCanvas);
                    canvas = newCanvas;
                    ctx = canvas.getContext('2d');
                    
                    if (!ctx) {
                        console.error('Still could not get 2D context from new canvas');
                        return;
                    }
                } else {
                    console.error('Could not find container to replace canvas');
                    return;
                }
            }
        } catch (error) {
            console.error('Error getting canvas context:', error);
            return;
        }
        
        // Prepare data for chart
        const labels = this.currentData.results.map(r => `${r.digit}`);
        const observedData = this.currentData.results.map(r => r.observed);
        const expectedData = this.currentData.results.map(r => r.expected);
        
        console.log('Chart data prepared:', { labels, observedData, expectedData });
        
        // Create chart based on type
        try {
            const chartType = this.currentChartType || 'bar';
            console.log('Creating chart of type:', chartType);
            
            if (chartType === 'cumulative') {
                this.createCumulativeChart(ctx, labels, observedData, expectedData);
            } else {
                this.createBarChart(ctx, labels, observedData, expectedData);
            }
            
            console.log('Chart created successfully');
        } catch (error) {
            console.error('Error creating chart:', error);
            this.showError('Failed to create chart. Please try again.');
        }
    }
    
    // Create bar chart
    createBarChart(ctx, labels, observedData, expectedData) {
        if (!ctx || !labels || !observedData || !expectedData) {
            console.error('Missing required data for bar chart');
            return;
        }
        
        try {
            this.chart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: 'Observed (%)',
                            data: observedData,
                            backgroundColor: 'rgba(54, 162, 235, 0.7)',
                            borderColor: 'rgba(54, 162, 235, 1)',
                            borderWidth: 1
                        },
                        {
                            label: 'Expected (Benford\'s Law) (%)',
                            data: expectedData,
                            backgroundColor: 'rgba(255, 99, 132, 0.5)',
                            borderColor: 'rgba(255, 99, 132, 1)',
                            borderWidth: 1,
                            type: 'line',
                            pointRadius: 5
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Frequency (%)'
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'First Digit'
                            }
                        }
                    },
                    plugins: {
                        title: {
                            display: true,
                            text: 'Benford\'s Law Analysis'
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return `${context.dataset.label}: ${context.raw.toFixed(1)}%`;
                                }
                            }
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Error creating bar chart:', error);
            throw error;
        }
    }
    
    // Create cumulative distribution chart
    createCumulativeChart(ctx, labels, observedData, expectedData) {
        if (!ctx || !labels || !this.currentData || !this.currentData.results) {
            console.error('Missing required data for cumulative chart');
            return;
        }
        
        try {
            // Calculate cumulative values
            let observedCumulative = [];
            let expectedCumulative = [];
            let observedSum = 0;
            let expectedSum = 0;
            
            this.currentData.results.forEach(result => {
                observedSum += result.observed;
                expectedSum += result.expected;
                observedCumulative.push(observedSum);
                expectedCumulative.push(expectedSum);
            });
            
            this.chart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: 'Observed Cumulative %',
                            data: observedCumulative,
                            borderColor: 'rgba(59, 130, 246, 1)',
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            borderWidth: 3,
                            fill: true,
                            tension: 0.1
                        },
                        {
                            label: 'Benford Expected Cumulative %',
                            data: expectedCumulative,
                            borderColor: 'rgba(239, 68, 68, 1)',
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            borderWidth: 3,
                            fill: true,
                            tension: 0.1
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Cumulative Distribution Analysis'
                        },
                        legend: {
                            display: true,
                            position: 'top'
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100,
                            title: {
                            display: true,
                            text: 'Cumulative Percentage (%)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'First Digit'
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });
        } catch (error) {
            console.error('Error creating cumulative chart:', error);
            throw error;
        }
    }

    // Calculate χ² (chi-squared) goodness-of-fit test
    calculateChiSquared(observed, expected, total) {
        let chiSquared = 0;
        const degreesOfFreedom = 8; // 9 digits - 1
        
        for (let i = 0; i < observed.length; i++) {
            const observedCount = (observed[i] / 100) * total;
            const expectedCount = (expected[i] / 100) * total;
            
            if (expectedCount > 0) {
                chiSquared += Math.pow(observedCount - expectedCount, 2) / expectedCount;
            }
        }
        
        // Critical values for χ² test at different significance levels
        const criticalValues = {
            0.05: 15.507, // 95% confidence
            0.01: 20.090, // 99% confidence
            0.001: 26.125 // 99.9% confidence
        };
        
        let significance = null;
        let pValue = null;
        
        if (chiSquared > criticalValues[0.001]) {
            significance = 0.001;
            pValue = '< 0.001';
        } else if (chiSquared > criticalValues[0.01]) {
            significance = 0.01;
            pValue = '< 0.01';
        } else if (chiSquared > criticalValues[0.05]) {
            significance = 0.05;
            pValue = '< 0.05';
        } else {
            pValue = '> 0.05';
        }
        
        return {
            value: chiSquared,
            degreesOfFreedom,
            pValue,
            significance,
            isSignificant: significance !== null,
            interpretation: this.interpretChiSquared(significance)
        };
    }
    
    // Calculate MAD (Mean Absolute Deviation) test
    calculateMAD(observed, expected) {
        let totalDeviation = 0;
        
        for (let i = 0; i < observed.length; i++) {
            totalDeviation += Math.abs(observed[i] - expected[i]);
        }
        
        const mad = totalDeviation / observed.length;
        
        // MAD thresholds based on research
        const thresholds = {
            acceptable: 0.006, // < 0.006 suggests conformity
            marginal: 0.012,   // 0.006-0.012 suggests marginal conformity
            nonconforming: 0.015 // > 0.015 suggests non-conformity
        };
        
        let conformity = 'High';
        let interpretation = 'Data closely follows Benford\'s Law';
        
        if (mad > thresholds.nonconforming) {
            conformity = 'Low';
            interpretation = 'Data significantly deviates from Benford\'s Law';
        } else if (mad > thresholds.marginal) {
            conformity = 'Marginal';
            interpretation = 'Data shows some deviation from Benford\'s Law';
        } else if (mad > thresholds.acceptable) {
            conformity = 'Moderate';
            interpretation = 'Data reasonably follows Benford\'s Law';
        }
        
        return {
            value: mad,
            conformity,
            interpretation,
            thresholds
        };
    }
    
    // Interpret χ² test results
    interpretChiSquared(significance) {
        if (!significance) {
            return 'Data is consistent with Benford\'s Law (no significant deviation detected)';
        } else if (significance === 0.05) {
            return 'Data shows significant deviation from Benford\'s Law (95% confidence)';
        } else if (significance === 0.01) {
            return 'Data shows highly significant deviation from Benford\'s Law (99% confidence)';
        } else if (significance === 0.001) {
            return 'Data shows extremely significant deviation from Benford\'s Law (99.9% confidence)';
        }
    }
    
    // Check for anomalies
    checkAnomalies() {
        const alertDiv = document.getElementById('anomalyAlert');
        const messageDiv = document.getElementById('anomalyMessage');
        
        if (this.currentData.hasAnomalies) {
            const anomalyDigits = this.currentData.anomalies.join(', ');
            messageDiv.textContent = `Digits ${anomalyDigits} deviate by more than ${this.currentData.threshold}% from Benford's Law expected distribution.`;
            alertDiv.classList.remove('hidden');
            alertDiv.classList.add('alert-enter');
        } else {
            alertDiv.classList.add('hidden');
        }
    }

    // Generate Benford-conforming test data
    generateTestData() {
        const count = parseInt(document.getElementById('recordCount').value) || 500;
        const type = document.getElementById('numberType').value;
        
        if (count < 10 || count > 10000) {
            this.showError('Number of records must be between 10 and 10,000');
            return;
        }
        
        const numbers = [];
        
        for (let i = 0; i < count; i++) {
            // Use inverse transform sampling for Benford distribution
            const rand = Math.random();
            let digit = 1;
            let cumulative = 0;
            
            for (let d = 1; d <= 9; d++) {
                cumulative += this.benfordExpected[d] / 100;
                if (rand <= cumulative) {
                    digit = d;
                    break;
                }
            }
            
            // Generate trailing digits
            const trailingDigits = Math.floor(Math.random() * 1000000);
            let number = parseFloat(digit + trailingDigits.toString());
            
            // Format based on type
            switch (type) {
                case 'currency':
                    number = number / 100;
                    break;
                case 'decimal':
                    number = number / 100;
                    break;
                case 'integer':
                default:
                    number = Math.floor(number);
                    break;
            }
            
            numbers.push(number);
        }
        
        // Format numbers for display
        let formattedNumbers;
        switch (type) {
            case 'currency':
                formattedNumbers = numbers.map(n => n.toFixed(2));
                break;
            case 'decimal':
                formattedNumbers = numbers.map(n => n.toFixed(2));
                break;
            default:
                formattedNumbers = numbers.map(n => n.toString());
        }
        
        document.getElementById('textInput').value = formattedNumbers.join('\n');
        document.getElementById('downloadBtn').classList.remove('hidden');
        this.generatedData = formattedNumbers;
        
        this.showSuccess(`Generated ${count} Benford-conforming numbers`);
    }

    // Download generated data as CSV
    downloadGeneratedData() {
        if (!this.generatedData) return;
        
        const csv = 'Number\n' + this.generatedData.join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'benford_test_data.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Export analysis results
    exportResults() {
        if (!this.currentData) return;
        
        const csv = [
            'Digit,Count,Observed %,Expected %,Difference %',
            ...this.currentData.results.map(r => 
                `${r.digit},${r.count},${r.observed.toFixed(1)},${r.expected.toFixed(1)},${r.difference.toFixed(1)}`
            )
        ].join('\n');
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'benford_analysis_results.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Clear all data
    clearAll() {
        document.getElementById('textInput').value = '';
        document.getElementById('fileInput').value = '';
        document.getElementById('columnSelection').classList.add('hidden');
        document.getElementById('resultsTable').innerHTML = '<p class="text-gray-500 dark:text-gray-400 text-center py-8">Upload or paste data to see analysis results</p>';
        document.getElementById('anomalyAlert').classList.add('hidden');
        document.getElementById('exportBtn').classList.add('hidden');
        document.getElementById('downloadBtn').classList.add('hidden');
        
        if (this.chart) {
            this.chart.destroy();
            this.chart = null;
        }
        
        this.currentData = null;
        this.currentCSV = null;
        this.generatedData = null;
    }

    // Utility functions for user feedback
    showError(message) {
        this.showMessage(message, 'error');
    }

    showWarning(message) {
        this.showMessage(message, 'warning');
    }

    showSuccess(message) {
        this.showMessage(message, 'success');
    }

    showMessage(message, type) {
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = `fixed top-20 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm transition-all duration-300 transform translate-x-full`;
        
        const colors = {
            error: 'bg-red-500 text-white',
            warning: 'bg-yellow-500 text-white',
            success: 'bg-green-500 text-white'
        };
        
        toast.className += ` ${colors[type]}`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        // Animate in
        setTimeout(() => {
            toast.classList.remove('translate-x-full');
        }, 100);
        
        // Remove after 5 seconds
        setTimeout(() => {
            toast.classList.add('translate-x-full');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 5000);
    }
}

// Initialize the analyzer when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new BenfordAnalyzer();
});
