#!/usr/bin/env node

/**
 * Test Runner Script for Audio Recorder App
 * 
 * This script provides a comprehensive test runner that:
 * - Runs all unit tests
 * - Generates coverage reports
 * - Validates code quality
 * - Provides detailed test results
 * 
 * Usage:
 *   node scripts/test-runner.js [options]
 * 
 * Options:
 *   --watch     Run tests in watch mode
 *   --coverage  Generate coverage report
 *   --ci        Run in CI mode (no watch, with coverage)
 *   --verbose   Verbose output
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  testCommand: 'jest',
  coverageCommand: 'jest --coverage',
  watchCommand: 'jest --watch',
  ciCommand: 'jest --ci --coverage --watchAll=false',
  lintCommand: 'eslint src --ext .ts,.tsx',
  typeCheckCommand: 'tsc --noEmit',
};

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  watch: args.includes('--watch'),
  coverage: args.includes('--coverage'),
  ci: args.includes('--ci'),
  verbose: args.includes('--verbose'),
  lint: args.includes('--lint'),
  typeCheck: args.includes('--type-check'),
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Utility functions
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSection(title) {
  log(`\n${colors.cyan}${'='.repeat(50)}${colors.reset}`);
  log(`${colors.bright}${colors.cyan}${title}${colors.reset}`);
  log(`${colors.cyan}${'='.repeat(50)}${colors.reset}\n`);
}

function runCommand(command, description) {
  log(`${colors.yellow}Running: ${description}${colors.reset}`);
  log(`${colors.blue}Command: ${command}${colors.reset}\n`);
  
  try {
    const result = execSync(command, { 
      stdio: options.verbose ? 'inherit' : 'pipe',
      encoding: 'utf8'
    });
    
    if (!options.verbose) {
      log(`${colors.green}✓ ${description} completed successfully${colors.reset}`);
    }
    
    return { success: true, output: result };
  } catch (error) {
    log(`${colors.red}✗ ${description} failed${colors.reset}`);
    if (!options.verbose) {
      log(`${colors.red}Error: ${error.message}${colors.reset}`);
    }
    return { success: false, error: error.message, output: error.stdout || error.stderr };
  }
}

function checkDependencies() {
  logSection('Checking Dependencies');
  
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    log(`${colors.red}Error: package.json not found${colors.reset}`);
    process.exit(1);
  }
  
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const requiredDeps = ['jest', '@testing-library/react-native', 'ts-jest'];
  
  const missingDeps = requiredDeps.filter(dep => 
    !packageJson.devDependencies || !packageJson.devDependencies[dep]
  );
  
  if (missingDeps.length > 0) {
    log(`${colors.red}Missing required dependencies: ${missingDeps.join(', ')}${colors.reset}`);
    log(`${colors.yellow}Please run: npm install${colors.reset}`);
    process.exit(1);
  }
  
  log(`${colors.green}✓ All required dependencies are installed${colors.reset}`);
}

function runTests() {
  logSection('Running Tests');
  
  let command;
  let description;
  
  if (options.ci) {
    command = config.ciCommand;
    description = 'Tests (CI mode with coverage)';
  } else if (options.watch) {
    command = config.watchCommand;
    description = 'Tests (watch mode)';
  } else if (options.coverage) {
    command = config.coverageCommand;
    description = 'Tests (with coverage)';
  } else {
    command = config.testCommand;
    description = 'Tests';
  }
  
  const result = runCommand(command, description);
  
  if (!result.success) {
    log(`${colors.red}Test execution failed${colors.reset}`);
    if (result.output) {
      log(`${colors.red}Output: ${result.output}${colors.reset}`);
    }
    process.exit(1);
  }
  
  return result;
}

function runLinting() {
  if (!options.lint && !options.ci) return;
  
  logSection('Running Linting');
  
  const result = runCommand(config.lintCommand, 'ESLint');
  
  if (!result.success) {
    log(`${colors.yellow}Linting issues found. Consider running: npm run lint:fix${colors.reset}`);
    if (options.ci) {
      process.exit(1);
    }
  }
  
  return result;
}

function runTypeChecking() {
  if (!options.typeCheck && !options.ci) return;
  
  logSection('Running Type Checking');
  
  const result = runCommand(config.typeCheckCommand, 'TypeScript Type Check');
  
  if (!result.success) {
    log(`${colors.red}Type checking failed${colors.reset}`);
    if (options.ci) {
      process.exit(1);
    }
  }
  
  return result;
}

function generateReport() {
  if (!options.coverage && !options.ci) return;
  
  logSection('Coverage Report');
  
  const coveragePath = path.join(process.cwd(), 'coverage', 'lcov-report', 'index.html');
  
  if (fs.existsSync(coveragePath)) {
    log(`${colors.green}Coverage report generated: ${coveragePath}${colors.reset}`);
    log(`${colors.blue}Open the report in your browser to view detailed coverage${colors.reset}`);
  } else {
    log(`${colors.yellow}Coverage report not found${colors.reset}`);
  }
}

function showSummary(results) {
  logSection('Test Summary');
  
  const totalTests = results.length;
  const passedTests = results.filter(r => r.success).length;
  const failedTests = totalTests - passedTests;
  
  log(`${colors.bright}Total operations: ${totalTests}${colors.reset}`);
  log(`${colors.green}Passed: ${passedTests}${colors.reset}`);
  
  if (failedTests > 0) {
    log(`${colors.red}Failed: ${failedTests}${colors.reset}`);
  }
  
  if (passedTests === totalTests) {
    log(`\n${colors.green}${colors.bright}🎉 All tests passed!${colors.reset}`);
  } else {
    log(`\n${colors.red}${colors.bright}❌ Some tests failed${colors.reset}`);
  }
}

function showHelp() {
  log(`${colors.bright}Audio Recorder App - Test Runner${colors.reset}\n`);
  log('Usage: node scripts/test-runner.js [options]\n');
  log('Options:');
  log('  --watch       Run tests in watch mode');
  log('  --coverage    Generate coverage report');
  log('  --ci          Run in CI mode (no watch, with coverage)');
  log('  --verbose     Verbose output');
  log('  --lint        Run ESLint');
  log('  --type-check  Run TypeScript type checking');
  log('  --help        Show this help message\n');
  log('Examples:');
  log('  node scripts/test-runner.js                    # Run tests once');
  log('  node scripts/test-runner.js --watch            # Run tests in watch mode');
  log('  node scripts/test-runner.js --coverage         # Run tests with coverage');
  log('  node scripts/test-runner.js --ci               # Run in CI mode');
  log('  node scripts/test-runner.js --lint --type-check # Run linting and type checking');
}

// Main execution
function main() {
  if (args.includes('--help')) {
    showHelp();
    return;
  }
  
  log(`${colors.bright}${colors.cyan}Audio Recorder App - Test Runner${colors.reset}\n`);
  
  const results = [];
  
  try {
    // Check dependencies
    checkDependencies();
    
    // Run type checking (if requested or in CI)
    if (options.typeCheck || options.ci) {
      const typeResult = runTypeChecking();
      if (typeResult) results.push(typeResult);
    }
    
    // Run linting (if requested or in CI)
    if (options.lint || options.ci) {
      const lintResult = runLinting();
      if (lintResult) results.push(lintResult);
    }
    
    // Run tests
    const testResult = runTests();
    results.push(testResult);
    
    // Generate coverage report
    generateReport();
    
    // Show summary
    showSummary(results);
    
  } catch (error) {
    log(`${colors.red}Unexpected error: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

// Run the script
main();
