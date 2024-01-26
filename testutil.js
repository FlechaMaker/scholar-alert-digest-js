// Assertion function
function assertEqual(actual, expected, testName) {
  if (Array.isArray(expected)) {
    if (!arraysEqual(actual, expected)) {
      throw new Error(testName + " failed: expected " + JSON.stringify(expected) + ", but got " + JSON.stringify(actual) + ". diff: " + JSON.stringify(diff(JSON.stringify(expected), JSON.stringify(actual))));
    }
  } else if (actual !== expected) {
    throw new Error(testName + " failed: expected " + expected + ", but got " + actual);
  }
}

// Helper function for array comparison
function arraysEqual(arr1, arr2) {
  if (arr1.length !== arr2.length) return false;
  for (var i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) return false;
  }
  return true;
}

function lcs(str1, str2) {
    const dp = Array.from({ length: str1.length + 1 }, () => Array(str2.length + 1).fill(0));

    for (let i = 1; i <= str1.length; i++) {
        for (let j = 1; j <= str2.length; j++) {
            if (str1[i - 1] === str2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1] + 1;
            } else {
                dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
    }

    return dp;
}

function getContext(str, index, range = 5) {
    const start = Math.max(0, index - range);
    const end = Math.min(str.length, index + range + 1);
    return str.substring(start, end);
}

function diff(str1, str2) {
    const dp = lcs(str1, str2);
    let i = str1.length, j = str2.length;
    const diffResult = [];

    while (i > 0 && j > 0) {
        if (str1[i - 1] === str2[j - 1]) {
            i--;
            j--;
        } else if (dp[i][j - 1] > dp[i - 1][j]) {
            diffResult.unshift({
                type: 'add',
                value: str2[j - 1],
                indexBefore: i,
                indexAfter: j - 1,
                context: getContext(str2, j - 1)
            });
            j--;
        } else {
            diffResult.unshift({
                type: 'delete',
                value: str1[i - 1],
                indexBefore: i - 1,
                indexAfter: j,
                context: getContext(str2, j)
            });
            i--;
        }
    }

    while (i > 0) {
        diffResult.unshift({
            type: 'delete',
            value: str1[i - 1],
            indexBefore: i - 1,
            indexAfter: j,
            context: getContext(str2, j)
        });
        i--;
    }

    while (j > 0) {
        diffResult.unshift({
            type: 'add',
            value: str2[j - 1],
            indexBefore: i,
            indexAfter: j - 1,
            context: getContext(str2, j - 1)
        });
        j--;
    }

    return diffResult;
}

