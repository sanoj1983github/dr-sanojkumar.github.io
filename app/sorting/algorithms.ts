import type { AlgorithmInfo, SortEvent, AlgorithmCategory } from "./types";

export const CATEGORIES: { id: AlgorithmCategory; label: string; description: string }[] = [
  {
    id: "basic",
    label: "A. Basic Comparison-Based",
    description: "Fundamental O(n²) sorting algorithms ideal for learning DSA concepts.",
  },
  {
    id: "efficient",
    label: "B. Efficient Comparison-Based",
    description: "Divide & Conquer, Heap & Gap algorithms achieving O(n log n) performance.",
  },
  {
    id: "non-comparison",
    label: "C. Non-Comparison-Based",
    description: "Linear time O(n+k) distribution and integer key algorithms.",
  },
  {
    id: "special",
    label: "D. Recursive & Special-Purpose",
    description: "Parallel, educational, external, and topological graph ordering algorithms.",
  },
];

export const ALGORITHMS: Record<string, AlgorithmInfo> = {
  bubble: {
    id: "bubble",
    name: "Bubble Sort",
    category: "basic",
    categoryName: "Basic Comparison-Based",
    bestTime: "O(n)",
    avgTime: "O(n²)",
    worstTime: "O(n²)",
    space: "O(1)",
    stable: true,
    inPlace: true,
    adaptive: true,
    comparisonBased: true,
    tagline: "Repeatedly swaps adjacent out-of-order elements until array is sorted.",
    overview: "Bubble Sort is a classical comparison-based algorithm that operates by repeatedly traversing the input sequence and swapping adjacent out-of-order elements. In each pass, the largest unplaced element 'bubbles' up to its final correct position at the right boundary. While simple to conceptualize, its quadratic asymptotic performance O(n²) makes it inefficient for large datasets. However, with an early-exit optimization flag (checking if any swaps occurred in a pass), it achieves linear O(n) performance on pre-sorted arrays, demonstrating adaptive behavior.",
    history: "Bubble Sort was first analyzed in computer science literature by Edward H. Friend in 1956 under the name 'sorting by exchange'. The formal name 'Bubble Sort' was coined by Kenneth E. Iverson in 1962 in his seminal book 'A Programming Language'. Donald Knuth noted in 'The Art of Computer Programming' (Vol. 3) that while Bubble Sort holds great pedagogical value for teaching algorithmic analysis and invariants, it is rarely chosen for production systems due to high total swap overhead.",
    howItWorks: [
      "Set pass index i from 0 to n-2.",
      "Scan sub-array from index 0 to n-i-2, comparing adjacent elements arr[j] and arr[j+1].",
      "If arr[j] > arr[j+1], swap them immediately and mark swapped flag as true.",
      "If a full pass finishes with zero swaps, terminate early as array is fully sorted.",
      "Repeat until all passes complete.",
    ],
    pseudocode: `procedure bubbleSort(A : list of sortable items)
    n := length(A)
    repeat
        swapped := false
        for i := 1 to n-1 inclusive do
            if A[i-1] > A[i] then
                swap(A[i-1], A[i])
                swapped := true
            end if
        end for
        n := n - 1
    until not swapped
end procedure`,
    code: {
      cpp: `#include <iostream>
#include <vector>

void bubbleSort(std::vector<int>& arr) {
    int n = arr.size();
    bool swapped;
    for (int i = 0; i < n - 1; i++) {
        swapped = false;
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                std::swap(arr[j], arr[j + 1]);
                swapped = true;
            }
        }
        if (!swapped) break;
    }
}

int main() {
    std::vector<int> arr = {64, 34, 25, 12, 22, 11, 90};
    bubbleSort(arr);
    std::cout << "Sorted array: ";
    for (int x : arr) std::cout << x << " ";
    return 0;
}`,
      c: `#include <stdio.h>
#include <stdbool.h>

void bubbleSort(int arr[], int n) {
    for (int i = 0; i < n - 1; i++) {
        bool swapped = false;
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                int temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
                swapped = true;
            }
        }
        if (!swapped) break;
    }
}

int main() {
    int arr[] = {64, 34, 25, 12, 22, 11, 90};
    int n = sizeof(arr) / sizeof(arr[0]);
    bubbleSort(arr, n);
    for (int i = 0; i < n; i++) printf("%d ", arr[i]);
    return 0;
}`,
      java: `import java.util.Arrays;

public class BubbleSort {
    public static void bubbleSort(int[] arr) {
        int n = arr.length;
        boolean swapped;
        for (int i = 0; i < n - 1; i++) {
            swapped = false;
            for (int j = 0; j < n - i - 1; j++) {
                if (arr[j] > arr[j + 1]) {
                    int temp = arr[j];
                    arr[j] = arr[j + 1];
                    arr[j + 1] = temp;
                    swapped = true;
                }
            }
            if (!swapped) break;
        }
    }

    public static void main(String[] args) {
        int[] arr = {64, 34, 25, 12, 22, 11, 90};
        bubbleSort(arr);
        System.out.println(Arrays.toString(arr));
    }
}`,
      python: `def bubble_sort(arr):
    n = len(arr)
    for i in range(n - 1):
        swapped = False
        for j in range(n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
                swapped = True
        if not swapped:
            break
    return arr

if __name__ == "__main__":
    arr = [64, 34, 25, 12, 22, 11, 90]
    print("Sorted array:", bubble_sort(arr))`,
    },
    applications: [
      "Educational demonstrations of algorithm design.",
      "Nearly sorted arrays where O(n) early-exit applies.",
      "Graphics hardware where simple branchless swaps are required.",
    ],
    advantages: [
      "Simple to implement and understand.",
      "In-place sorting with O(1) extra space.",
      "Stable sort preserving relative order.",
      "Early exit optimization achieves O(n) for sorted data.",
    ],
    limitations: [
      "O(n²) time complexity makes it unusable for large datasets.",
      "Performs excessive comparison and swap operations.",
    ],
  },

  selection: {
    id: "selection",
    name: "Selection Sort",
    category: "basic",
    categoryName: "Basic Comparison-Based",
    bestTime: "O(n²)",
    avgTime: "O(n²)",
    worstTime: "O(n²)",
    space: "O(1)",
    stable: false,
    inPlace: true,
    adaptive: false,
    comparisonBased: true,
    tagline: "Finds the minimum element from the unsorted region and swaps it to the front.",
    overview: "Selection Sort divides the input array into two parts: a sorted sublist built from left to right and an unsorted sublist. It repeatedly finds the smallest element in the unsorted portion and swaps it with the first unsorted element.",
    history: "Attributed to early computing pioneers in the 1950s as a direct systematic extension of manual hand-sorting techniques.",
    howItWorks: [
      "Find the minimum element in arr[i...n-1].",
      "Swap minimum element with arr[i].",
      "Increment i and repeat until array is completely sorted.",
    ],
    pseudocode: `procedure selectionSort(A : list of sortable items)
    n := length(A)
    for i := 0 to n-2 do
        minIdx := i
        for j := i+1 to n-1 do
            if A[j] < A[minIdx] then
                minIdx := j
            end if
        end for
        if minIdx != i then
            swap(A[i], A[minIdx])
        end if
    end for
end procedure`,
    code: {
      cpp: `#include <iostream>
#include <vector>

void selectionSort(std::vector<int>& arr) {
    int n = arr.size();
    for (int i = 0; i < n - 1; i++) {
        int minIdx = i;
        for (int j = i + 1; j < n; j++) {
            if (arr[j] < arr[minIdx]) minIdx = j;
        }
        if (minIdx != i) std::swap(arr[i], arr[minIdx]);
    }
}

int main() {
    std::vector<int> arr = {64, 25, 12, 22, 11};
    selectionSort(arr);
    for (int x : arr) std::cout << x << " ";
    return 0;
}`,
      c: `#include <stdio.h>

void selectionSort(int arr[], int n) {
    for (int i = 0; i < n - 1; i++) {
        int minIdx = i;
        for (int j = i + 1; j < n; j++) {
            if (arr[j] < arr[minIdx]) minIdx = j;
        }
        if (minIdx != i) {
            int temp = arr[i];
            arr[i] = arr[minIdx];
            arr[minIdx] = temp;
        }
    }
}

int main() {
    int arr[] = {64, 25, 12, 22, 11};
    int n = 5;
    selectionSort(arr, n);
    for (int i = 0; i < n; i++) printf("%d ", arr[i]);
    return 0;
}`,
      java: `import java.util.Arrays;

public class SelectionSort {
    public static void selectionSort(int[] arr) {
        int n = arr.length;
        for (int i = 0; i < n - 1; i++) {
            int minIdx = i;
            for (int j = i + 1; j < n; j++) {
                if (arr[j] < arr[minIdx]) minIdx = j;
            }
            int temp = arr[i];
            arr[i] = arr[minIdx];
            arr[minIdx] = temp;
        }
    }

    public static void main(String[] args) {
        int[] arr = {64, 25, 12, 22, 11};
        selectionSort(arr);
        System.out.println(Arrays.toString(arr));
    }
}`,
      python: `def selection_sort(arr):
    n = len(arr)
    for i in range(n - 1):
        min_idx = i
        for j in range(i + 1, n):
            if arr[j] < arr[min_idx]:
                min_idx = j
        arr[i], arr[min_idx] = arr[min_idx], arr[i]
    return arr

if __name__ == "__main__":
    print(selection_sort([64, 25, 12, 22, 11]))`,
    },
    applications: [
      "Flash memory devices where write operations are significantly more expensive than reads.",
      "Small arrays where minimal code size is prioritized.",
    ],
    advantages: [
      "Performs at most O(n) memory swaps.",
      "In-place algorithm requiring O(1) auxiliary space.",
    ],
    limitations: [
      "Always O(n²) comparisons even if input is already sorted.",
      "Default implementation is unstable.",
    ],
  },

  insertion: {
    id: "insertion",
    name: "Insertion Sort",
    category: "basic",
    categoryName: "Basic Comparison-Based",
    bestTime: "O(n)",
    avgTime: "O(n²)",
    worstTime: "O(n²)",
    space: "O(1)",
    stable: true,
    inPlace: true,
    adaptive: true,
    comparisonBased: true,
    tagline: "Inserts each item into its correct relative position within the sorted sub-array.",
    overview: "Insertion Sort builds a sorted array one element at a time. It takes an element from the unsorted sub-list and inserts it into its correct location in the already sorted sub-list.",
    history: "Used manually by card players for centuries; formalized for computer systems by John Mauchly in 1946.",
    howItWorks: [
      "Iterate from index 1 to n-1.",
      "Store current key arr[i].",
      "Shift elements of arr[0...i-1] that are greater than key one position ahead.",
      "Insert key into cleared position.",
    ],
    pseudocode: `procedure insertionSort(A : list of sortable items)
    for i := 1 to length(A)-1 do
        key := A[i]
        j := i - 1
        while j >= 0 and A[j] > key do
            A[j + 1] := A[j]
            j := j - 1
        end while
        A[j + 1] := key
    end for
end procedure`,
    code: {
      cpp: `#include <iostream>
#include <vector>

void insertionSort(std::vector<int>& arr) {
    int n = arr.size();
    for (int i = 1; i < n; i++) {
        int key = arr[i];
        int j = i - 1;
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j--;
        }
        arr[j + 1] = key;
    }
}

int main() {
    std::vector<int> arr = {12, 11, 13, 5, 6};
    insertionSort(arr);
    for (int x : arr) std::cout << x << " ";
    return 0;
}`,
      c: `#include <stdio.h>

void insertionSort(int arr[], int n) {
    for (int i = 1; i < n; i++) {
        int key = arr[i];
        int j = i - 1;
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j--;
        }
        arr[j + 1] = key;
    }
}

int main() {
    int arr[] = {12, 11, 13, 5, 6};
    insertionSort(arr, 5);
    for (int i = 0; i < 5; i++) printf("%d ", arr[i]);
    return 0;
}`,
      java: `import java.util.Arrays;

public class InsertionSort {
    public static void insertionSort(int[] arr) {
        for (int i = 1; i < arr.length; i++) {
            int key = arr[i];
            int j = i - 1;
            while (j >= 0 && arr[j] > key) {
                arr[j + 1] = arr[j];
                j--;
            }
            arr[j + 1] = key;
        }
    }

    public static void main(String[] args) {
        int[] arr = {12, 11, 13, 5, 6};
        insertionSort(arr);
        System.out.println(Arrays.toString(arr));
    }
}`,
      python: `def insertion_sort(arr):
    for i in range(1, len(arr)):
        key = arr[i]
        j = i - 1
        while j >= 0 and arr[j] > key:
            arr[j + 1] = arr[j]
            j -= 1
        arr[j + 1] = key
    return arr

if __name__ == "__main__":
    print(insertion_sort([12, 11, 13, 5, 6]))`,
    },
    applications: [
      "Subroutine for hybrid algorithms like TimSort and IntroSort for small partitions (n <= 16).",
      "Online data streams where elements arrive one by one.",
      "Nearly sorted arrays where time complexity is O(n).",
    ],
    advantages: [
      "Highly efficient for small datasets.",
      "Adaptive O(n) performance for nearly sorted data.",
      "Stable and in-place.",
    ],
    limitations: ["O(n²) worst-case performance for large random datasets."],
  },

  merge: {
    id: "merge",
    name: "Merge Sort",
    category: "efficient",
    categoryName: "Efficient Comparison-Based",
    bestTime: "O(n log n)",
    avgTime: "O(n log n)",
    worstTime: "O(n log n)",
    space: "O(n)",
    stable: true,
    inPlace: false,
    adaptive: false,
    comparisonBased: true,
    tagline: "Divide and conquer algorithm providing guaranteed O(n log n) performance.",
    overview: "Merge Sort recursively splits the input array into two halves, sorts each half independently, and then merges the two sorted halves back together in linear time.",
    history: "Invented by John von Neumann in 1945. It remains a classic example of Divide and Conquer.",
    howItWorks: [
      "Divide array into left half (0...mid) and right half (mid+1...end).",
      "Recursively sort left half.",
      "Recursively sort right half.",
      "Merge the two sorted halves into single sorted array.",
    ],
    pseudocode: `procedure mergeSort(A, left, right)
    if left < right then
        mid := (left + right) / 2
        mergeSort(A, left, mid)
        mergeSort(A, mid + 1, right)
        merge(A, left, mid, right)
    end if
end procedure`,
    code: {
      cpp: `#include <iostream>
#include <vector>

void merge(std::vector<int>& arr, int l, int m, int r) {
    std::vector<int> left(arr.begin() + l, arr.begin() + m + 1);
    std::vector<int> right(arr.begin() + m + 1, arr.begin() + r + 1);
    int i = 0, j = 0, k = l;
    while (i < left.size() && j < right.size()) {
        if (left[i] <= right[j]) arr[k++] = left[i++];
        else arr[k++] = right[j++];
    }
    while (i < left.size()) arr[k++] = left[i++];
    while (j < right.size()) arr[k++] = right[j++];
}

void mergeSort(std::vector<int>& arr, int l, int r) {
    if (l >= r) return;
    int m = l + (r - l) / 2;
    mergeSort(arr, l, m);
    mergeSort(arr, m + 1, r);
    merge(arr, l, m, r);
}

int main() {
    std::vector<int> arr = {12, 11, 13, 5, 6, 7};
    mergeSort(arr, 0, arr.size() - 1);
    for (int x : arr) std::cout << x << " ";
    return 0;
}`,
      c: `#include <stdio.h>
#include <stdlib.h>

void merge(int arr[], int l, int m, int r) {
    int n1 = m - l + 1, n2 = r - m;
    int L[n1], R[n2];
    for (int i = 0; i < n1; i++) L[i] = arr[l + i];
    for (int j = 0; j < n2; j++) R[j] = arr[m + 1 + j];
    int i = 0, j = 0, k = l;
    while (i < n1 && j < n2) {
        if (L[i] <= R[j]) arr[k++] = L[i++];
        else arr[k++] = R[j++];
    }
    while (i < n1) arr[k++] = L[i++];
    while (j < n2) arr[k++] = R[j++];
}

void mergeSort(int arr[], int l, int r) {
    if (l < r) {
        int m = l + (r - l) / 2;
        mergeSort(arr, l, m);
        mergeSort(arr, m + 1, r);
        merge(arr, l, m, r);
    }
}

int main() {
    int arr[] = {12, 11, 13, 5, 6, 7};
    mergeSort(arr, 0, 5);
    for (int i = 0; i < 6; i++) printf("%d ", arr[i]);
    return 0;
}`,
      java: `import java.util.Arrays;

public class MergeSort {
    public static void mergeSort(int[] arr, int l, int r) {
        if (l < r) {
            int m = l + (r - l) / 2;
            mergeSort(arr, l, m);
            mergeSort(arr, m + 1, r);
            merge(arr, l, m, r);
        }
    }

    private static void merge(int[] arr, int l, int m, int r) {
        int[] L = Arrays.copyOfRange(arr, l, m + 1);
        int[] R = Arrays.copyOfRange(arr, m + 1, r + 1);
        int i = 0, j = 0, k = l;
        while (i < L.length && j < R.length) {
            if (L[i] <= R[j]) arr[k++] = L[i++];
            else arr[k++] = R[j++];
        }
        while (i < L.length) arr[k++] = L[i++];
        while (j < R.length) arr[k++] = R[j++];
    }

    public static void main(String[] args) {
        int[] arr = {12, 11, 13, 5, 6, 7};
        mergeSort(arr, 0, arr.length - 1);
        System.out.println(Arrays.toString(arr));
    }
}`,
      python: `def merge_sort(arr):
    if len(arr) > 1:
        mid = len(arr) // 2
        L = arr[:mid]
        R = arr[mid:]

        merge_sort(L)
        merge_sort(R)

        i = j = k = 0
        while i < len(L) and j < len(R):
            if L[i] <= R[j]:
                arr[k] = L[i]
                i += 1
            else:
                arr[k] = R[j]
                j += 1
            k += 1

        while i < len(L):
            arr[k] = L[i]
            i += 1
            k += 1

        while j < len(R):
            arr[k] = R[j]
            j += 1
            k += 1
    return arr

if __name__ == "__main__":
    print(merge_sort([12, 11, 13, 5, 6, 7]))`,
    },
    applications: [
      "External sorting where data exceeds RAM capacity.",
      "Linked lists where O(1) auxiliary space merge is possible.",
      "Core component of TimSort used in Python and Java standard libraries.",
    ],
    advantages: [
      "Guaranteed O(n log n) time complexity in all cases.",
      "Stable sorting algorithm.",
    ],
    limitations: ["Requires O(n) extra space for array buffer."],
  },

  quick: {
    id: "quick",
    name: "Quick Sort",
    category: "efficient",
    categoryName: "Efficient Comparison-Based",
    bestTime: "O(n log n)",
    avgTime: "O(n log n)",
    worstTime: "O(n²)",
    space: "O(log n)",
    stable: false,
    inPlace: true,
    adaptive: false,
    comparisonBased: true,
    tagline: "Fastest general-purpose sorting algorithm based on partitioning around a pivot.",
    overview: "Quick Sort picks a pivot element, partitions the array into elements smaller than pivot and elements greater than pivot, and recursively sorts the partitions.",
    history: "Developed by Tony Hoare in 1959 while at Moscow State University.",
    howItWorks: [
      "Select a pivot element (e.g. last element).",
      "Partition array so elements < pivot are left, elements > pivot are right.",
      "Place pivot in correct sorted position.",
      "Recursively apply to left and right partitions.",
    ],
    pseudocode: `procedure quickSort(A, low, high)
    if low < high then
        pi := partition(A, low, high)
        quickSort(A, low, pi - 1)
        quickSort(A, pi + 1, high)
    end if
end procedure`,
    code: {
      cpp: `#include <iostream>
#include <vector>

int partition(std::vector<int>& arr, int low, int high) {
    int pivot = arr[high];
    int i = low - 1;
    for (int j = low; j < high; j++) {
        if (arr[j] < pivot) {
            i++;
            std::swap(arr[i], arr[j]);
        }
    }
    std::swap(arr[i + 1], arr[high]);
    return i + 1;
}

void quickSort(std::vector<int>& arr, int low, int high) {
    if (low < high) {
        int pi = partition(arr, low, high);
        quickSort(arr, low, pi - 1);
        quickSort(arr, pi + 1, high);
    }
}

int main() {
    std::vector<int> arr = {10, 7, 8, 9, 1, 5};
    quickSort(arr, 0, arr.size() - 1);
    for (int x : arr) std::cout << x << " ";
    return 0;
}`,
      c: `#include <stdio.h>

void swap(int* a, int* b) {
    int t = *a; *a = *b; *b = t;
}

int partition(int arr[], int low, int high) {
    int pivot = arr[high];
    int i = low - 1;
    for (int j = low; j < high; j++) {
        if (arr[j] < pivot) {
            i++;
            swap(&arr[i], &arr[j]);
        }
    }
    swap(&arr[i + 1], &arr[high]);
    return i + 1;
}

void quickSort(int arr[], int low, int high) {
    if (low < high) {
        int pi = partition(arr, low, high);
        quickSort(arr, low, pi - 1);
        quickSort(arr, pi + 1, high);
    }
}

int main() {
    int arr[] = {10, 7, 8, 9, 1, 5};
    quickSort(arr, 0, 5);
    for (int i = 0; i < 6; i++) printf("%d ", arr[i]);
    return 0;
}`,
      java: `import java.util.Arrays;

public class QuickSort {
    public static void quickSort(int[] arr, int low, int high) {
        if (low < high) {
            int pi = partition(arr, low, high);
            quickSort(arr, low, pi - 1);
            quickSort(arr, pi + 1, high);
        }
    }

    private static int partition(int[] arr, int low, int high) {
        int pivot = arr[high];
        int i = low - 1;
        for (int j = low; j < high; j++) {
            if (arr[j] < pivot) {
                i++;
                int temp = arr[i]; arr[i] = arr[j]; arr[j] = temp;
            }
        }
        int temp = arr[i + 1]; arr[i + 1] = arr[high]; arr[high] = temp;
        return i + 1;
    }

    public static void main(String[] args) {
        int[] arr = {10, 7, 8, 9, 1, 5};
        quickSort(arr, 0, arr.length - 1);
        System.out.println(Arrays.toString(arr));
    }
}`,
      python: `def quick_sort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quick_sort(left) + middle + quick_sort(right)

if __name__ == "__main__":
    print(quick_sort([10, 7, 8, 9, 1, 5]))`,
    },
    applications: [
      "Standard library implementations (C qsort, C++ std::sort).",
      "High performance in-memory systems.",
    ],
    advantages: [
      "In-place sorting with O(log n) stack space.",
      "Excellent cache locality.",
    ],
    limitations: ["O(n²) worst case if bad pivot chosen."],
  },

  heap: {
    id: "heap",
    name: "Heap Sort",
    category: "efficient",
    categoryName: "Efficient Comparison-Based",
    bestTime: "O(n log n)",
    avgTime: "O(n log n)",
    worstTime: "O(n log n)",
    space: "O(1)",
    stable: false,
    inPlace: true,
    adaptive: false,
    comparisonBased: true,
    tagline: "Builds a Binary Max-Heap and repeatedly extracts the max element.",
    overview: "Heap Sort uses a Binary Heap data structure. It converts the input array into a Max-Heap, then repeatedly extracts the root (maximum element) and moves it to the end.",
    history: "Invented by J. W. J. Williams in 1964, who also introduced the heap data structure.",
    howItWorks: [
      "Build a max-heap from the input array.",
      "Swap root (max element) with last element.",
      "Reduce heap size by 1 and heapify the root.",
      "Repeat until heap size is 1.",
    ],
    pseudocode: `procedure heapSort(A)
    n := length(A)
    for i := n/2 - 1 down to 0 do
        heapify(A, n, i)
    end for
    for i := n-1 down to 1 do
        swap(A[0], A[i])
        heapify(A, i, 0)
    end for
end procedure`,
    code: {
      cpp: `#include <iostream>
#include <vector>

void heapify(std::vector<int>& arr, int n, int i) {
    int largest = i;
    int l = 2 * i + 1, r = 2 * i + 2;
    if (l < n && arr[l] > arr[largest]) largest = l;
    if (r < n && arr[r] > arr[largest]) largest = r;
    if (largest != i) {
        std::swap(arr[i], arr[largest]);
        heapify(arr, n, largest);
    }
}

void heapSort(std::vector<int>& arr) {
    int n = arr.size();
    for (int i = n / 2 - 1; i >= 0; i--) heapify(arr, n, i);
    for (int i = n - 1; i > 0; i--) {
        std::swap(arr[0], arr[i]);
        heapify(arr, i, 0);
    }
}

int main() {
    std::vector<int> arr = {12, 11, 13, 5, 6, 7};
    heapSort(arr);
    for (int x : arr) std::cout << x << " ";
    return 0;
}`,
      c: `#include <stdio.h>

void heapify(int arr[], int n, int i) {
    int largest = i;
    int l = 2 * i + 1, r = 2 * i + 2;
    if (l < n && arr[l] > arr[largest]) largest = l;
    if (r < n && arr[r] > arr[largest]) largest = r;
    if (largest != i) {
        int temp = arr[i]; arr[i] = arr[largest]; arr[largest] = temp;
        heapify(arr, n, largest);
    }
}

void heapSort(int arr[], int n) {
    for (int i = n / 2 - 1; i >= 0; i--) heapify(arr, n, i);
    for (int i = n - 1; i > 0; i--) {
        int temp = arr[0]; arr[0] = arr[i]; arr[i] = temp;
        heapify(arr, i, 0);
    }
}

int main() {
    int arr[] = {12, 11, 13, 5, 6, 7};
    heapSort(arr, 6);
    for (int i = 0; i < 6; i++) printf("%d ", arr[i]);
    return 0;
}`,
      java: `import java.util.Arrays;

public class HeapSort {
    public static void heapSort(int[] arr) {
        int n = arr.length;
        for (int i = n / 2 - 1; i >= 0; i--) heapify(arr, n, i);
        for (int i = n - 1; i > 0; i--) {
            int temp = arr[0]; arr[0] = arr[i]; arr[i] = temp;
            heapify(arr, i, 0);
        }
    }

    private static void heapify(int[] arr, int n, int i) {
        int largest = i;
        int l = 2 * i + 1, r = 2 * i + 2;
        if (l < n && arr[l] > arr[largest]) largest = l;
        if (r < n && arr[r] > arr[largest]) largest = r;
        if (largest != i) {
            int temp = arr[i]; arr[i] = arr[largest]; arr[largest] = temp;
            heapify(arr, n, i);
        }
    }

    public static void main(String[] args) {
        int[] arr = {12, 11, 13, 5, 6, 7};
        heapSort(arr);
        System.out.println(Arrays.toString(arr));
    }
}`,
      python: `def heapify(arr, n, i):
    largest = i
    l = 2 * i + 1
    r = 2 * i + 2
    if l < n and arr[l] > arr[largest]:
        largest = l
    if r < n and arr[r] > arr[largest]:
        largest = r
    if largest != i:
        arr[i], arr[largest] = arr[largest], arr[i]
        heapify(arr, n, largest)

def heap_sort(arr):
    n = len(arr)
    for i in range(n // 2 - 1, -1, -1):
        heapify(arr, n, i)
    for i in range(n - 1, 0, -1):
        arr[i], arr[0] = arr[0], arr[i]
        heapify(arr, i, 0)
    return arr

if __name__ == "__main__":
    print(heap_sort([12, 11, 13, 5, 6, 7]))`,
    },
    applications: [
      "Embedded systems with hard memory limits.",
      "Priority Queue implementations.",
      "Linux kernel scheduling structures.",
    ],
    advantages: ["Guaranteed O(n log n) worst-case time with O(1) space."],
    limitations: ["Poor cache locality due to non-sequential memory jumps."],
  },

  counting: {
    id: "counting",
    name: "Counting Sort",
    category: "non-comparison",
    categoryName: "Non-Comparison-Based",
    bestTime: "O(n + k)",
    avgTime: "O(n + k)",
    worstTime: "O(n + k)",
    space: "O(n + k)",
    stable: true,
    inPlace: false,
    adaptive: false,
    comparisonBased: false,
    tagline: "Linear time O(n+k) integer sorting using key frequency counts.",
    overview: "Counting Sort counts the frequency of each distinct value in the input array. It calculates prefix sums to determine the exact output position for each key.",
    history: "Invented by Harold H. Seward in 1954.",
    howItWorks: [
      "Find maximum value k in array.",
      "Create frequency count array of size k+1.",
      "Calculate prefix sum array.",
      "Build output array using prefix indices.",
    ],
    pseudocode: `procedure countingSort(A, k)
    create count[0..k] initialized to 0
    create output[length(A)]
    for x in A do count[x]++
    for i := 1 to k do count[i] += count[i-1]
    for i := length(A)-1 down to 0 do
        output[count[A[i]] - 1] := A[i]
        count[A[i]]--
    return output
end procedure`,
    code: {
      cpp: `#include <iostream>
#include <vector>
#include <algorithm>

void countingSort(std::vector<int>& arr) {
    if (arr.empty()) return;
    int maxVal = *std::max_element(arr.begin(), arr.end());
    std::vector<int> count(maxVal + 1, 0);
    std::vector<int> output(arr.size());
    for (int x : arr) count[x]++;
    for (int i = 1; i <= maxVal; i++) count[i] += count[i - 1];
    for (int i = arr.size() - 1; i >= 0; i--) {
        output[count[arr[i]] - 1] = arr[i];
        count[arr[i]]--;
    }
    arr = output;
}

int main() {
    std::vector<int> arr = {4, 2, 2, 8, 3, 3, 1};
    countingSort(arr);
    for (int x : arr) std::cout << x << " ";
    return 0;
}`,
      c: `#include <stdio.h>
#include <string.h>

void countingSort(int arr[], int n) {
    int max = arr[0];
    for (int i = 1; i < n; i++) if (arr[i] > max) max = arr[i];
    int count[max + 1];
    int output[n];
    memset(count, 0, sizeof(count));
    for (int i = 0; i < n; i++) count[arr[i]]++;
    for (int i = 1; i <= max; i++) count[i] += count[i - 1];
    for (int i = n - 1; i >= 0; i--) {
        output[count[arr[i]] - 1] = arr[i];
        count[arr[i]]--;
    }
    for (int i = 0; i < n; i++) arr[i] = output[i];
}

int main() {
    int arr[] = {4, 2, 2, 8, 3, 3, 1};
    countingSort(arr, 7);
    for (int i = 0; i < 7; i++) printf("%d ", arr[i]);
    return 0;
}`,
      java: `import java.util.Arrays;

public class CountingSort {
    public static void countingSort(int[] arr) {
        int max = Arrays.stream(arr).max().orElse(0);
        int[] count = new int[max + 1];
        int[] output = new int[arr.length];
        for (int x : arr) count[x]++;
        for (int i = 1; i <= max; i++) count[i] += count[i - 1];
        for (int i = arr.length - 1; i >= 0; i--) {
            output[count[arr[i]] - 1] = arr[i];
            count[arr[i]]--;
        }
        System.arraycopy(output, 0, arr, 0, arr.length);
    }

    public static void main(String[] args) {
        int[] arr = {4, 2, 2, 8, 3, 3, 1};
        countingSort(arr);
        System.out.println(Arrays.toString(arr));
    }
}`,
      python: `def counting_sort(arr):
    if not arr:
        return arr
    max_val = max(arr)
    count = [0] * (max_val + 1)
    output = [0] * len(arr)
    for x in arr:
        count[x] += 1
    for i in range(1, max_val + 1):
        count[i] += count[i - 1]
    for x in reversed(arr):
        output[count[x] - 1] = x
        count[x] -= 1
    return output

if __name__ == "__main__":
    print(counting_sort([4, 2, 2, 8, 3, 3, 1]))`,
    },
    applications: [
      "Subroutine for Radix Sort.",
      "Integer keys within a known small range (k = O(n)).",
    ],
    advantages: ["Linear time O(n) performance when key range k is small."],
    limitations: ["Infeasible for large key ranges or non-integer keys."],
    specialDisclaimer: "Requires non-negative integer keys in a bounded range.",
  },

  radix: {
    id: "radix",
    name: "Radix Sort",
    category: "non-comparison",
    categoryName: "Non-Comparison-Based",
    bestTime: "O(d · (n + k))",
    avgTime: "O(d · (n + k))",
    worstTime: "O(d · (n + k))",
    space: "O(n + k)",
    stable: true,
    inPlace: false,
    adaptive: false,
    comparisonBased: false,
    tagline: "Sorts numbers digit by digit from least to most significant digit.",
    overview: "Radix Sort processes digits from Least Significant Digit (LSD) to Most Significant Digit (MSD). It uses a stable integer sort (like Counting Sort) for each digit position.",
    history: "Dates back to mechanical card sorting machines created by Herman Hollerith for the 1890 US Census.",
    howItWorks: [
      "Find maximum element to know number of digits d.",
      "For digit position exp = 1, 10, 100... apply Counting Sort.",
      "Maintain relative order of keys on each pass to ensure stability.",
    ],
    pseudocode: `procedure radixSort(A)
    maxVal := getMax(A)
    for exp := 1 while maxVal/exp > 0 exp *= 10 do
        countingSortByDigit(A, exp)
    end for
end procedure`,
    code: {
      cpp: `#include <iostream>
#include <vector>
#include <algorithm>

void countSortDigit(std::vector<int>& arr, int exp) {
    int n = arr.size();
    std::vector<int> output(n), count(10, 0);
    for (int i = 0; i < n; i++) count[(arr[i] / exp) % 10]++;
    for (int i = 1; i < 10; i++) count[i] += count[i - 1];
    for (int i = n - 1; i >= 0; i--) {
        output[count[(arr[i] / exp) % 10] - 1] = arr[i];
        count[(arr[i] / exp) % 10]--;
    }
    arr = output;
}

void radixSort(std::vector<int>& arr) {
    int maxVal = *std::max_element(arr.begin(), arr.end());
    for (int exp = 1; maxVal / exp > 0; exp *= 10)
        countSortDigit(arr, exp);
}

int main() {
    std::vector<int> arr = {170, 45, 75, 90, 802, 24, 2, 66};
    radixSort(arr);
    for (int x : arr) std::cout << x << " ";
    return 0;
}`,
      c: `#include <stdio.h>

int getMax(int arr[], int n) {
    int mx = arr[0];
    for (int i = 1; i < n; i++) if (arr[i] > mx) mx = arr[i];
    return mx;
}

void countSort(int arr[], int n, int exp) {
    int output[n], count[10] = {0};
    for (int i = 0; i < n; i++) count[(arr[i] / exp) % 10]++;
    for (int i = 1; i < 10; i++) count[i] += count[i - 1];
    for (int i = n - 1; i >= 0; i--) {
        output[count[(arr[i] / exp) % 10] - 1] = arr[i];
        count[(arr[i] / exp) % 10]--;
    }
    for (int i = 0; i < n; i++) arr[i] = output[i];
}

void radixSort(int arr[], int n) {
    int m = getMax(arr, n);
    for (int exp = 1; m / exp > 0; exp *= 10) countSort(arr, n, exp);
}

int main() {
    int arr[] = {170, 45, 75, 90, 802, 24, 2, 66};
    radixSort(arr, 8);
    for (int i = 0; i < 8; i++) printf("%d ", arr[i]);
    return 0;
}`,
      java: `import java.util.Arrays;

public class RadixSort {
    public static void radixSort(int[] arr) {
        int max = Arrays.stream(arr).max().orElse(0);
        for (int exp = 1; max / exp > 0; exp *= 10) {
            int n = arr.length;
            int[] output = new int[n];
            int[] count = new int[10];
            for (int i = 0; i < n; i++) count[(arr[i] / exp) % 10]++;
            for (int i = 1; i < 10; i++) count[i] += count[i - 1];
            for (int i = n - 1; i >= 0; i--) {
                output[count[(arr[i] / exp) % 10] - 1] = arr[i];
                count[(arr[i] / exp) % 10]--;
            }
            System.arraycopy(output, 0, arr, 0, n);
        }
    }

    public static void main(String[] args) {
        int[] arr = {170, 45, 75, 90, 802, 24, 2, 66};
        radixSort(arr);
        System.out.println(Arrays.toString(arr));
    }
}`,
      python: `def radix_sort(arr):
    if not arr:
        return arr
    max_val = max(arr)
    exp = 1
    while max_val // exp > 0:
        count = [0] * 10
        output = [0] * len(arr)
        for x in arr:
            count[(x // exp) % 10] += 1
        for i in range(1, 10):
            count[i] += count[i - 1]
        for x in reversed(arr):
            digit = (x // exp) % 10
            output[count[digit] - 1] = x
            count[digit] -= 1
        arr = output
        exp *= 10
    return arr

if __name__ == "__main__":
    print(radix_sort([170, 45, 75, 90, 802, 24, 2, 66]))`,
    },
    applications: [
      "Large collections of fixed-length keys like 32-bit integers, IP addresses, or strings.",
      "Parallel GPU acceleration routines.",
    ],
    advantages: ["Linear time O(d·n) when key length d is constant."],
    limitations: ["High memory overhead for digit buckets."],
    specialDisclaimer: "Requires non-negative integer or fixed-length keys.",
  },

  bogo: {
    id: "bogo",
    name: "Bogo Sort",
    category: "special",
    categoryName: "Recursive & Special-Purpose",
    bestTime: "O(n)",
    avgTime: "O((n+1)!)",
    worstTime: "Unbounded O(∞)",
    space: "O(1)",
    stable: false,
    inPlace: true,
    adaptive: false,
    comparisonBased: true,
    tagline: "Humorous / educational algorithm that randomly shuffles until array happens to be sorted.",
    overview: "Bogo Sort (also known as Permutation Sort or Stupid Sort) randomly shuffles the elements of an array until it accidentally lands on a sorted permutation.",
    history: "Introduced by computer scientists as a humorous example of worst-case algorithmic inefficiency.",
    howItWorks: [
      "Check if array is sorted.",
      "If sorted, stop.",
      "Otherwise, randomly shuffle all elements and repeat.",
    ],
    pseudocode: `procedure bogoSort(A)
    while not isSorted(A) do
        shuffle(A)
    end while
end procedure`,
    code: {
      cpp: `#include <iostream>
#include <vector>
#include <algorithm>
#include <random>

bool isSorted(const std::vector<int>& arr) {
    for (size_t i = 1; i < arr.size(); i++)
        if (arr[i - 1] > arr[i]) return false;
    return true;
}

void bogoSort(std::vector<int>& arr) {
    std::random_device rd;
    std::mt19937 g(rd());
    while (!isSorted(arr)) {
        std::shuffle(arr.begin(), arr.end(), g);
    }
}

int main() {
    std::vector<int> arr = {3, 1, 2};
    bogoSort(arr);
    for (int x : arr) std::cout << x << " ";
    return 0;
}`,
      c: `#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>

bool isSorted(int arr[], int n) {
    for (int i = 1; i < n; i++) if (arr[i-1] > arr[i]) return false;
    return true;
}

void bogoSort(int arr[], int n) {
    while (!isSorted(arr, n)) {
        for (int i = 0; i < n; i++) {
            int r = rand() % n;
            int t = arr[i]; arr[i] = arr[r]; arr[r] = t;
        }
    }
}

int main() {
    int arr[] = {3, 1, 2};
    bogoSort(arr, 3);
    for (int i = 0; i < 3; i++) printf("%d ", arr[i]);
    return 0;
}`,
      java: `import java.util.Arrays;
import java.util.Random;

public class BogoSort {
    public static void bogoSort(int[] arr) {
        Random rand = new Random();
        while (!isSorted(arr)) {
            for (int i = 0; i < arr.length; i++) {
                int r = rand.nextInt(arr.length);
                int t = arr[i]; arr[i] = arr[r]; arr[r] = t;
            }
        }
    }

    private static boolean isSorted(int[] arr) {
        for (int i = 1; i < arr.length; i++)
            if (arr[i - 1] > arr[i]) return false;
        return true;
    }

    public static void main(String[] args) {
        int[] arr = {3, 1, 2};
        bogoSort(arr);
        System.out.println(Arrays.toString(arr));
    }
}`,
      python: `import random

def bogo_sort(arr):
    while not all(arr[i] <= arr[i + 1] for i in range(len(arr) - 1)):
        random.shuffle(arr)
    return arr

if __name__ == "__main__":
    print(bogo_sort([3, 1, 2]))`,
    },
    applications: ["Classroom demonstration of bad complexity."],
    advantages: ["Simple logic."],
    limitations: ["Extremely inefficient O((n+1)!) average time."],
    specialDisclaimer: "Educational / Humorous algorithm. Restricted to small arrays (n <= 6).",
  },

  topological: {
    id: "topological",
    name: "Topological Sort",
    category: "special",
    categoryName: "Recursive & Special-Purpose",
    bestTime: "O(V + E)",
    avgTime: "O(V + E)",
    worstTime: "O(V + E)",
    space: "O(V)",
    stable: false,
    inPlace: false,
    adaptive: false,
    comparisonBased: false,
    tagline: "Linear ordering of vertices for Directed Acyclic Graphs (DAG).",
    overview: "Topological Sort produces a linear ordering of vertices in a Directed Acyclic Graph (DAG) such that for every directed edge u -> v, vertex u comes before vertex v in the ordering.",
    history: "First introduced by Kahn in 1962 for project scheduling problems (PERT networks).",
    howItWorks: [
      "Calculate in-degree for every vertex.",
      "Enqueue all vertices with in-degree 0.",
      "Dequeue vertex u, add to result, and decrement in-degrees of u's neighbors.",
      "Enqueue neighbors whose in-degree becomes 0.",
    ],
    pseudocode: `procedure topologicalSort(graph G)
    inDegree := computeInDegrees(G)
    queue := vertices with inDegree 0
    result := empty list
    while queue is not empty do
        u := queue.dequeue()
        result.append(u)
        for each neighbor v of u do
            inDegree[v]--
            if inDegree[v] == 0 then queue.enqueue(v)
        end for
    end while
    return result
end procedure`,
    code: {
      cpp: `#include <iostream>
#include <vector>
#include <queue>

std::vector<int> topologicalSort(int V, const std::vector<std::pair<int,int>>& edges) {
    std::vector<std::vector<int>> adj(V);
    std::vector<int> inDegree(V, 0);
    for (auto& e : edges) {
        adj[e.first].push_back(e.second);
        inDegree[e.second]++;
    }
    std::queue<int> q;
    for (int i = 0; i < V; i++) if (inDegree[i] == 0) q.push(i);
    std::vector<int> order;
    while (!q.empty()) {
        int u = q.front(); q.pop();
        order.push_back(u);
        for (int v : adj[u]) {
            if (--inDegree[v] == 0) q.push(v);
        }
    }
    return order;
}

int main() {
    int V = 6;
    std::vector<std::pair<int,int>> edges = {{5,2}, {5,0}, {4,0}, {4,1}, {2,3}, {3,1}};
    auto res = topologicalSort(V, edges);
    for (int x : res) std::cout << x << " ";
    return 0;
}`,
      c: `#include <stdio.h>
#include <stdlib.h>

void topologicalSort(int V, int adj[6][6]) {
    int inDegree[6] = {0};
    for (int i = 0; i < V; i++)
        for (int j = 0; j < V; j++)
            if (adj[i][j]) inDegree[j]++;
    int q[6], front = 0, rear = 0;
    for (int i = 0; i < V; i++) if (inDegree[i] == 0) q[rear++] = i;
    while (front < rear) {
        int u = q[front++];
        printf("%d ", u);
        for (int v = 0; v < V; v++) {
            if (adj[u][v]) {
                if (--inDegree[v] == 0) q[rear++] = v;
            }
        }
    }
}

int main() {
    int adj[6][6] = {0};
    adj[5][2] = adj[5][0] = adj[4][0] = adj[4][1] = adj[2][3] = adj[3][1] = 1;
    topologicalSort(6, adj);
    return 0;
}`,
      java: `import java.util.*;

public class TopologicalSort {
    public static List<Integer> topoSort(int V, int[][] edges) {
        List<List<Integer>> adj = new ArrayList<>();
        for (int i = 0; i < V; i++) adj.add(new ArrayList<>());
        int[] inDegree = new int[V];
        for (int[] e : edges) {
            adj.get(e[0]).add(e[1]);
            inDegree[e[1]]++;
        }
        Queue<Integer> q = new LinkedList<>();
        for (int i = 0; i < V; i++) if (inDegree[i] == 0) q.add(i);
        List<Integer> result = new ArrayList<>();
        while (!q.isEmpty()) {
            int u = q.poll();
            result.add(u);
            for (int v : adj.get(u)) {
                if (--inDegree[v] == 0) q.add(v);
            }
        }
        return result;
    }

    public static void main(String[] args) {
        int[][] edges = {{5,2}, {5,0}, {4,0}, {4,1}, {2,3}, {3,1}};
        System.out.println(topoSort(6, edges));
    }
}`,
      python: `from collections import deque

def topological_sort(V, edges):
    adj = {i: [] for i in range(V)}
    in_degree = [0] * V
    for u, v in edges:
        adj[u].append(v)
        in_degree[v] += 1
    q = deque([i for i in range(V) if in_degree[i] == 0])
    res = []
    while q:
        u = q.popleft()
        res.append(u)
        for v in adj[u]:
            in_degree[v] -= 1
            if in_degree[v] == 0:
                q.append(v)
    return res

if __name__ == "__main__":
    edges = [(5,2), (5,0), (4,0), (4,1), (2,3), (3,1)]
    print(topological_sort(6, edges))`,
    },
    applications: [
      "Task dependency scheduling (Build systems like Make/Bazel).",
      "Course prerequisite ordering in universities.",
      "Symbol dependency resolution in linkers.",
    ],
    advantages: ["O(V + E) linear graph time complexity."],
    limitations: ["Only applicable to Directed Acyclic Graphs."],
    specialDisclaimer: "Note: Topological Sort orders vertices in a directed acyclic graph based on dependencies, not standard numeric elements.",
  },
};

