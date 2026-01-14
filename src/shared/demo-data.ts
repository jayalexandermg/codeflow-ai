// Demo data for testing UI without API
// 3 different demo scenarios for variance
import type { ReviewResponse } from './types';

// ============================================
// DEMO 1: JavaScript User Processing (Security Focus)
// ============================================
export const DEMO_CODE_1 = `function processUserData(users) {
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

export const DEMO_RESULT_1: ReviewResponse = {
    score: 72,
    summary: "Code has security concerns and missing error handling that need attention before shipping.",
    categories: {
        security: 65,
        performance: 70,
        readability: 68,
        bestPractices: 75,
    },
    issues: [
        {
            id: 'issue-1',
            severity: 'critical',
            category: 'security',
            line: 5,
            title: 'Potential XSS Vulnerability',
            description: "User email is being inserted directly into HTML without sanitization. An attacker could inject malicious scripts through the email field that would execute in other users' browsers.",
            fix: {
                description: 'Escape HTML characters in user input',
                before: 'html += "<p>" + user.email + "</p>";',
                after: 'html += "<p>" + escapeHtml(user.email) + "</p>";',
            },
        },
        {
            id: 'issue-2',
            severity: 'warning',
            category: 'errorHandling',
            line: 14,
            title: 'Missing Input Validation',
            description: 'The function is called without checking if userData exists. If fetchUsers() fails or returns undefined, this will crash your app.',
            fix: {
                description: 'Add null check before processing',
                before: 'processUserData(userData);',
                after: 'if (userData && Array.isArray(userData)) {\n  processUserData(userData);\n}',
            },
        },
        {
            id: 'issue-3',
            severity: 'warning',
            category: 'bugs',
            line: 11,
            title: 'TODO Left in Production Code',
            description: "There's unfinished work marked with a TODO. This error handling should be implemented before deployment.",
        },
    ],
    suggestions: [
        {
            id: 'suggestion-1',
            category: 'readability',
            title: 'Use Strict Equality',
            description: 'Using == instead of === can cause unexpected type coercion bugs.',
            before: 'if (user.isAdmin == true)',
            after: 'if (user.isAdmin === true)',
        },
        {
            id: 'suggestion-2',
            category: 'performance',
            title: 'Use Template Literals',
            description: 'String concatenation with + is slower and harder to read than template literals.',
            before: 'html += "<p>" + user.email + "</p>";',
            after: 'html += `<p>${escapeHtml(user.email)}</p>`;',
        },
    ],
    proposedChanges: [
        {
            id: 'change-1',
            title: 'Add XSS Protection',
            description: 'Sanitize user input to prevent script injection attacks',
            before: 'html += "<p>" + user.email + "</p>";',
            after: 'html += `<p>${escapeHtml(user.email)}</p>`;',
            lineStart: 5,
            lineEnd: 5,
        },
        {
            id: 'change-2',
            title: 'Add Input Validation',
            description: 'Check if users array exists before processing',
            before: 'processUserData(userData);',
            after: 'if (userData?.length) processUserData(userData);',
            lineStart: 14,
            lineEnd: 14,
        },
    ],
    actionItems: [
        {
            id: 'action-1',
            priority: 'high',
            title: 'Fix XSS vulnerability in email display',
            description: 'Critical security issue that could allow attackers to steal user data',
            relatedIssueId: 'issue-1',
        },
        {
            id: 'action-2',
            priority: 'high',
            title: 'Add input validation for users parameter',
            description: 'Prevent runtime crashes from missing data',
            relatedIssueId: 'issue-2',
        },
        {
            id: 'action-3',
            priority: 'low',
            title: 'Complete TODO for error handling',
            description: 'Finish the unfinished work before shipping',
        },
    ],
};

// ============================================
// DEMO 2: Python API Handler (Performance Focus)
// ============================================
export const DEMO_CODE_2 = `def get_user_orders(user_id):
    user = db.query("SELECT * FROM users WHERE id = " + user_id)
    orders = []
    
    for order_id in user.order_ids:
        order = db.query("SELECT * FROM orders WHERE id = " + str(order_id))
        items = db.query("SELECT * FROM items WHERE order_id = " + str(order_id))
        order.items = items
        orders.append(order)
    
    return orders

