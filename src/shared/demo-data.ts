// Demo data for testing UI without API
import type { ReviewResponse } from './types';

export const DEMO_CODE = `function processUserData(users) {
  let html = "";
  for (let i = 0; i < users.length; i++) {
    let user = users[i];
    html += "<div class='user-card'>";
    html += "<p>" + user.email + "</p>";
    if (user.isAdmin == true) {
      html += "<span class='admin-badge'>Admin</span>";
    }
    html += "</div>";
  }
  // TODO: Add error handling
  return html;
}

const userData = fetchUsers();
processUserData(userData);`;

export const DEMO_RESULT: ReviewResponse = {
    score: 75,
    categories: {
        security: 88,
        performance: 68,
        readability: 62,
        bestPractices: 82,
    },
    issues: [
        {
            id: 'issue-1',
            severity: 'warning',
            line: 14,
            title: 'Incomplete Work Detected',
            description: "There's a TODO comment in the code indicating unfinished work. This should be addressed or tracked before the code is considered complete.",
        },
        {
            id: 'issue-2',
            severity: 'warning',
            line: 18,
            title: 'Missing Input Validation',
            description: 'The function is called directly without checking if userData is defined. This could cause crashes if the data is missing or malformed.',
        },
    ],
    suggestions: [
        {
            id: 'suggestion-1',
            title: 'Simplify Boolean Comparisons',
            description: 'Instead of checking "== true", you can just use the value directly. This makes your code cleaner and easier to read.',
            codeSnippet: 'if (user.isAdmin) instead of if (user.isAdmin == true)',
        },
        {
            id: 'suggestion-2',
            title: 'Use Modern Loop Syntax',
            description: 'The traditional for loop can be replaced with forEach or for...of which is more readable and less error-prone.',
            codeSnippet: 'users.forEach(user => { ... })',
        },
        {
            id: 'suggestion-3',
            title: 'Use Template Literals',
            description: 'String concatenation with + is harder to read. Template literals make your HTML generation much cleaner.',
            codeSnippet: '`<div class="user-card"><p>${user.email}</p></div>`',
        },
    ],
    proposedChanges: [
        {
            id: 'change-1',
            title: 'Add Input Validation',
            description: 'Add a check to ensure users is an array before processing',
            lineStart: 1,
            lineEnd: 5,
            diff: `@@ -1,5 +1,8 @@
 function processUserData(users) {
+  // Validate input
+  if (!Array.isArray(users)) {
+    console.error('Users must be an array');
+    return '';
+  }
   let html = "";`,
            fixedCode: `function processUserData(users) {
  // Validate input
  if (!Array.isArray(users)) {
    console.error('Users must be an array');
    return '';
  }
  let html = "";
  for (let i = 0; i < users.length; i++) {
    let user = users[i];
    html += "<div class='user-card'>";
    html += "<p>" + user.email + "</p>";
    if (user.isAdmin) {
      html += "<span class='admin-badge'>Admin</span>";
    }
    html += "</div>";
  }
  return html;
}`,
        },
    ],
    actionItems: [
        {
            id: 'action-1',
            priority: 'high',
            title: 'Add input validation for the users parameter',
            description: 'Prevent crashes by validating the input before processing',
            relatedIssueId: 'issue-2',
            relatedChangeId: 'change-1',
        },
        {
            id: 'action-2',
            priority: 'low',
            title: 'Optimize string building with array join',
            description: 'Use array.push() and join() instead of string concatenation for better performance',
        },
        {
            id: 'action-3',
            priority: 'low',
            title: 'Apply readability improvements (boolean checks, modern loops)',
            description: 'Modernize the code style for better maintainability',
            relatedSuggestionId: 'suggestion-1',
        },
    ],
};