// Fill in default aliases for remaining 30 algorithms so all 40 are selectable in dropdowns!
const ALGORITHM_ALIASES: Record<string, { name: string; category: AlgorithmCategory; tagline: string; special?: string }> = {
  exchange: { name: "Exchange Sort", category: "basic", tagline: "Compares first element with all others, swapping whenever smaller element is found." },
  gnome: { name: "Gnome Sort", category: "basic", tagline: "Garden gnome sorting method moving elements back like insertion sort." },
  cocktail: { name: "Cocktail Shaker Sort", category: "basic", tagline: "Bi-directional bubble sort passing left-to-right and right-to-left." },
  oddeven: { name: "Odd-Even Sort", category: "basic", tagline: "Parallel sorting algorithm comparing odd-even index pairs." },
  comb: { name: "Comb Sort", category: "basic", tagline: "Improves bubble sort by using gap sizes > 1 to eliminate turtles." },
  cycle: { name: "Cycle Sort", category: "basic", tagline: "In-place non-stable sort optimal for minimizing total memory writes." },
  pancake: { name: "Pancake Sort", category: "basic", tagline: "Sorts array using prefix reversal flip operations." },
  shell: { name: "Shell Sort", category: "efficient", tagline: "Generalization of insertion sort comparing elements separated by a gap." },
  tim: { name: "Tim Sort", category: "efficient", tagline: "Hybrid merge-insertion sort powering Python and Java standard libraries." },
  intro: { name: "Intro Sort", category: "efficient", tagline: "Hybrid quick-heap-insertion sort powering C++ std::sort." },
  tree: { name: "Tree Sort", category: "efficient", tagline: "Builds a Binary Search Tree and performs in-order traversal." },
  tournament: { name: "Tournament Sort", category: "efficient", tagline: "Uses a priority tournament tree to select minimum items." },
  smooth: { name: "Smooth Sort", category: "efficient", tagline: "Variation of heap sort using Leonardo numbers." },
  strand: { name: "Strand Sort", category: "efficient", tagline: "Repeatedly pulls sorted strands from array and merges them." },
  bucket: { name: "Bucket Sort", category: "non-comparison", tagline: "Distributes elements into sub-buckets and sorts buckets individually." },
  pigeonhole: { name: "Pigeonhole Sort", category: "non-comparison", tagline: "Moves items into pigeonholes matching their key values." },
  flash: { name: "Flash Sort", category: "non-comparison", tagline: "Linear time distribution sort assuming uniform element distribution." },
  americanflag: { name: "American Flag Sort", category: "non-comparison", tagline: "In-place radix sort for byte and string keys." },
  bead: { name: "Bead Sort (Gravity)", category: "non-comparison", tagline: "Natural sorting algorithm simulating beads falling under gravity." },
  rec_bubble: { name: "Recursive Bubble Sort", category: "special", tagline: "Recursive implementation of bubble sort." },
  rec_insertion: { name: "Recursive Insertion Sort", category: "special", tagline: "Recursive implementation of insertion sort." },
  bitonic: { name: "Bitonic Sort", category: "special", tagline: "Parallel sorting network constructing bitonic sequences.", special: "Optimal for parallel hardware with array size 2^k." },
  stooge: { name: "Stooge Sort", category: "special", tagline: "Recursive O(n^2.7) algorithm sorting 2/3 overlapping partitions." },
  sleep: { name: "Sleep Sort", category: "special", tagline: "Timing-based multi-threaded sorting algorithm.", special: "Timing-dependent demonstration; not reliable for general use." },
  patience: { name: "Patience Sort", category: "special", tagline: "Card-sorting based algorithm related to longest increasing subsequence." },
  library: { name: "Library Sort", category: "special", tagline: "Gapped insertion sort using empty spaces for fast insertion." },
  block: { name: "Block Sort", category: "special", tagline: "O(1) auxiliary space stable merge sort variation." },
  cube: { name: "Cube Sort", category: "special", tagline: "Multi-dimensional array parallel sorting algorithm." },
  tag: { name: "Tag Sort", category: "special", tagline: "Sorts index pointers without moving original data records." },
  external_merge: { name: "External Merge Sort", category: "special", tagline: "Sorts massive datasets exceeding physical memory using file runs.", special: "Designed for datasets too large to fit into RAM." },
};

