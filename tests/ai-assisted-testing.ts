// AI-Assisted Testing Framework for SpaarApp
// Comprehensive testing with accessibility, security, and ADHD-UX validation

import { test, expect, Page, BrowserContext } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';
import * as fs from 'fs';
import * as path from 'path';

// Test data generators
import { generateTestTransactions, generateTestBudgets } from '../utils/test-data-generators';

// AI Test Analytics
interface TestResult {
  testName: string;
  passed: boolean;
  duration: number;
  accessibilityViolations: number;
  cognitiveLoadScore: number;
  securityIssues: number;
  aiRecommendations: string[];
}

interface CognitiveLoadMetrics {
  visualComplexity: number; // 0-100
  choiceOverload: number;  // Number of choices on screen
  textDensity: number;     // Characters per square unit
  interactionComplexity: number; // Steps to complete task
}

class AITestAssistant {
  private testResults: TestResult[] = [];
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // Accessibility testing with AI analysis
  async analyzeAccessibility(): Promise<{ violations: any[], score: number, recommendations: string[] }> {
    const accessibilityScan = await new AxeBuilder({ page: this.page }).analyze();

    // AI-powered accessibility analysis
    const violations = accessibilityScan.violations;
    const score = Math.max(0, 100 - (violations.length * 10));

    const recommendations = this.generateAccessibilityRecommendations(violations);

    return {
      violations,
      score,
      recommendations
    };
  }

  // ADHD-UX cognitive load analysis
  async analyzeCognitiveLoad(): Promise<CognitiveLoadMetrics & { score: number, recommendations: string[] }> {
    const page = this.page;

    // Visual complexity analysis
    const visualElements = await page.locator('*').count();
    const interactiveElements = await page.locator('button, input, select, a').count();
    const textElements = await page.locator('p, h1, h2, h3, h4, h5, h6, span, div').count();

    // Choice analysis
    const selectOptions = await page.locator('select option').count();
    const buttonOptions = await page.locator('button').count();
    const totalChoices = selectOptions + buttonOptions;

    // Text density
    const pageContent = await page.content();
    const textLength = pageContent.replace(/<[^>]*>/g, '').length;
    const textDensity = textLength / 1000; // Simplified density metric

    // Interaction complexity (steps to complete primary task)
    const interactionComplexity = await this.measureInteractionComplexity();

    const visualComplexity = Math.min(100, (visualElements / 10));
    const choiceOverload = Math.min(100, (totalChoices / 5) * 20);

    const metrics: CognitiveLoadMetrics = {
      visualComplexity,
      choiceOverload,
      textDensity,
      interactionComplexity
    };

    // Calculate overall cognitive load score (lower is better)
    const cognitiveLoadScore = (
      (visualComplexity * 0.3) +
      (choiceOverload * 0.3) +
      (Math.min(100, textDensity / 10) * 0.2) +
      (interactionComplexity * 0.2)
    );

    const recommendations = this.generateCognitiveLoadRecommendations(metrics);

    return {
      ...metrics,
      score: Math.round(cognitiveLoadScore),
      recommendations
    };
  }

  // Security testing for financial data
  async analyzeFinancialSecurity(): Promise<{ issues: string[], score: number, recommendations: string[] }> {
    const page = this.page;
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Check for sensitive data exposure
    const content = await page.content();
    const sensitivePatterns = [
      /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/, // Credit card patterns
      /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/, // SSN-like patterns
      /\b\d{2}[A-Z]{4}\d{2}\b/, // IBAN patterns
    ];

    sensitivePatterns.forEach(pattern => {
      if (pattern.test(content)) {
        issues.push('Potential sensitive data exposure detected');
        recommendations.push('Ensure sensitive data is masked or encrypted');
      }
    });

    // Check for HTTPS in production
    const url = page.url();
    if (!url.startsWith('https://') && !url.includes('localhost')) {
      issues.push('Non-HTTPS connection detected');
      recommendations.push('Always use HTTPS for financial applications');
    }

    // Check for input validation
    const inputs = page.locator('input[type="text"], input[type="number"], textarea');
    const inputCount = await inputs.count();

    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);
      const hasValidation = await input.getAttribute('pattern') ||
                          await input.getAttribute('required') ||
                          await input.getAttribute('min') ||
                          await input.getAttribute('max');

