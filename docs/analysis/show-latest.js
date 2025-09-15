#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function showLatestReport() {
  const reportsDir = path.join(__dirname, 'reports');

  if (!fs.existsSync(reportsDir)) {
    console.log('❌ No reports directory found. Run analysis first.');
    return;
  }

  const reports = fs.readdirSync(reportsDir)
    .filter(file => file.startsWith('analysis-') && file.endsWith('.md'))
    .map(file => ({
      name: file,
      path: path.join(reportsDir, file),
      timestamp: fs.statSync(path.join(reportsDir, file)).mtime
    }))
    .sort((a, b) => b.timestamp - a.timestamp)
    .map(report => report.name);

  if (reports.length === 0) {
    console.log('❌ No analysis reports found. Run analysis first.');
    return;
  }

  const latestReport = path.join(reportsDir, reports[0]);
  const content = fs.readFileSync(latestReport, 'utf8');

  // Extract executive summary
  const summaryMatch = content.match(/## 📊 Executive Summary([\s\S]*?)---/);
  const metricsMatch = content.match(/## 🎯 Key Metrics([\s\S]*?)---/);

  console.log('📊 Latest Code Quality Analysis Results');
  console.log('=' .repeat(50));

  if (summaryMatch) {
    console.log(summaryMatch[1].trim());
  }

  if (metricsMatch) {
    console.log('\n🎯 Key Metrics');
    console.log('-'.repeat(30));
    console.log(metricsMatch[1].trim());
  }

  console.log('\n📄 Full Report:', latestReport);
  console.log('🔄 Run `npm run analyze` to generate a new analysis');
}

showLatestReport();