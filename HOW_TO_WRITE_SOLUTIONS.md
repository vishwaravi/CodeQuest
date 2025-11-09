# 📝 How to Write Solutions for Code Execution

## 🎯 Understanding Test Cases

### Example: Two Sum Problem

**Test Case Format:**
```
Input (stdin):
[2,7,11,15]
9

Expected Output (stdout):
[0,1]
```

Your code must:
1. **Read from stdin** (standard input)
2. **Parse the input** 
3. **Solve the problem**
4. **Print to stdout** (standard output) in the EXACT format expected

---

## 💻 Solution Templates by Language

### JavaScript (Node.js)

```javascript
// Two Sum Solution
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

let lines = [];

rl.on('line', (line) => {
  lines.push(line);
});

rl.on('close', () => {
  // Parse input
  const nums = JSON.parse(lines[0]);
  const target = parseInt(lines[1]);
  
  // Solve problem
  const result = twoSum(nums, target);
  
  // Print output (exact format!)
  console.log(JSON.stringify(result));
});

function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}
```

### Python

```python
import sys
import json

# Read all input
lines = sys.stdin.read().strip().split('\n')

# Parse input
nums = json.loads(lines[0])
target = int(lines[1])

# Solve problem
def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []

# Get result
result = two_sum(nums, target)

# Print output (exact format!)
print(json.dumps(result))
```

### Java

```java
import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        
        // Read input
        String numsStr = sc.nextLine();
        int target = sc.nextInt();
        
        // Parse array
        numsStr = numsStr.substring(1, numsStr.length() - 1); // Remove [ ]
        String[] parts = numsStr.split(",");
        int[] nums = new int[parts.length];
        for (int i = 0; i < parts.length; i++) {
            nums[i] = Integer.parseInt(parts[i].trim());
        }
        
        // Solve
        int[] result = twoSum(nums, target);
        
        // Print output
        System.out.print("[");
        for (int i = 0; i < result.length; i++) {
            System.out.print(result[i]);
            if (i < result.length - 1) System.out.print(",");
        }
        System.out.println("]");
    }
    
    public static int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                return new int[]{map.get(complement), i};
            }
            map.put(nums[i], i);
        }
        return new int[]{};
    }
}
```

### C++

```cpp
#include <iostream>
#include <vector>
#include <unordered_map>
#include <sstream>
using namespace std;

vector<int> twoSum(vector<int>& nums, int target) {
    unordered_map<int, int> seen;
    for (int i = 0; i < nums.size(); i++) {
        int complement = target - nums[i];
        if (seen.count(complement)) {
            return {seen[complement], i};
        }
        seen[nums[i]] = i;
    }
    return {};
}

int main() {
    string line;
    getline(cin, line);
    
    // Parse array [2,7,11,15]
    vector<int> nums;
    line = line.substr(1, line.length() - 2); // Remove [ ]
    stringstream ss(line);
    string num;
    while (getline(ss, num, ',')) {
        nums.push_back(stoi(num));
    }
    
    // Read target
    int target;
    cin >> target;
    
    // Solve
    vector<int> result = twoSum(nums, target);
    
    // Print output
    cout << "[";
    for (int i = 0; i < result.size(); i++) {
        cout << result[i];
        if (i < result.size() - 1) cout << ",";
    }
    cout << "]" << endl;
    
    return 0;
}
```

---

## 🧪 Testing Your Solution Locally

### Step 1: Create a test input file
```bash
echo '[2,7,11,15]
9' > test_input.txt
```

### Step 2: Run your code with the input
```bash
# JavaScript
node solution.js < test_input.txt

# Python
python solution.py < test_input.txt

# Java
javac Main.java && java Main < test_input.txt

# C++
g++ solution.cpp -o solution && ./solution < test_input.txt
```

### Step 3: Expected output
```
[0,1]
```

---

## ✅ Quick Test in Battle Room

### Simple JavaScript Test:
```javascript
// For Two Sum problem
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

let lines = [];
rl.on('line', (line) => lines.push(line));
rl.on('close', () => {
  const nums = JSON.parse(lines[0]);
  const target = parseInt(lines[1]);
  
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      console.log(JSON.stringify([map.get(complement), i]));
      return;
    }
    map.set(nums[i], i);
  }
  console.log(JSON.stringify([]));
});
```

### Simple Python Test:
```python
import sys
import json

lines = sys.stdin.read().strip().split('\n')
nums = json.loads(lines[0])
target = int(lines[1])

seen = {}
for i, num in enumerate(nums):
    complement = target - num
    if complement in seen:
        print(json.dumps([seen[complement], i]))
        exit()
    seen[num] = i
print(json.dumps([]))
```

---

## 🔑 Key Points

### ✅ DO:
- Read from `stdin` (standard input)
- Print to `stdout` (standard output)
- Match the EXACT output format (including brackets, commas, etc.)
- Handle all test cases in the same format

### ❌ DON'T:
- Use `prompt()` or `alert()` (browser only)
- Print debug statements (will break output matching)
- Add extra spaces or newlines
- Use hard-coded values

---

## 🎯 Test Flow Example

**Test Case 1:**
```
Input:  [2,7,11,15]\n9
Output: [0,1]
Status: ✅ PASSED
```

**Test Case 2:**
```
Input:  [3,2,4]\n6
Output: [1,2]
Status: ✅ PASSED
```

**Test Case 3 (Hidden):**
```
Input:  [3,3]\n6
Output: [0,1]
Status: ✅ PASSED
```

---

## 🚀 Ready to Test!

1. Copy one of the solution templates above
2. Paste it in the Battle Room editor
3. Click "▶️ Run Code" - tests visible test cases
4. Click "🚀 Submit" - tests ALL test cases (including hidden)

The execution results modal will show you exactly what went wrong if tests fail!