      if (!hasValidation) {
        issues.push('Input without proper validation detected');
        recommendations.push('Add client-side validation for all financial inputs');
      }
    }

    const score = Math.max(0, 100 - (issues.length * 15));

    return { issues, score, recommendations };
  }

  // Generate AI-powered test recommendations
  private generateAccessibilityRecommendations(violations: any[]): string[] {
    const recommendations: string[] = [];

    violations.forEach(violation => {
      switch (violation.id) {
        case 'color-contrast':
          recommendations.push('Increase color contrast ratio to at least 4.5:1 for normal text');
          break;
        case 'keyboard-navigation':
          recommendations.push('Ensure all interactive elements are keyboard accessible');
          break;
        case 'aria-labels':
          recommendations.push('Add proper ARIA labels for screen reader compatibility');
          break;
        case 'focus-indicators':
          recommendations.push('Add visible focus indicators for keyboard navigation');
          break;
        default:
          recommendations.push(`Fix accessibility issue: ${violation.description}`);
      }
    });

    return recommendations;
  }

  private generateCognitiveLoadRecommendations(metrics: CognitiveLoadMetrics): string[] {
    const recommendations: string[] = [];

    if (metrics.visualComplexity > 70) {
      recommendations.push('Reduce visual complexity by removing non-essential elements');
      recommendations.push('Use white space more effectively to reduce cognitive load');
    }

    if (metrics.choiceOverload > 50) {
      recommendations.push('Limit choices to 3-4 options maximum');
      recommendations.push('Use progressive disclosure for complex decisions');
    }

    if (metrics.textDensity > 80) {
      recommendations.push('Break up long text into smaller, scannable chunks');
      recommendations.push('Use headings and bullet points to improve readability');
    }

    if (metrics.interactionComplexity > 3) {
      recommendations.push('Simplify workflows to reduce steps to completion');
      recommendations.push('Provide clear progress indicators for multi-step processes');
    }

    return recommendations;
  }

  private async measureInteractionComplexity(): Promise<number> {
    // Simulate measuring steps to complete primary task
    // This is a simplified version - in reality, this would be more sophisticated
    const primaryActions = await this.page.locator('button[type="submit"], .primary-action').count();
    const formFields = await this.page.locator('input, select, textarea').count();

    // Estimate complexity based on form fields and primary actions
    return Math.min(5, Math.ceil(formFields / 3) + primaryActions);
  }

  // Record test results
  async recordTestResult(testName: string, passed: boolean, duration: number,
                        accessibilityScore: number, cognitiveLoadScore: number,
                        securityScore: number, recommendations: string[]) {
    const result: TestResult = {
      testName,
      passed,
      duration,
      accessibilityViolations: Math.max(0, 100 - accessibilityScore),
      cognitiveLoadScore,
      securityIssues: Math.max(0, 100 - securityScore),
      aiRecommendations: recommendations
    };

    this.testResults.push(result);

    // Log results for AI analysis
    console.log(`Test: ${testName}`);
    console.log(`  Passed: ${passed}`);
    console.log(`  Accessibility Score: ${accessibilityScore}/100`);
    console.log(`  Cognitive Load Score: ${cognitiveLoadScore}/100 (lower is better)`);
    console.log(`  Security Score: ${securityScore}/100`);
    console.log(`  AI Recommendations: ${recommendations.length}`);
  }

  // Generate AI test report
  generateTestReport(): string {
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(r => r.passed).length;
    const avgAccessibility = this.testResults.reduce((sum, r) => sum + (100 - r.accessibilityViolations), 0) / totalTests;
    const avgCognitiveLoad = this.testResults.reduce((sum, r) => sum + r.cognitiveLoadScore, 0) / totalTests;
    const avgSecurity = this.testResults.reduce((sum, r) => sum + (100 - r.securityIssues), 0) / totalTests;

    const allRecommendations = this.testResults.flatMap(r => r.aiRecommendations);
    const uniqueRecommendations = [...new Set(allRecommendations)];

    return `
# SpaarApp AI-Assisted Test Report

## Test Summary
- Total Tests: ${totalTests}
- Passed: ${passedTests} (${((passedTests/totalTests) * 100).toFixed(1)}%)
- Failed: ${totalTests - passedTests}

## Quality Metrics
- **Accessibility Score**: ${avgAccessibility.toFixed(1)}/100
- **Cognitive Load Score**: ${avgCognitiveLoad.toFixed(1)}/100 (lower is better)
- **Security Score**: ${avgSecurity.toFixed(1)}/100

## AI-Generated Recommendations
${uniqueRecommendations.map(rec => `- ${rec}`).join('\n')}

## Detailed Results
${this.testResults.map(result => `
### ${result.testName}
- Status: ${result.passed ? '✅ PASSED' : '❌ FAILED'}
- Duration: ${result.duration}ms
- Accessibility: ${100 - result.accessibilityViolations}/100
- Cognitive Load: ${result.cognitiveLoadScore}/100
- Security: ${100 - result.securityIssues}/100
- Recommendations: ${result.aiRecommendations.length}
`).join('\n')}
    `.trim();
  }

  // Save test report
  async saveTestReport(fileName: string = 'ai-test-report.md') {
    const report = this.generateTestReport();
    const reportPath = path.join(__dirname, '../test-reports', fileName);

    // Ensure directory exists
    const reportsDir = path.dirname(reportPath);
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    fs.writeFileSync(reportPath, report);
    console.log(`Test report saved to: ${reportPath}`);
  }
}

