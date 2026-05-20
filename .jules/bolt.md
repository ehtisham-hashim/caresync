## 2024-05-20 - Unnecessary Re-renders on Form Input
**Learning:** In React, keeping modal state (like form inputs) in the same component as a large list without memoizing the list filtering causes the filtering to run on every keystroke, causing input lag. This specific codebase structure keeps complex prescription form states alongside the patient directory list.
**Action:** Always memoize derived list state (like filtering/sorting) using `useMemo`, especially when the component contains other frequently updating state like form inputs.