def calculate_total(orders):
    total = 0
    for order in orders:
        for item in order.items:
            total = total + item.price
    return total`;

export const DEMO_RESULT_2: ReviewResponse = {
    score: 58,
    summary: "Critical SQL injection vulnerability and severe N+1 query performance issue need immediate attention.",
    categories: {
        security: 25,
        performance: 45,
        readability: 78,
        bestPractices: 65,
    },
    issues: [
        {
            id: 'issue-1',
            severity: 'critical',
            category: 'security',
            line: 2,
            title: 'SQL Injection Vulnerability',
            description: "User input is directly concatenated into SQL queries. An attacker could input something like \"1; DROP TABLE users;--\" to delete your entire database or steal all user data.",
            fix: {
                description: 'Use parameterized queries',
                before: 'db.query("SELECT * FROM users WHERE id = " + user_id)',
                after: 'db.query("SELECT * FROM users WHERE id = ?", [user_id])',
            },
        },
        {
            id: 'issue-2',
            severity: 'critical',
            category: 'performance',
            line: 5,
            title: 'N+1 Query Problem',
            description: "This code makes a separate database call for EVERY order. If a user has 100 orders, it makes 200+ database queries instead of 2. This will make your app extremely slow.",
            fix: {
                description: 'Batch the queries with JOIN or IN clause',
                before: 'for order_id in user.order_ids:\n    order = db.query(...)',
                after: 'orders = db.query("SELECT * FROM orders WHERE id IN (?)", [user.order_ids])',
            },
        },
        {
            id: 'issue-3',
            severity: 'warning',
            category: 'errorHandling',
            line: 2,
            title: 'No Error Handling for Missing User',
            description: "If the user doesn't exist, this will crash. You need to handle the case where the query returns nothing.",
        },
    ],
    suggestions: [
        {
            id: 'suggestion-1',
            category: 'performance',
            title: 'Use SUM in Database',
            description: 'Instead of summing in Python, let the database do it - much faster for large datasets.',
            before: 'for item in order.items:\n    total = total + item.price',
            after: 'total = db.query("SELECT SUM(price) FROM items WHERE order_id IN (?)", order_ids)',
        },
        {
            id: 'suggestion-2',
            category: 'readability',
            title: 'Use += Operator',
            description: 'Python has shorthand operators that make code cleaner.',
            before: 'total = total + item.price',
            after: 'total += item.price',
        },
    ],
    proposedChanges: [
        {
            id: 'change-1',
            title: 'Fix SQL Injection',
            description: 'Use parameterized queries to prevent injection attacks',
            before: '"SELECT * FROM users WHERE id = " + user_id',
            after: '"SELECT * FROM users WHERE id = ?", [user_id]',
            lineStart: 2,
            lineEnd: 2,
        },
        {
            id: 'change-2',
            title: 'Fix N+1 Query',
            description: 'Batch database queries to improve performance 100x',
            before: 'for order_id in user.order_ids:\n    order = db.query(...)',
            after: 'orders = db.query("SELECT o.*, i.* FROM orders o JOIN items i...", [user.order_ids])',
            lineStart: 5,
            lineEnd: 8,
        },
    ],
    actionItems: [
        {
            id: 'action-1',
            priority: 'high',
            title: 'URGENT: Fix SQL injection vulnerability',
            description: 'This is a critical security flaw that exposes your entire database',
            relatedIssueId: 'issue-1',
        },
        {
            id: 'action-2',
            priority: 'high',
            title: 'Fix N+1 query performance issue',
            description: 'Your app will be unusable for users with many orders',
            relatedIssueId: 'issue-2',
        },
        {
            id: 'action-3',
            priority: 'high',
            title: 'Add error handling for missing users',
            description: 'Prevent crashes when user is not found',
        },
        {
            id: 'action-4',
            priority: 'low',
            title: 'Move total calculation to database',
            description: 'Performance optimization for large order sets',
        },
    ],
};

// ============================================
// DEMO 3: React Component (Best Practices Focus)
// ============================================
export const DEMO_CODE_3 = `function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetch('/api/users/' + userId)
      .then(res => res.json())
      .then(data => {
        setUser(data);
        setLoading(false);
      });
  });
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      <h1>{user.name}</h1>
      <p dangerouslySetInnerHTML={{__html: user.bio}} />
      <button onClick={() => deleteUser(user.id)}>Delete</button>
    </div>
  );
}`;

export const DEMO_RESULT_3: ReviewResponse = {
    score: 68,
    summary: "Infinite re-render loop and XSS vulnerability detected. Good structure but needs fixes.",
    categories: {
        security: 50,
        performance: 55,
        readability: 85,
        bestPractices: 72,
    },
    issues: [
        {
            id: 'issue-1',
            severity: 'critical',
            category: 'bugs',
            line: 5,
            title: 'Infinite useEffect Loop',
            description: "This useEffect has no dependency array, so it runs on EVERY render. This creates an infinite loop: fetch → setUser → re-render → fetch again. Your app will crash or make thousands of API calls.",
            fix: {
                description: 'Add dependency array to useEffect',
                before: 'useEffect(() => {\n    fetch(...)',
                after: 'useEffect(() => {\n    fetch(...)\n  }, [userId]);',
            },
        },
        {
            id: 'issue-2',
            severity: 'critical',
            category: 'security',
            line: 18,
            title: 'XSS via dangerouslySetInnerHTML',
            description: "Using dangerouslySetInnerHTML with user content is extremely dangerous. If any user puts <script>stealPassword()</script> in their bio, it will execute for everyone who views their profile.",
            fix: {
                description: 'Use a sanitization library or render as plain text',
                before: '<p dangerouslySetInnerHTML={{__html: user.bio}} />',
                after: '<p>{user.bio}</p>  // or use DOMPurify.sanitize(user.bio)',
            },
        },
        {
            id: 'issue-3',
            severity: 'warning',
            category: 'errorHandling',
            line: 6,
            title: 'No Error Handling for Fetch',
            description: "If the API call fails, nothing happens. The user will be stuck on 'Loading...' forever with no indication of what went wrong.",
            fix: {
                description: 'Add .catch() to handle errors',
                before: '.then(data => setUser(data));',
                after: '.then(data => setUser(data))\n  .catch(err => setError(err.message));',
            },
        },
    ],
    suggestions: [
        {
            id: 'suggestion-1',
            category: 'bestPractices',
            title: 'Add Confirmation for Delete',
            description: "A simple click shouldn't delete a user permanently. Add a confirmation dialog.",
            before: '<button onClick={() => deleteUser(user.id)}>',
            after: '<button onClick={() => confirm("Are you sure?") && deleteUser(user.id)}>',
        },
        {
            id: 'suggestion-2',
            category: 'bestPractices',
            title: 'Handle Null User State',
            description: 'After loading is false, user could still be null if fetch failed.',
            before: 'if (loading) return <div>Loading...</div>;',
            after: 'if (loading) return <div>Loading...</div>;\nif (!user) return <div>User not found</div>;',
        },
        {
            id: 'suggestion-3',
            category: 'performance',
            title: 'Use React Query or SWR',
            description: 'These libraries handle caching, revalidation, and error states automatically.',
            before: 'const [user, setUser] = useState(null);\nuseEffect(() => fetch...',
            after: 'const { data: user, isLoading, error } = useQuery(["user", userId], fetchUser);',
        },
    ],
    proposedChanges: [
        {
            id: 'change-1',
            title: 'Fix Infinite Loop',
            description: 'Add userId to dependency array',
            before: 'useEffect(() => {\n    fetch...\n  });',
            after: 'useEffect(() => {\n    fetch...\n  }, [userId]);',
            lineStart: 5,
            lineEnd: 11,
        },
        {
            id: 'change-2',
            title: 'Remove XSS Risk',
            description: 'Render bio as plain text instead of HTML',
            before: '<p dangerouslySetInnerHTML={{__html: user.bio}} />',
            after: '<p>{user.bio}</p>',
            lineStart: 18,
            lineEnd: 18,
        },
        {
            id: 'change-3',
            title: 'Add Error Handling',
            description: 'Catch fetch errors and show error state',
            before: '.then(data => {\n        setUser(data);\n        setLoading(false);\n      });',
            after: '.then(data => {\n        setUser(data);\n        setLoading(false);\n      })\n      .catch(err => {\n        setError(err.message);\n        setLoading(false);\n      });',
            lineStart: 7,
            lineEnd: 10,
        },
    ],
    actionItems: [
        {
            id: 'action-1',
            priority: 'high',
            title: 'Fix infinite useEffect loop immediately',
            description: 'This will crash the browser or spam your API',
            relatedIssueId: 'issue-1',
        },
        {
            id: 'action-2',
            priority: 'high',
            title: 'Remove dangerouslySetInnerHTML',
            description: 'Critical XSS vulnerability that could compromise all users',
            relatedIssueId: 'issue-2',
        },
        {
            id: 'action-3',
            priority: 'high',
            title: 'Add error handling for API calls',
            description: 'Users deserve feedback when something goes wrong',
            relatedIssueId: 'issue-3',
        },
        {
            id: 'action-4',
            priority: 'low',
            title: 'Add delete confirmation',
            description: 'Prevent accidental data loss',
        },
    ],
};

// ============================================
// Random Demo Picker
// ============================================
const DEMO_FLOWS = [
    { code: DEMO_CODE_1, result: DEMO_RESULT_1 },
    { code: DEMO_CODE_2, result: DEMO_RESULT_2 },
    { code: DEMO_CODE_3, result: DEMO_RESULT_3 },
];

export function getRandomDemo() {
    const index = Math.floor(Math.random() * DEMO_FLOWS.length);
    return DEMO_FLOWS[index];
}

// Export legacy names for backwards compatibility
export const DEMO_CODE = DEMO_CODE_1;
export const DEMO_RESULT = DEMO_RESULT_1;