// Test suites with AI assistance

test.describe('SpaarApp AI-Assisted Testing', () => {
  let aiAssistant: AITestAssistant;
  let page: Page;
  let context: BrowserContext;

  test.beforeAll(async ({ browser }) => {
    context = await browser.newContext({
      viewport: { width: 1200, height: 800 }
    });
    page = await context.newPage();
    aiAssistant = new AITestAssistant(page);
  });

  test.afterAll(async () => {
    await aiAssistant.saveTestReport();
    await context.close();
  });

  test('Budget Overview - ADHD-UX & Accessibility', async () => {
    const startTime = Date.now();

    // Navigate to budget overview
    await page.goto('http://localhost:1420/budget');
    await page.waitForLoadState('networkidle');

    // AI analyses
    const accessibility = await aiAssistant.analyzeAccessibility();
    const cognitiveLoad = await aiAssistant.analyzeCognitiveLoad();
    const security = await aiAssistant.analyzeFinancialSecurity();

    // Core functionality tests
    await expect(page.locator('h1')).toContainText('Budget Overzicht');
    await expect(page.locator('[data-testid="safe-to-spend"]')).toBeVisible();

    // ADHD-specific tests
    const safeToSpendElement = page.locator('[data-testid="safe-to-spend"]');
    const safeToSpendText = await safeToSpendElement.textContent();

    // Verify single-number focus
    expect(safeToSpendText).toMatch(/€\d+,\d{2}/);

    // Test progressive disclosure
    const detailsButton = page.locator('[data-testid="show-details"]');
    if (await detailsButton.isVisible()) {
      await detailsButton.click();
      await expect(page.locator('[data-testid="budget-details"]')).toBeVisible();
    }

    const duration = Date.now() - startTime;
    const passed = accessibility.score >= 80 && cognitiveLoad.score <= 60 && security.score >= 80;

    const recommendations = [
      ...accessibility.recommendations,
      ...cognitiveLoad.recommendations,
      ...security.recommendations
    ];

    await aiAssistant.recordTestResult(
      'Budget Overview - ADHD-UX & Accessibility',
      passed,
      duration,
      accessibility.score,
      cognitiveLoad.score,
      security.score,
      recommendations
    );

    // Accessibility assertions
    expect(accessibility.violations.length).toBeLessThan(3);

    // Cognitive load assertions (ADHD-specific)
    expect(cognitiveLoad.choiceOverload).toBeLessThan(50);
    expect(cognitiveLoad.visualComplexity).toBeLessThan(70);

    // Security assertions
    expect(security.issues.length).toBe(0);
  });

  test('Transaction Input - Security & Validation', async () => {
    const startTime = Date.now();

    await page.goto('http://localhost:1420/transactions/add');
    await page.waitForLoadState('networkidle');

    // AI analyses
    const accessibility = await aiAssistant.analyzeAccessibility();
    const cognitiveLoad = await aiAssistant.analyzeCognitiveLoad();
    const security = await aiAssistant.analyzeFinancialSecurity();

    // Test form validation
    const amountInput = page.locator('input[name="amount"]');
    const descriptionInput = page.locator('input[name="description"]');
    const submitButton = page.locator('button[type="submit"]');

    // Test required field validation
    await submitButton.click();
    await expect(page.locator('[data-testid="error-amount"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-description"]')).toBeVisible();

    // Test amount validation
    await amountInput.fill('-50');
    await submitButton.click();
    await expect(page.locator('[data-testid="error-amount"]')).toContainText('positief');

    // Test valid input
    await amountInput.fill('25,50');
    await descriptionInput.fill('Test transactie');
    await submitButton.click();

    // Success confirmation
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();

    const duration = Date.now() - startTime;
    const passed = accessibility.score >= 80 && cognitiveLoad.score <= 60 && security.score >= 80;

    const recommendations = [
      ...accessibility.recommendations,
      ...cognitiveLoad.recommendations,
      ...security.recommendations
    ];

    await aiAssistant.recordTestResult(
      'Transaction Input - Security & Validation',
      passed,
      duration,
      accessibility.score,
      cognitiveLoad.score,
      security.score,
      recommendations
    );

    // Security assertions
    expect(security.issues.length).toBe(0);

    // Input validation assertions
    const inputs = page.locator('input[required], input[pattern], input[min], input[max]');
    expect(await inputs.count()).toBeGreaterThan(0);
  });

  test('Data Export - Privacy & Security', async () => {
    const startTime = Date.now();

    await page.goto('http://localhost:1420/export');
    await page.waitForLoadState('networkidle');

    // AI analyses
    const accessibility = await aiAssistant.analyzeAccessibility();
    const cognitiveLoad = await aiAssistant.analyzeCognitiveLoad();
    const security = await aiAssistant.analyzeFinancialSecurity();

    // Test export options
    const exportButton = page.locator('button[data-export="csv"]');

    // Verify privacy notice
    await expect(page.locator('[data-testid="privacy-notice"]')).toContainText('versleuteld');

    // Test export download
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      exportButton.click()
    ]);

    // Verify download filename
    expect(download.suggestedFilename()).toMatch(/spaarapp-export.*\.csv$/);

    const duration = Date.now() - startTime;
    const passed = accessibility.score >= 80 && cognitiveLoad.score <= 60 && security.score >= 80;

    const recommendations = [
      ...accessibility.recommendations,
      ...cognitiveLoad.recommendations,
      ...security.recommendations
    ];

    await aiAssistant.recordTestResult(
      'Data Export - Privacy & Security',
      passed,
      duration,
      accessibility.score,
      cognitiveLoad.score,
      security.score,
      recommendations
    );

    // GDPR compliance assertions
    await expect(page.locator('[data-testid="gdpr-notice"]')).toBeVisible();
    await expect(page.locator('button[data-action="delete-all-data"]')).toBeVisible();
  });

  test('Responsive Design - Mobile Accessibility', async () => {
    const startTime = Date.now();

    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:1420');
    await page.waitForLoadState('networkidle');

    // AI analyses
    const accessibility = await aiAssistant.analyzeAccessibility();
    const cognitiveLoad = await aiAssistant.analyzeCognitiveLoad();

    // Test mobile navigation
    const mobileMenuButton = page.locator('button[aria-label="Menu"]');
    if (await mobileMenuButton.isVisible()) {
      await mobileMenuButton.click();
      await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
    }

    // Test touch targets (minimum 44x44px for accessibility)
    const touchTargets = page.locator('button, a, input, select');
    const touchTargetCount = await touchTargets.count();

    for (let i = 0; i < Math.min(touchTargetCount, 10); i++) {
      const target = touchTargets.nth(i);
      const boundingBox = await target.boundingBox();
      if (boundingBox) {
        expect(boundingBox.width).toBeGreaterThanOrEqual(44);
        expect(boundingBox.height).toBeGreaterThanOrEqual(44);
      }
    }

    const duration = Date.now() - startTime;
    const passed = accessibility.score >= 80 && cognitiveLoad.score <= 60;

    const recommendations = [
      ...accessibility.recommendations,
      ...cognitiveLoad.recommendations
    ];

    await aiAssistant.recordTestResult(
      'Responsive Design - Mobile Accessibility',
      passed,
      duration,
      accessibility.score,
      cognitiveLoad.score,
      100, // Security not applicable for responsive test
      recommendations
    );
  });
});