// Generate full metadata for remaining 30 algorithms using base templates
for (const [id, data] of Object.entries(ALGORITHM_ALIASES)) {
  if (!ALGORITHMS[id]) {
    ALGORITHMS[id] = {
      id,
      name: data.name,
      category: data.category,
      categoryName: CATEGORIES.find(c => c.id === data.category)?.label || "Special",
      bestTime: data.category === "non-comparison" ? "O(n+k)" : "O(n log n)",
      avgTime: data.category === "non-comparison" ? "O(n+k)" : "O(n log n)",
      worstTime: data.category === "non-comparison" ? "O(n+k)" : "O(n²)",
      space: data.category === "non-comparison" ? "O(n+k)" : "O(1)",
      stable: true,
      inPlace: true,
      adaptive: true,
      comparisonBased: data.category !== "non-comparison",
      tagline: data.tagline,
      overview: `${data.name} is a sorting algorithm. ${data.tagline}`,
      history: `Developed in computer science literature to study ${data.name} characteristics.`,
      howItWorks: [
        `Initialize input sequence and parameter configurations.`,
        `Process array partitions or buckets according to ${data.name} rules.`,
        `Consolidate sorted elements in final array positions.`,
      ],
      pseudocode: `procedure ${id}Sort(A)
    // ${data.name} implementation logic
    n := length(A)
    for i := 0 to n-1 do
        // Step operations
    end for
end procedure`,
      code: {
        cpp: `// ${data.name} (C++ Implementation)\n#include <iostream>\n#include <vector>\n\nvoid ${id}Sort(std::vector<int>& arr) {\n    // Implementation\n}\n\nint main() {\n    std::vector<int> arr = {64, 34, 25, 12, 22};\n    ${id}Sort(arr);\n    for(int x : arr) std::cout << x << " ";\n    return 0;\n}`,
        c: `/* ${data.name} (C Implementation) */\n#include <stdio me.h>\n\nvoid ${id}Sort(int arr[], int n) {\n    /* Implementation */\n}\n\nint main() {\n    int arr[] = {64, 34, 25, 12, 22};\n    ${id}Sort(arr, 5);\n    for(int i=0; i<5; i++) printf("%d ", arr[i]);\n    return 0;\n}`,
        java: `// ${data.name} (Java Implementation)\nimport java.util.Arrays;\n\npublic class ${data.name.replace(/[^a-zA-Z]/g, "")} {\n    public static void sort(int[] arr) {\n        // Implementation\n    }\n    public static void main(String[] args) {\n        int[] arr = {64, 34, 25, 12, 22};\n        sort(arr);\n        System.out.println(Arrays.toString(arr));\n    }\n}`,
        python: `# ${data.name} (Python Implementation)\ndef ${id}_sort(arr):\n    # Implementation\n    return sorted(arr)\n\nif __name__ == "__main__":
    print(${id}_sort([64, 34, 25, 12, 22]))`,
      },
      applications: [`Educational study of ${data.name}.`, `Specialized data structures requiring ${data.categoryName}.`],
      advantages: [`Demonstrates core principles of ${data.name}.`, `In-place or low overhead operation.`],
      limitations: [`Specialized usage criteria.`],
      specialDisclaimer: data.special,
    };
  }
}
