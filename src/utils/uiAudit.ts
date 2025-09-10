// UI/UX Audit Utilities
// P0 - Critical fixes for ROLÊ

export interface AuditIssue {
  page: string;
  component: string;
  description: string;
  severity: 'P0' | 'P1' | 'P2';
  evidence?: string;
  cause?: string;
  solution?: string;
  impactOnUX: string;
  reference?: string;
}

// Color system audit - P0 Critical
export const colorSystemIssues: AuditIssue[] = [
  {
    page: "Global",
    component: "Color System",
    description: "Direct color classes (text-white, bg-black, etc.) used instead of semantic tokens",
    severity: "P0",
    evidence: "305 instances of direct color usage found",
    cause: "Not following design system tokens defined in index.css",
    solution: "Replace all direct colors with semantic tokens (text-foreground, bg-background, etc.)",
    impactOnUX: "Colors may appear wrong in different themes, yellow instead of white",
    reference: "WCAG 2.2 AA contrast requirements"
  },
  {
    page: "Global",
    component: "HSL Color Functions",
    description: "Risk of passing non-HSL colors to hsl() functions",
    severity: "P0",
    evidence: "All colors in index.css should be HSL format",
    cause: "Mixed color formats in CSS variables",
    solution: "Ensure all CSS variables use HSL format only",
    impactOnUX: "Broken color rendering, wrong color display",
    reference: "CSS color specification best practices"
  }
];

// Missing critical pages - P0
export const missingPagesIssues: AuditIssue[] = [
  {
    page: "500 Error Page",
    component: "Error Handling",
    description: "500 error page was missing",
    severity: "P0",
    evidence: "No route defined for /500",
    cause: "Incomplete error handling coverage",
    solution: "Create 500 page with ROLÊ tone and recovery options",
    impactOnUX: "Users see generic browser error on server issues",
    reference: "Error handling best practices"
  }
];

// Performance monitoring - P0
export const performanceIssues: AuditIssue[] = [
  {
    page: "Global",
    component: "Web Vitals Tracking",
    description: "Missing comprehensive Web Vitals monitoring",
    severity: "P0",
    evidence: "Basic monitoring exists but lacks detailed metrics analysis",
    cause: "Incomplete performance monitoring setup",
    solution: "Implement detailed Web Vitals tracking with thresholds",
    impactOnUX: "Cannot identify and fix performance bottlenecks",
    reference: "Google Web Vitals thresholds: LCP < 2.5s, CLS < 0.1, INP < 200ms"
  }
];

// Component state documentation - P1
export const componentStateIssues: AuditIssue[] = [
  {
    page: "Global",
    component: "All Interactive Components",
    description: "Component states not systematically documented",
    severity: "P1",
    evidence: "Missing documentation for hover, focus, disabled, loading, error states",
    cause: "Lack of design system state documentation",
    solution: "Document all component states with examples",
    impactOnUX: "Inconsistent user feedback and accessibility issues",
    reference: "Design system best practices"
  }
];

// Accessibility issues - P1
export const accessibilityIssues: AuditIssue[] = [
  {
    page: "Global",
    component: "WCAG 2.2 AA Compliance",
    description: "Accessibility compliance not systematically verified",
    severity: "P1",
    evidence: "Need systematic WCAG 2.2 AA audit",
    cause: "Missing accessibility verification process",
    solution: "Implement systematic accessibility testing",
    impactOnUX: "Potential barriers for users with disabilities",
    reference: "WCAG 2.2 AA guidelines"
  }
];

// Responsiveness issues - P1
export const responsivenessIssues: AuditIssue[] = [
  {
    page: "Global",
    component: "Mobile Responsiveness",
    description: "Mobile responsiveness needs systematic verification",
    severity: "P1",
    evidence: "Need testing across 320px, 768px, 1024px, 1280px breakpoints",
    cause: "Incomplete responsive design testing",
    solution: "Systematic responsive design audit and fixes",
    impactOnUX: "Poor mobile experience, broken layouts",
    reference: "Mobile-first design principles"
  }
];

// Microcopy issues - P2
export const microcopyIssues: AuditIssue[] = [
  {
    page: "Global",
    component: "Microcopy and Tone",
    description: "Inconsistent ROLÊ tone and messaging",
    severity: "P2",
    evidence: "Mix of formal and informal language across components",
    cause: "Lack of consistent tone guidelines application",
    solution: "Standardize all copy to ROLÊ brand tone",
    impactOnUX: "Inconsistent brand experience",
    reference: "ROLÊ brand guidelines"
  }
];

// Get all audit issues by priority
export const getAllIssuesByPriority = () => {
  const allIssues = [
    ...colorSystemIssues,
    ...missingPagesIssues,
    ...performanceIssues,
    ...componentStateIssues,
    ...accessibilityIssues,
    ...responsivenessIssues,
    ...microcopyIssues
  ];

  return {
    P0: allIssues.filter(issue => issue.severity === 'P0'),
    P1: allIssues.filter(issue => issue.severity === 'P1'),
    P2: allIssues.filter(issue => issue.severity === 'P2')
  };
};

// Performance thresholds per Google recommendations
export const performanceThresholds = {
  LCP: { good: 2500, poor: 4000 }, // Largest Contentful Paint
  CLS: { good: 0.1, poor: 0.25 },   // Cumulative Layout Shift
  INP: { good: 200, poor: 500 },    // Interaction to Next Paint
  FCP: { good: 1800, poor: 3000 },  // First Contentful Paint
  TTFB: { good: 800, poor: 1800 }   // Time to First Byte
};

// Accessibility requirements checklist
export const accessibilityChecklist = [
  'Contrast ratio 4.5:1 for normal text, 3:1 for large text',
  'Focus visible on all interactive elements',
  'Alt text for all images',
  'Semantic HTML structure',
  'Keyboard navigation support',
  'Screen reader compatibility',
  'Minimum touch target size 44px',
  'Form labels and error messages',
  'Logical tab order'
];

// Mobile responsiveness checklist
export const responsiveChecklist = [
  'Works on 320px minimum width',
  'Touch targets minimum 44px',
  'Text remains readable without horizontal scrolling',
  'Interactive elements accessible with finger touch',
  'Safe areas considered for iOS/Android',
  'Keyboard doesn\'t break layout on mobile',
  'Orientation changes handled gracefully'
];

// Export summary for reporting
export const generateAuditReport = () => {
  const issues = getAllIssuesByPriority();
  
  return {
    summary: {
      total: Object.values(issues).flat().length,
      P0: issues.P0.length,
      P1: issues.P1.length,
      P2: issues.P2.length
    },
    issues,
    performanceThresholds,
    accessibilityChecklist,
    responsiveChecklist,
    recommendations: [
      'Fix all P0 issues immediately - they break core functionality',
      'Address P1 issues in next sprint - they impact user experience',
      'Schedule P2 issues for continuous improvement',
      'Implement automated testing for color system compliance',
      'Set up performance monitoring dashboard',
      'Create accessibility testing workflow'
    ]
  };
};