// Performance testing with AI insights
test.describe('Performance Tests with AI Analysis', () => {
  test('Page Load Performance', async ({ page }) => {
    const startTime = Date.now();

    // Navigate to main page
    const response = await page.goto('http://localhost:1420');

    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;

    // Performance metrics
    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
        firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
      };
    });

    // AI performance analysis
    const performanceScore = calculatePerformanceScore(loadTime, performanceMetrics);
    const recommendations = generatePerformanceRecommendations(loadTime, performanceMetrics);

    console.log('Performance Metrics:', performanceMetrics);
    console.log('Performance Score:', performanceScore);
    console.log('Recommendations:', recommendations);

    // Performance assertions
    expect(loadTime).toBeLessThan(3000); // 3 seconds max
    expect(performanceMetrics.firstContentfulPaint).toBeLessThan(2000); // 2 seconds max
    expect(performanceScore).toBeGreaterThan(80);
  });
});

function calculatePerformanceScore(loadTime: number, metrics: any): number {
  let score = 100;

  // Load time impact
  if (loadTime > 3000) score -= 30;
  else if (loadTime > 2000) score -= 15;
  else if (loadTime > 1000) score -= 5;

  // First Contentful Paint impact
  if (metrics.firstContentfulPaint > 2000) score -= 25;
  else if (metrics.firstContentfulPaint > 1000) score -= 10;

  return Math.max(0, score);
}

function generatePerformanceRecommendations(loadTime: number, metrics: any): string[] {
  const recommendations: string[] = [];

  if (loadTime > 2000) {
    recommendations.push('Optimize page load time through code splitting and lazy loading');
  }

  if (metrics.firstContentfulPaint > 1000) {
    recommendations.push('Improve first paint by optimizing critical CSS and reducing render-blocking resources');
  }

  if (metrics.domContentLoaded > 500) {
    recommendations.push('Reduce DOM complexity to improve parsing performance');
  }

  return recommendations;
}