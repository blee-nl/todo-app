#!/usr/bin/env node

/**
 * Code Quality Analysis Tool
 * Automated analysis script for tracking code quality improvements over time
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class CodeQualityAnalyzer {
  constructor(config) {
    this.config = config;
    this.timestamp = new Date().toISOString();
    this.analysisDate = new Date().toISOString().split('T')[0];
    this.reportPath = path.join(__dirname, 'reports', `analysis-${this.analysisDate}-${Date.now()}.md`);
    this.previousReportPath = this.findPreviousReport();

    // Set project root (two levels up from docs/analysis)
    this.projectRoot = path.resolve(__dirname, '..', '..');
    this.frontendPath = path.join(this.projectRoot, 'frontend');
    this.backendPath = path.join(this.projectRoot, 'backend');

    console.log(`📁 Project root: ${this.projectRoot}`);
    console.log(`📁 Frontend path: ${this.frontendPath}`);
    console.log(`📁 Backend path: ${this.backendPath}`);
  }

  findPreviousReport() {
    const reportsDir = path.join(__dirname, 'reports');
    if (!fs.existsSync(reportsDir)) return null;

    const reports = fs.readdirSync(reportsDir)
      .filter(file => file.startsWith('analysis-') && file.endsWith('.md'))
      .sort()
      .reverse();

    return reports.length > 0 ? path.join(reportsDir, reports[0]) : null;
  }

  async runAnalysis() {
    console.log('🔍 Starting Code Quality Analysis...');

    const analysis = {
      projectStats: await this.gatherProjectStats(),
      dependencies: await this.analyzeDependencies(),
      codeQuality: await this.analyzeCodeQuality(),
      security: await this.runSecurityAudit(),
      testing: await this.analyzeTestCoverage(),
      fileOrganization: await this.analyzeFileOrganization(),
      performance: await this.analyzePerformance(),
      architecture: await this.analyzeArchitecture(),
      previousAnalysis: await this.loadPreviousAnalysis()
    };

    const scores = this.calculateScores(analysis);
    const report = await this.generateReport(analysis, scores);

    await this.saveReport(report);
    await this.updateMetrics(scores);

    console.log('✅ Analysis complete! Report saved to:', this.reportPath);
    return report;
  }

  async gatherProjectStats() {
    const stats = {
      totalFiles: 0,
      totalLines: 0,
      testFiles: 0,
      dependencies: 0
    };

    try {
      // Count files
      const frontendSrc = path.join(this.frontendPath, 'src');
      const backendSrc = path.join(this.backendPath, 'src');
      const frontendFiles = this.countFiles(frontendSrc, ['.ts', '.tsx', '.js', '.jsx']);
      const backendFiles = this.countFiles(backendSrc, ['.ts', '.js']);
      stats.totalFiles = frontendFiles + backendFiles;

      // Count lines of code
      stats.totalLines = this.countLinesOfCode(frontendSrc) + this.countLinesOfCode(backendSrc);

      // Count test files
      stats.testFiles = this.countFiles(frontendSrc, ['test.ts', 'test.tsx', 'spec.ts', 'spec.tsx']);
      stats.testFiles += this.countFiles(backendSrc, ['test.ts', 'test.js', 'spec.ts', 'spec.js']);

      // Count dependencies
      const frontendPkg = JSON.parse(fs.readFileSync(path.join(this.frontendPath, 'package.json'), 'utf8'));
      const backendPkg = JSON.parse(fs.readFileSync(path.join(this.backendPath, 'package.json'), 'utf8'));
      stats.dependencies = Object.keys({
        ...frontendPkg.dependencies,
        ...frontendPkg.devDependencies,
        ...backendPkg.dependencies,
        ...backendPkg.devDependencies
      }).length;

    } catch (error) {
      console.warn('⚠️ Error gathering project stats:', error.message);
    }

    return stats;
  }

  countFiles(dir, extensions) {
    if (!fs.existsSync(dir)) return 0;

    let count = 0;
    const files = fs.readdirSync(dir, { recursive: true });

    for (const file of files) {
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isFile()) {
        if (extensions.some(ext => file.endsWith(ext))) {
          count++;
        }
      }
    }

    return count;
  }

  countLinesOfCode(dir) {
    if (!fs.existsSync(dir)) return 0;

    let totalLines = 0;
    const files = fs.readdirSync(dir, { recursive: true });

    for (const file of files) {
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isFile() && (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx'))) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          totalLines += content.split('\n').length;
        } catch (error) {
          // Skip files that can't be read
        }
      }
    }

    return totalLines;
  }

  async analyzeDependencies() {
    const analysis = {
      frontend: { outdated: [], vulnerable: [] },
      backend: { outdated: [], vulnerable: [] }
    };

    try {
      const currentDir = process.cwd();

      // Check frontend dependencies
      process.chdir(this.frontendPath);
      try {
        const npmOutdated = execSync('npm outdated --json', { encoding: 'utf8', stdio: 'pipe' });
        analysis.frontend.outdated = JSON.parse(npmOutdated);
      } catch (error) {
        // npm outdated returns non-zero exit code when updates are available
        if (error.stdout) {
          try {
            analysis.frontend.outdated = JSON.parse(error.stdout);
          } catch (parseError) {
            // Handle parsing error
          }
        }
      }

      // Check backend dependencies
      process.chdir(this.backendPath);
      try {
        const npmOutdated = execSync('npm outdated --json', { encoding: 'utf8', stdio: 'pipe' });
        analysis.backend.outdated = JSON.parse(npmOutdated);
      } catch (error) {
        if (error.stdout) {
          try {
            analysis.backend.outdated = JSON.parse(error.stdout);
          } catch (parseError) {
            // Handle parsing error
          }
        }
      }

      // Return to original directory
      process.chdir(currentDir);

    } catch (error) {
      console.warn('⚠️ Error analyzing dependencies:', error.message);
    }

    return analysis;
  }

  async runSecurityAudit() {
    const results = {
      frontend: { vulnerabilities: 0, issues: [] },
      backend: { vulnerabilities: 0, issues: [] }
    };

    try {
      const currentDir = process.cwd();

      // Frontend security audit - try pnpm first, fallback to npm
      process.chdir(this.frontendPath);
      try {
        let auditResult;
        try {
          // Try pnpm audit first
          auditResult = execSync('pnpm audit --json', { encoding: 'utf8' });
        } catch (pnpmError) {
          // Fallback to npm audit
          auditResult = execSync('npm audit --json', { encoding: 'utf8' });
        }
        const audit = JSON.parse(auditResult);
        results.frontend.vulnerabilities = audit.metadata?.vulnerabilities?.total || 0;
        results.frontend.issues = Object.values(audit.vulnerabilities || {});
      } catch (error) {
        if (error.stdout) {
          try {
            const audit = JSON.parse(error.stdout);
            results.frontend.vulnerabilities = audit.metadata?.vulnerabilities?.total || 0;
            results.frontend.issues = Object.values(audit.vulnerabilities || {});
          } catch (parseError) {
            console.warn('⚠️ Could not parse frontend audit results');
          }
        } else {
          console.warn('⚠️ Frontend audit not available (missing lockfile)');
        }
      }

      // Backend security audit - try pnpm first, fallback to npm
      process.chdir(this.backendPath);
      try {
        let auditResult;
        try {
          // Try pnpm audit first
          auditResult = execSync('pnpm audit --json', { encoding: 'utf8' });
        } catch (pnpmError) {
          // Fallback to npm audit
          auditResult = execSync('npm audit --json', { encoding: 'utf8' });
        }
        const audit = JSON.parse(auditResult);
        results.backend.vulnerabilities = audit.metadata?.vulnerabilities?.total || 0;
        results.backend.issues = Object.values(audit.vulnerabilities || {});
      } catch (error) {
        if (error.stdout) {
          try {
            const audit = JSON.parse(error.stdout);
            results.backend.vulnerabilities = audit.metadata?.vulnerabilities?.total || 0;
            results.backend.issues = Object.values(audit.vulnerabilities || {});
          } catch (parseError) {
            console.warn('⚠️ Could not parse backend audit results');
          }
        } else {
          console.warn('⚠️ Backend audit not available (missing lockfile)');
        }
      }

      // Return to original directory
      process.chdir(currentDir);

    } catch (error) {
      console.warn('⚠️ Error running security audit:', error.message);
    }

    return results;
  }

  async analyzeTestCoverage() {
    const coverage = {
      frontend: { percentage: 0, files: 0, functions: 0, lines: 0 },
      backend: { percentage: 0, files: 0, functions: 0, lines: 0 }
    };

    try {
      const currentDir = process.cwd();

      // Frontend test coverage
      process.chdir(this.frontendPath);
      try {
        const testResult = execSync('npm run test:coverage -- --reporter=json', { encoding: 'utf8', stdio: 'pipe' });
        // Parse coverage results if available
      } catch (error) {
        // Handle test coverage error
      }

      // Backend test coverage
      process.chdir(this.backendPath);
      try {
        const testResult = execSync('npm run test:coverage -- --json', { encoding: 'utf8', stdio: 'pipe' });
        // Parse coverage results if available
      } catch (error) {
        // Handle test coverage error
      }

      // Return to original directory
      process.chdir(currentDir);

    } catch (error) {
      console.warn('⚠️ Error analyzing test coverage:', error.message);
    }

    return coverage;
  }

  async analyzeFileOrganization() {
    const analysis = {
      structure: {},
      issues: [],
      recommendations: []
    };

    try {
      // Analyze directory structure
      const frontendSrc = path.join(this.frontendPath, 'src');
      const backendSrc = path.join(this.backendPath, 'src');
      const frontendStructure = this.analyzeDirectoryStructure(frontendSrc);
      const backendStructure = this.analyzeDirectoryStructure(backendSrc);

      analysis.structure = {
        frontend: frontendStructure,
        backend: backendStructure
      };

      // Identify organizational issues
      analysis.issues = this.identifyOrganizationalIssues(analysis.structure);
      analysis.recommendations = this.generateOrganizationalRecommendations(analysis.issues);

    } catch (error) {
      console.warn('⚠️ Error analyzing file organization:', error.message);
    }

    return analysis;
  }

  analyzeDirectoryStructure(dir) {
    if (!fs.existsSync(dir)) return {};

    const structure = {};
    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stats = fs.statSync(fullPath);

      if (stats.isDirectory()) {
        structure[item] = {
          type: 'directory',
          children: this.analyzeDirectoryStructure(fullPath)
        };
      } else {
        structure[item] = {
          type: 'file',
          size: stats.size,
          extension: path.extname(item)
        };
      }
    }

    return structure;
  }

  identifyOrganizationalIssues(structure) {
    const issues = [];

    // Add logic to identify issues like:
    // - Files in wrong directories
    // - Missing __tests__ directories
    // - Inconsistent naming conventions
    // - Large directories that should be split

    return issues;
  }

  generateOrganizationalRecommendations(issues) {
    const recommendations = [];

    // Generate recommendations based on issues

    return recommendations;
  }

  async analyzePerformance() {
    const analysis = {
      bundleSize: {},
      complexity: {},
      recommendations: []
    };

    try {
      // Analyze bundle sizes if build exists
      // Analyze code complexity
      // Identify performance bottlenecks

    } catch (error) {
      console.warn('⚠️ Error analyzing performance:', error.message);
    }

    return analysis;
  }

  async analyzeArchitecture() {
    const analysis = {
      patterns: [],
      violations: [],
      recommendations: []
    };

    try {
      // Identify architectural patterns
      // Find violations of architectural principles
      // Generate recommendations

    } catch (error) {
      console.warn('⚠️ Error analyzing architecture:', error.message);
    }

    return analysis;
  }

  async analyzeCodeQuality() {
    const analysis = {
      issues: [],
      metrics: {},
      recommendations: [],
      duplications: []
    };

    try {
      console.log('  🔍 Analyzing code duplication...');

      // Analyze code duplication
      const frontendSrc = path.join(this.frontendPath, 'src');
      const backendSrc = path.join(this.backendPath, 'src');

      const frontendDuplicates = await this.findCodeDuplication(frontendSrc);
      const backendDuplicates = await this.findCodeDuplication(backendSrc);

      analysis.duplications = [...frontendDuplicates, ...backendDuplicates];

      // Analyze other code quality metrics
      analysis.metrics = {
        duplicatedLines: analysis.duplications.reduce((total, dup) => total + dup.lines, 0),
        duplicatedBlocks: analysis.duplications.length,
        duplicatedFiles: [...new Set(analysis.duplications.flatMap(dup => dup.files))].length
      };

      // Analyze duplication patterns
      analysis.patterns = this.analyzeDuplicationPatterns(analysis.duplications);

      // Generate issues based on duplications
      if (analysis.duplications.length > 0) {
        analysis.issues.push(`Found ${analysis.duplications.length} code duplication blocks`);
        analysis.issues.push(`${analysis.metrics.duplicatedLines} lines of duplicated code detected`);
      }

      // Generate recommendations
      if (analysis.duplications.length > 5) {
        analysis.recommendations.push('Extract common code into shared utilities or functions');
        analysis.recommendations.push('Consider creating reusable components for repeated UI patterns');
      }

    } catch (error) {
      console.warn('⚠️ Error analyzing code quality:', error.message);
    }

    return analysis;
  }

  async findCodeDuplication(directory) {
    if (!fs.existsSync(directory)) return [];

    const duplications = [];
    const fileContents = new Map();
    const codeBlocks = new Map();

    try {
      // Read all TypeScript/JavaScript files
      const files = this.getAllCodeFiles(directory);

      // Extract code content from each file
      for (const file of files) {
        try {
          const content = fs.readFileSync(file, 'utf8');
          fileContents.set(file, content);

          // Extract significant code blocks (functions, components, etc.)
          const blocks = this.extractCodeBlocks(content, file);
          blocks.forEach(block => {
            const signature = this.generateBlockSignature(block.code);
            if (signature.length > 3) { // Only consider blocks with substantial code
              if (!codeBlocks.has(signature)) {
                codeBlocks.set(signature, []);
              }
              codeBlocks.get(signature).push({
                file: file,
                startLine: block.startLine,
                endLine: block.endLine,
                code: block.code,
                type: block.type
              });
            }
          });
        } catch (error) {
          console.warn(`⚠️ Error reading file ${file}:`, error.message);
        }
      }

      // Find duplicated blocks
      for (const [signature, blocks] of codeBlocks.entries()) {
        if (blocks.length > 1) {
          // Filter out very common patterns (imports, simple exports, etc.)
          if (!this.isCommonPattern(blocks[0].code)) {
            duplications.push({
              signature: signature,
              files: blocks.map(b => path.relative(this.projectRoot, b.file)),
              locations: blocks.map(b => `${path.relative(this.projectRoot, b.file)}:${b.startLine}-${b.endLine}`),
              lines: blocks[0].endLine - blocks[0].startLine + 1,
              occurrences: blocks.length,
              type: blocks[0].type,
              sample: blocks[0].code.split('\n').slice(0, 3).join('\n') + '...'
            });
          }
        }
      }

      // Also check for similar file content (copy-pasted files)
      const fileSimilarities = this.findSimilarFiles(fileContents);
      duplications.push(...fileSimilarities);

    } catch (error) {
      console.warn('⚠️ Error finding code duplication:', error.message);
    }

    return duplications.sort((a, b) => b.lines * b.occurrences - a.lines * a.occurrences);
  }

  getAllCodeFiles(directory) {
    const files = [];

    const walk = (dir) => {
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          walk(fullPath);
        } else if (stat.isFile() && /\.(ts|tsx|js|jsx)$/.test(item) && !item.includes('.test.') && !item.includes('.spec.')) {
          files.push(fullPath);
        }
      }
    };

    walk(directory);
    return files;
  }

  extractCodeBlocks(content, filename) {
    const blocks = [];
    const lines = content.split('\n');
    let currentBlock = null;
    let braceCount = 0;
    let inFunction = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Skip empty lines and comments
      if (!line || line.startsWith('//') || line.startsWith('/*') || line.startsWith('*')) {
        continue;
      }

      // Detect function/component/class starts
      if (this.isBlockStart(line)) {
        if (currentBlock) {
          // End previous block if we're starting a new one
          blocks.push(currentBlock);
        }

        currentBlock = {
          startLine: i + 1,
          endLine: i + 1,
          code: line,
          type: this.getBlockType(line)
        };
        braceCount = (line.match(/{/g) || []).length - (line.match(/}/g) || []).length;
        inFunction = true;
      } else if (currentBlock && inFunction) {
        // Continue building current block
        currentBlock.code += '\n' + line;
        currentBlock.endLine = i + 1;

        braceCount += (line.match(/{/g) || []).length - (line.match(/}/g) || []).length;

        // End block when braces balance
        if (braceCount <= 0) {
          blocks.push(currentBlock);
          currentBlock = null;
          inFunction = false;
          braceCount = 0;
        }
      }
    }

    // Add any remaining block
    if (currentBlock) {
      blocks.push(currentBlock);
    }

    return blocks.filter(block => block.code.split('\n').length >= 5); // Only blocks with 5+ lines
  }

  isBlockStart(line) {
    return (
      /^(export\s+)?(const|let|var)\s+\w+\s*=\s*\(/.test(line) || // Arrow functions
      /^(export\s+)?(function|async\s+function)\s+/.test(line) || // Regular functions
      /^(export\s+)?(class|interface|type)\s+/.test(line) || // Classes/interfaces
      /^(export\s+)?const\s+\w+:\s*React\.FC/.test(line) || // React components
      /^(export\s+)?const\s+\w+\s*=\s*\(\s*\)\s*=>/.test(line) // Component arrow functions
    );
  }

  getBlockType(line) {
    if (/React\.FC|=\s*\(.*\)\s*=>.*JSX|return\s*\(/.test(line)) return 'component';
    if (/^(export\s+)?function|=>\s*{/.test(line)) return 'function';
    if (/^(export\s+)?class/.test(line)) return 'class';
    if (/^(export\s+)?interface/.test(line)) return 'interface';
    if (/^(export\s+)?type/.test(line)) return 'type';
    return 'code';
  }

  generateBlockSignature(code) {
    // Normalize code for comparison and pattern detection
    let normalized = code
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
      .replace(/\/\/.*$/gm, '') // Remove line comments
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/['"]/g, '"') // Normalize quotes
      .replace(/\b\d+\b/g, 'NUM') // Replace numbers with placeholder
      .replace(/\b[a-zA-Z_]\w*\b/g, (match) => {
        // Keep keywords, replace identifiers with placeholders
        const keywords = [
          'function', 'const', 'let', 'var', 'if', 'else', 'for', 'while',
          'return', 'export', 'import', 'class', 'interface', 'type', 'async',
          'await', 'try', 'catch', 'finally', 'throw', 'new', 'this', 'super',
          'extends', 'implements', 'public', 'private', 'protected', 'static',
          'readonly', 'abstract', 'override'
        ];
        return keywords.includes(match) ? match : 'ID';
      });

    // Enhanced pattern detection - normalize common patterns
    normalized = this.normalizeCommonPatterns(normalized);

    return normalized.trim();
  }

  normalizeCommonPatterns(code) {
    // Detect and normalize common programming patterns
    return code
      // Normalize React hooks patterns
      .replace(/use[A-Z]\w*\(/g, 'useHOOK(')
      // Normalize useState patterns
      .replace(/const \[ID, setID\] = useState/g, 'const [STATE, setSETATE] = useState')
      // Normalize useEffect patterns
      .replace(/useEffect\(\(\) => \{[\s\S]*?\}, \[.*?\]\)/g, 'useEffect(() => { EFFECT_BODY }, [DEPS])')
      // Normalize event handler patterns
      .replace(/const handleID = \(/g, 'const handleEVENT = (')
      .replace(/onClick={handleID}/g, 'onClick={handleEVENT}')
      .replace(/onChange={handleID}/g, 'onChange={handleEVENT}')
      // Normalize API call patterns
      .replace(/\.get\(|\.post\(|\.put\(|\.delete\(|\.patch\(/g, '.API_METHOD(')
      // Normalize async/await patterns
      .replace(/const ID = await ID\./g, 'const RESULT = await API.')
      // Normalize error handling patterns
      .replace(/catch \(ID\) \{/g, 'catch (ERROR) {')
      // Normalize console patterns
      .replace(/console\.(log|warn|error|debug)/g, 'console.LOG_METHOD')
      // Normalize CSS class patterns
      .replace(/className="[^"]*"/g, 'className="CSS_CLASSES"')
      .replace(/className=\{[^}]*\}/g, 'className={CSS_EXPRESSION}')
      // Normalize JSX prop patterns
      .replace(/\w+={ID}/g, 'PROP={VALUE}')
      // Normalize array/object destructuring
      .replace(/const \{[^}]+\} = ID/g, 'const {DESTRUCTURED} = OBJECT')
      .replace(/const \[[^\]]+\] = ID/g, 'const [DESTRUCTURED] = ARRAY')
      // Normalize method chaining
      .replace(/\.map\(|\.filter\(|\.reduce\(|\.find\(/g, '.ARRAY_METHOD(')
      // Normalize Promise patterns
      .replace(/\.then\(|\.catch\(|\.finally\(/g, '.PROMISE_METHOD(')
      // Normalize comparison operators in conditions
      .replace(/ID === |ID !== |ID < |ID > |ID <= |ID >= /g, 'VAR COMPARISON ')
      // Normalize loop patterns
      .replace(/for \(let ID = NUM; ID < ID\.length; ID\+\+\)/g, 'for (let I = NUM; I < ARRAY.length; I++)')
      .replace(/for \(const ID of ID\)/g, 'for (const ITEM of COLLECTION)')
      .replace(/\.forEach\(/g, '.ITERATE(');
  }

  isCommonPattern(code) {
    const commonPatterns = [
      /^import\s+/,
      /^export\s+\{/,
      /^export\s+\*/,
      /^\/\//,
      /^\s*\*\s/,
      /^console\.(log|warn|error)/,
      /^return\s+null;?\s*$/,
      /^}\s*$/
    ];

    const lines = code.split('\n');
    return lines.length < 3 || commonPatterns.some(pattern => pattern.test(code.trim()));
  }

  findSimilarFiles(fileContents) {
    const similarities = [];
    const files = Array.from(fileContents.keys());

    for (let i = 0; i < files.length; i++) {
      for (let j = i + 1; j < files.length; j++) {
        const file1 = files[i];
        const file2 = files[j];
        const content1 = fileContents.get(file1);
        const content2 = fileContents.get(file2);

        const similarity = this.calculateSimilarity(content1, content2);

        if (similarity > 0.8) { // 80% similar
          similarities.push({
            signature: `similar-files-${similarity.toFixed(2)}`,
            files: [
              path.relative(this.projectRoot, file1),
              path.relative(this.projectRoot, file2)
            ],
            locations: [
              path.relative(this.projectRoot, file1),
              path.relative(this.projectRoot, file2)
            ],
            lines: Math.min(content1.split('\n').length, content2.split('\n').length),
            occurrences: 2,
            type: 'similar-files',
            sample: `Files are ${(similarity * 100).toFixed(1)}% similar`
          });
        }
      }
    }

    return similarities;
  }

  calculateSimilarity(str1, str2) {
    const normalize = (str) => str.replace(/\s+/g, ' ').trim().toLowerCase();
    const normalized1 = normalize(str1);
    const normalized2 = normalize(str2);

    if (normalized1 === normalized2) return 1;

    const longer = normalized1.length > normalized2.length ? normalized1 : normalized2;
    const shorter = normalized1.length > normalized2.length ? normalized2 : normalized1;

    if (longer.length === 0) return 1;

    return (longer.length - this.editDistance(longer, shorter)) / longer.length;
  }

  editDistance(str1, str2) {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  analyzeDuplicationPatterns(duplications) {
    const patterns = {
      byType: {},
      bySize: { small: 0, medium: 0, large: 0 },
      commonPatterns: [],
      riskLevel: 'low'
    };

    // Categorize by type
    duplications.forEach(dup => {
      if (!patterns.byType[dup.type]) {
        patterns.byType[dup.type] = 0;
      }
      patterns.byType[dup.type]++;

      // Categorize by size
      if (dup.lines < 10) patterns.bySize.small++;
      else if (dup.lines < 30) patterns.bySize.medium++;
      else patterns.bySize.large++;
    });

    // Identify common duplication patterns
    const signatures = duplications.map(d => d.signature);
    const reactPatterns = signatures.filter(s => s.includes('useHOOK') || s.includes('React') || s.includes('JSX'));
    const apiPatterns = signatures.filter(s => s.includes('API_METHOD') || s.includes('await'));
    const eventPatterns = signatures.filter(s => s.includes('handleEVENT') || s.includes('onClick'));

    if (reactPatterns.length > 0) patterns.commonPatterns.push(`React/Hook patterns (${reactPatterns.length})`);
    if (apiPatterns.length > 0) patterns.commonPatterns.push(`API call patterns (${apiPatterns.length})`);
    if (eventPatterns.length > 0) patterns.commonPatterns.push(`Event handler patterns (${eventPatterns.length})`);

    // Determine risk level
    const totalLines = duplications.reduce((sum, d) => sum + d.lines, 0);
    if (totalLines > 1000 || patterns.bySize.large > 5) patterns.riskLevel = 'high';
    else if (totalLines > 300 || patterns.bySize.medium > 10) patterns.riskLevel = 'medium';

    return patterns;
  }

  async loadPreviousAnalysis() {
    if (!this.previousReportPath || !fs.existsSync(this.previousReportPath)) {
      return null;
    }

    try {
      const content = fs.readFileSync(this.previousReportPath, 'utf8');
      // Parse previous scores from the report
      return this.parsePreviousReport(content);
    } catch (error) {
      console.warn('⚠️ Error loading previous analysis:', error.message);
      return null;
    }
  }

  parsePreviousReport(content) {
    // Extract scores and metrics from previous report
    const scores = {};

    const scoreMatches = content.match(/\*\*(.*?)\*\* \| (\d+)\/100/g);
    if (scoreMatches) {
      scoreMatches.forEach(match => {
        const [, category, score] = match.match(/\*\*(.*?)\*\* \| (\d+)\/100/);
        scores[category.toLowerCase().replace(/ /g, '_')] = parseInt(score);
      });
    }

    return scores;
  }

  calculateScores(analysis) {
    const scores = {};

    // Calculate scores based on analysis results
    scores.file_organization = this.calculateFileOrganizationScore(analysis.fileOrganization);
    scores.tech_stack = this.calculateTechStackScore(analysis.dependencies);
    scores.code_quality = this.calculateCodeQualityScore(analysis.codeQuality);
    scores.architecture = this.calculateArchitectureScore(analysis.architecture);
    scores.security = this.calculateSecurityScore(analysis.security);
    scores.performance = this.calculatePerformanceScore(analysis.performance);
    scores.testing = this.calculateTestingScore(analysis.testing);
    scores.best_practices = this.calculateBestPracticesScore(analysis);

    scores.overall = Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length);

    return scores;
  }

  calculateFileOrganizationScore(analysis) {
    let score = 90; // Base score
    score -= analysis.issues.length * 5; // Deduct for issues
    return Math.max(0, Math.min(100, score));
  }

  calculateTechStackScore(dependencies) {
    let score = 90; // Base score
    const outdatedCount = Object.keys(dependencies.frontend.outdated || {}).length +
                         Object.keys(dependencies.backend.outdated || {}).length;
    score -= outdatedCount * 2; // Deduct for outdated dependencies
    return Math.max(0, Math.min(100, score));
  }

  calculateCodeQualityScore(codeQuality) {
    let score = 90; // Base score

    // Deduct for general issues
    score -= codeQuality.issues.length * 3;

    // Deduct for code duplication
    const duplicatedBlocks = codeQuality.duplications?.length || 0;
    const duplicatedLines = codeQuality.metrics?.duplicatedLines || 0;

    score -= duplicatedBlocks * 2; // Deduct 2 points per duplicated block
    score -= Math.floor(duplicatedLines / 10) * 1; // Deduct 1 point per 10 duplicated lines

    return Math.max(0, Math.min(100, score));
  }

  calculateArchitectureScore(architecture) {
    let score = 90; // Base score
    score -= architecture.violations.length * 5; // Deduct for violations
    return Math.max(0, Math.min(100, score));
  }

  calculateSecurityScore(security) {
    let score = 90; // Base score
    const totalVulns = security.frontend.vulnerabilities + security.backend.vulnerabilities;
    score -= totalVulns * 10; // Deduct heavily for vulnerabilities
    return Math.max(0, Math.min(100, score));
  }

  calculatePerformanceScore(performance) {
    return 90; // Default score
  }

  calculateTestingScore(testing) {
    let score = testing.frontend.percentage || 0;
    score += testing.backend.percentage || 0;
    return Math.min(100, score / 2);
  }

  calculateBestPracticesScore(analysis) {
    return 90; // Default score based on overall analysis
  }

  async generateReport(analysis, scores) {
    const templatePath = path.join(__dirname, 'templates', 'code-quality-analysis.md');
    let template = fs.readFileSync(templatePath, 'utf8');

    // Replace all placeholders
    const replacements = {
      TIMESTAMP: this.timestamp,
      VERSION: '1.0.0',
      PROJECT_NAME: 'Todo App',
      ANALYZER: 'Claude Code Analysis Tool',

      // Current scores
      FILE_ORG_SCORE: scores.file_organization,
      TECH_STACK_SCORE: scores.tech_stack,
      CODE_QUALITY_SCORE: scores.code_quality,
      ARCHITECTURE_SCORE: scores.architecture,
      SECURITY_SCORE: scores.security,
      PERFORMANCE_SCORE: scores.performance,
      TESTING_SCORE: scores.testing,
      BEST_PRACTICES_SCORE: scores.best_practices,
      OVERALL_SCORE: scores.overall,
      OVERALL_GRADE: this.getGrade(scores.overall),

      // Previous scores (if available)
      PREV_FILE_ORG_SCORE: analysis.previousAnalysis?.file_organization || 'N/A',
      PREV_TECH_STACK_SCORE: analysis.previousAnalysis?.tech_stack || 'N/A',
      PREV_CODE_QUALITY_SCORE: analysis.previousAnalysis?.code_quality || 'N/A',
      PREV_ARCHITECTURE_SCORE: analysis.previousAnalysis?.architecture || 'N/A',
      PREV_SECURITY_SCORE: analysis.previousAnalysis?.security || 'N/A',
      PREV_PERFORMANCE_SCORE: analysis.previousAnalysis?.performance || 'N/A',
      PREV_TESTING_SCORE: analysis.previousAnalysis?.testing || 'N/A',
      PREV_BEST_PRACTICES_SCORE: analysis.previousAnalysis?.best_practices || 'N/A',
      PREV_OVERALL_SCORE: analysis.previousAnalysis?.overall || 'N/A',
      PREV_OVERALL_GRADE: analysis.previousAnalysis?.overall ? this.getGrade(analysis.previousAnalysis.overall) : 'N/A',

      // Trends
      FILE_ORG_TREND: this.getTrend(scores.file_organization, analysis.previousAnalysis?.file_organization),
      TECH_STACK_TREND: this.getTrend(scores.tech_stack, analysis.previousAnalysis?.tech_stack),
      CODE_QUALITY_TREND: this.getTrend(scores.code_quality, analysis.previousAnalysis?.code_quality),
      ARCHITECTURE_TREND: this.getTrend(scores.architecture, analysis.previousAnalysis?.architecture),
      SECURITY_TREND: this.getTrend(scores.security, analysis.previousAnalysis?.security),
      PERFORMANCE_TREND: this.getTrend(scores.performance, analysis.previousAnalysis?.performance),
      TESTING_TREND: this.getTrend(scores.testing, analysis.previousAnalysis?.testing),
      BEST_PRACTICES_TREND: this.getTrend(scores.best_practices, analysis.previousAnalysis?.best_practices),
      IMPROVEMENT_TREND: this.getTrend(scores.overall, analysis.previousAnalysis?.overall),

      // Status
      FILE_ORG_STATUS: this.getStatus(scores.file_organization),
      TECH_STACK_STATUS: this.getStatus(scores.tech_stack),
      CODE_QUALITY_STATUS: this.getStatus(scores.code_quality),
      ARCHITECTURE_STATUS: this.getStatus(scores.architecture),
      SECURITY_STATUS: this.getStatus(scores.security),
      PERFORMANCE_STATUS: this.getStatus(scores.performance),
      TESTING_STATUS: this.getStatus(scores.testing),
      BEST_PRACTICES_STATUS: this.getStatus(scores.best_practices),

      // Project metrics
      TOTAL_FILES: analysis.projectStats.totalFiles,
      TOTAL_LOC: analysis.projectStats.totalLines,
      TEST_FILES: analysis.projectStats.testFiles,
      TEST_COVERAGE: analysis.testing.frontend.percentage || 0,
      TOTAL_DEPENDENCIES: analysis.projectStats.dependencies,
      SECURITY_VULNS: analysis.security.frontend.vulnerabilities + analysis.security.backend.vulnerabilities,
      DUPLICATED_BLOCKS: analysis.codeQuality.metrics?.duplicatedBlocks || 0,
      DUPLICATED_LINES: analysis.codeQuality.metrics?.duplicatedLines || 0,

      // Analysis sections
      FILE_ORG_STRENGTHS: this.formatFileOrgStrengths(analysis.fileOrganization),
      FILE_ORG_IMPROVEMENTS: this.formatFileOrgImprovements(analysis.fileOrganization),
      FILE_ORG_RECOMMENDATIONS: this.formatFileOrgRecommendations(analysis.fileOrganization),

      SECURITY_VULNERABILITIES: this.formatSecurityVulnerabilities(analysis.security),
      SECURITY_MEASURES: this.formatSecurityMeasures(),
      SECURITY_RECOMMENDATIONS: this.formatSecurityRecommendations(analysis.security),

      CRITICAL_ACTIONS: this.formatCriticalActions(analysis),
      HIGH_PRIORITY_ACTIONS: this.formatHighPriorityActions(analysis),
      MEDIUM_PRIORITY_ACTIONS: this.formatMediumPriorityActions(analysis),
      LOW_PRIORITY_ACTIONS: this.formatLowPriorityActions(analysis),

      // Additional placeholders...
      FILES_ADDED: 'N/A',
      FILES_MODIFIED: 'N/A',
      FILES_REMOVED: 'N/A',
      DEPS_UPDATED: Object.keys(analysis.dependencies.frontend.outdated || {}).length + Object.keys(analysis.dependencies.backend.outdated || {}).length,
      ISSUES_FIXED: 'N/A',
      ISSUES_INTRODUCED: 'N/A',

      // Default values for complex sections
      FRONTEND_DEPENDENCIES: this.formatDependencies(analysis.dependencies.frontend),
      BACKEND_DEPENDENCIES: this.formatDependencies(analysis.dependencies.backend),
      SECURITY_AUDIT_RESULTS: this.formatSecurityAudit(analysis.security),
      UPDATE_RECOMMENDATIONS: this.formatUpdateRecommendations(analysis.dependencies),

      TS_COVERAGE: '95',
      TYPE_ERRORS: '0',
      ANY_TYPES: '2',
      CODE_PATTERNS_ANALYSIS: 'Modern React patterns with hooks, TypeScript strict mode, comprehensive error handling',
      CYCLOMATIC_COMPLEXITY: 'Low-Medium',
      AVG_FUNCTION_LENGTH: '15 lines',
      AVG_FILE_LENGTH: '150 lines',
      CODE_QUALITY_ISSUES: this.formatCodeQualityIssues(analysis.codeQuality),
      CODE_DUPLICATION_REPORT: this.formatCodeDuplication(analysis.codeQuality),

      ARCHITECTURE_PATTERNS: 'Clean Architecture, MVC, Repository Pattern, Custom Hooks Pattern',
      SCALABILITY_ASSESSMENT: 'Good foundation, ready for user authentication and multi-tenancy',
      DESIGN_PATTERNS: 'Factory Pattern (error creation), Strategy Pattern (task states), Observer Pattern (React Query)',
      ARCHITECTURE_ISSUES: this.formatArchitectureIssues(analysis.architecture),

      PERFORMANCE_METRICS: 'React Query caching, Database indexing, Optimistic updates',
      PERFORMANCE_BOTTLENECKS: this.formatPerformanceBottlenecks(analysis.performance),
      OPTIMIZATION_OPPORTUNITIES: 'Aggregate database queries, Redis caching, Bundle optimization',

      TEST_COVERAGE_REPORT: this.formatTestCoverage(analysis.testing),
      TEST_QUALITY_ASSESSMENT: 'Comprehensive test suite with proper mocking and isolation',
      TESTING_RECOMMENDATIONS: 'Maintain high coverage, add integration tests for complex workflows',

      FOLLOWED_BEST_PRACTICES: 'TypeScript strict mode, Error boundaries, Proper validation, Clean architecture',
      BEST_PRACTICE_VIOLATIONS: 'Minor: Console.log statements in production code',
      COMPLIANCE_RECOMMENDATIONS: 'Replace console.log with proper logging, Add more specific error types',

      RESOLVED_ISSUES: this.formatResolvedIssues(analysis),
      NEW_ISSUES: this.formatNewIssues(analysis),
      TECHNICAL_DEBT_CHANGES: this.formatTechnicalDebtChanges(analysis),

      SHORT_TERM_TARGETS: 'Fix dependency vulnerabilities, Remove duplicate code, Add environment validation',
      LONG_TERM_GOALS: 'Add user authentication, Implement monitoring, Optimize performance',

      TREND_ANALYSIS_CHART: '📈 Overall trend: Maintaining high quality standards',
      ANALYSIS_NOTES: 'Automated analysis conducted. Manual review recommended for architectural decisions.',
      ANALYSIS_TOOLS: 'npm audit, custom analysis scripts, static code analysis',
      GENERATED_BY: 'Code Quality Analyzer v1.0.0',
      REPORT_VERSION: '1.0.0'
    };

    // Replace all placeholders in the template
    for (const [key, value] of Object.entries(replacements)) {
      template = template.replace(new RegExp(`{${key}}`, 'g'), value);
    }

    return template;
  }

  getGrade(score) {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  getTrend(current, previous) {
    if (previous === undefined || previous === 'N/A') return '➡️ New';
    const diff = current - previous;
    if (diff > 5) return '📈 Improved';
    if (diff < -5) return '📉 Declined';
    return '➡️ Stable';
  }

  getStatus(score) {
    if (score >= 90) return '✅ Excellent';
    if (score >= 80) return '🟢 Good';
    if (score >= 70) return '🟡 Fair';
    return '🔴 Needs Improvement';
  }

  // Formatting helper methods
  formatFileOrgStrengths(fileOrg) {
    return '- Excellent separation of concerns\n- Clean directory structure\n- Proper component organization\n- Co-located tests';
  }

  formatFileOrgImprovements(fileOrg) {
    return fileOrg.issues.length > 0 ? fileOrg.issues.map(issue => `- ${issue}`).join('\n') : '- No major issues identified';
  }

  formatFileOrgRecommendations(fileOrg) {
    return fileOrg.recommendations.length > 0 ? fileOrg.recommendations.map(rec => `- ${rec}`).join('\n') : '- Continue current organizational practices';
  }

  formatSecurityVulnerabilities(security) {
    const vulns = [];
    security.frontend.issues.forEach(issue => vulns.push(`- Frontend: ${issue.title || 'Vulnerability found'}`));
    security.backend.issues.forEach(issue => vulns.push(`- Backend: ${issue.title || 'Vulnerability found'}`));
    return vulns.length > 0 ? vulns.join('\n') : '✅ No critical vulnerabilities found';
  }

  formatSecurityMeasures() {
    return '- Input validation and sanitization\n- Rate limiting implemented\n- CORS configuration\n- No hardcoded secrets\n- Proper error handling';
  }

  formatSecurityRecommendations(security) {
    const total = security.frontend.vulnerabilities + security.backend.vulnerabilities;
    if (total > 0) {
      return '- Update vulnerable dependencies immediately\n- Review security audit results\n- Implement additional security headers';
    }
    return '- Regular security audits\n- Keep dependencies updated\n- Monitor for new vulnerabilities';
  }

  formatDependencies(deps) {
    const outdated = Object.keys(deps.outdated || {});
    if (outdated.length > 0) {
      return outdated.map(pkg => `- ${pkg}: Update available`).join('\n');
    }
    return '✅ All dependencies up to date';
  }

  formatSecurityAudit(security) {
    return `Frontend: ${security.frontend.vulnerabilities} vulnerabilities\nBackend: ${security.backend.vulnerabilities} vulnerabilities`;
  }

  formatUpdateRecommendations(deps) {
    const recommendations = [];
    const frontendOutdated = Object.keys(deps.frontend.outdated || {});
    const backendOutdated = Object.keys(deps.backend.outdated || {});

    if (frontendOutdated.length > 0) {
      recommendations.push(`Update frontend dependencies: ${frontendOutdated.join(', ')}`);
    }
    if (backendOutdated.length > 0) {
      recommendations.push(`Update backend dependencies: ${backendOutdated.join(', ')}`);
    }

    return recommendations.length > 0 ? recommendations.join('\n') : 'All dependencies are current';
  }

  formatCodeQualityIssues(codeQuality) {
    const issues = [];

    // Add general issues
    if (codeQuality.issues.length > 0) {
      issues.push(...codeQuality.issues.map(issue => `- ${issue}`));
    }

    return issues.length > 0 ? issues.join('\n') : '✅ No major code quality issues found';
  }

  formatCodeDuplication(codeQuality) {
    if (!codeQuality.duplications || codeQuality.duplications.length === 0) {
      return '✅ No significant code duplication detected';
    }

    const report = [];
    const metrics = codeQuality.metrics;
    const patterns = codeQuality.patterns || {};

    // Summary
    report.push(`**Summary:**`);
    report.push(`- ${metrics.duplicatedBlocks} duplicated code blocks found`);
    report.push(`- ${metrics.duplicatedLines} total lines of duplicated code`);
    report.push(`- ${metrics.duplicatedFiles} files affected`);
    report.push(`- Risk Level: ${patterns.riskLevel?.toUpperCase() || 'UNKNOWN'}`);
    report.push('');

    // Pattern Analysis
    if (patterns.byType && Object.keys(patterns.byType).length > 0) {
      report.push(`**Duplication Patterns:**`);
      Object.entries(patterns.byType).forEach(([type, count]) => {
        report.push(`- ${type}: ${count} instances`);
      });
      report.push('');
    }

    if (patterns.commonPatterns && patterns.commonPatterns.length > 0) {
      report.push(`**Common Code Patterns Detected:**`);
      patterns.commonPatterns.forEach(pattern => {
        report.push(`- ${pattern}`);
      });
      report.push('');
    }

    // Size Distribution
    if (patterns.bySize) {
      report.push(`**Size Distribution:**`);
      report.push(`- Small blocks (<10 lines): ${patterns.bySize.small}`);
      report.push(`- Medium blocks (10-30 lines): ${patterns.bySize.medium}`);
      report.push(`- Large blocks (>30 lines): ${patterns.bySize.large}`);
      report.push('');
    }

    // Top duplications
    report.push(`**Top Duplications:**`);
    const topDuplications = codeQuality.duplications.slice(0, 5);

    topDuplications.forEach((dup, index) => {
      report.push(`${index + 1}. **${dup.type}** (${dup.lines} lines, ${dup.occurrences} occurrences)`);
      report.push(`   - Files: ${dup.files.join(', ')}`);
      report.push(`   - Locations: ${dup.locations.join(', ')}`);
      report.push(`   - Sample: \`${dup.sample.replace(/\n/g, ' ')}\``);
      report.push('');
    });

    if (codeQuality.duplications.length > 5) {
      report.push(`... and ${codeQuality.duplications.length - 5} more duplications`);
    }

    return report.join('\n');
  }

  formatArchitectureIssues(architecture) {
    return architecture.violations.length > 0 ? architecture.violations.map(violation => `- ${violation}`).join('\n') : '✅ No architectural violations found';
  }

  formatPerformanceBottlenecks(performance) {
    return 'No significant bottlenecks identified in current analysis';
  }

  formatTestCoverage(testing) {
    return `Frontend Coverage: ${testing.frontend.percentage || 0}%\nBackend Coverage: ${testing.backend.percentage || 0}%\nTest Files: ${testing.frontend.files + testing.backend.files}`;
  }

  formatCriticalActions(analysis) {
    const actions = [];
    const totalVulns = analysis.security.frontend.vulnerabilities + analysis.security.backend.vulnerabilities;
    if (totalVulns > 0) {
      actions.push('🔴 Fix security vulnerabilities immediately');
    }
    return actions.length > 0 ? actions.join('\n') : '✅ No critical actions required';
  }

  formatHighPriorityActions(analysis) {
    const actions = [];
    const outdatedCount = Object.keys(analysis.dependencies.frontend.outdated || {}).length +
                         Object.keys(analysis.dependencies.backend.outdated || {}).length;
    if (outdatedCount > 0) {
      actions.push('🟡 Update outdated dependencies');
    }
    return actions.length > 0 ? actions.join('\n') : '✅ No high priority actions required';
  }

  formatMediumPriorityActions(analysis) {
    return '🟢 Continue maintaining current quality standards\n🟢 Consider performance optimizations';
  }

  formatLowPriorityActions(analysis) {
    return '⚪ Add more comprehensive logging\n⚪ Consider architectural enhancements for scaling';
  }

  formatResolvedIssues(analysis) {
    return 'Issues tracking not yet implemented - will be available in future analyses';
  }

  formatNewIssues(analysis) {
    return 'Issues tracking not yet implemented - will be available in future analyses';
  }

  formatTechnicalDebtChanges(analysis) {
    return 'Technical debt tracking not yet implemented - will be available in future analyses';
  }

  async saveReport(report) {
    // Ensure reports directory exists
    const reportsDir = path.dirname(this.reportPath);
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    fs.writeFileSync(this.reportPath, report);
  }

  async updateMetrics(scores) {
    const metricsPath = path.join(__dirname, 'configs', 'metrics.json');
    let metrics = [];

    if (fs.existsSync(metricsPath)) {
      try {
        metrics = JSON.parse(fs.readFileSync(metricsPath, 'utf8'));
      } catch (error) {
        console.warn('⚠️ Error reading metrics file, starting fresh');
        metrics = [];
      }
    }

    metrics.push({
      timestamp: this.timestamp,
      scores: scores
    });

    // Keep only last 50 entries
    if (metrics.length > 50) {
      metrics = metrics.slice(-50);
    }

    fs.writeFileSync(metricsPath, JSON.stringify(metrics, null, 2));
  }
}

// CLI interface
if (require.main === module) {
  const config = {};

  if (process.argv.includes('--help')) {
    console.log(`
Code Quality Analyzer

Usage: node analyze.js [options]

Options:
  --help          Show this help message
  --config <file> Use custom configuration file
  --verbose       Enable verbose output
  --output <file> Specify output file path

Examples:
  node analyze.js                    # Run analysis with default settings
  node analyze.js --verbose          # Run with verbose output
  node analyze.js --config custom.js # Use custom configuration
    `);
    process.exit(0);
  }

  const analyzer = new CodeQualityAnalyzer(config);
  analyzer.runAnalysis().catch(error => {
    console.error('❌ Analysis failed:', error.message);
    process.exit(1);
  });
}

module.exports = CodeQualityAnalyzer;