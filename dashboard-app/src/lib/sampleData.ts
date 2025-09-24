// Sample data for development and demo purposes
import { ITopic, IFlashcard, IQuestion } from './api';

export const sampleTopics: ITopic[] = [
  {
    _id: "topic1",
    name: "Advanced React Patterns",
    description: "Master advanced React concepts including hooks, context, and performance optimization techniques for building scalable applications.",
    sourceTitle: "React Documentation",
    sourceURL: "https://reactjs.org/docs",
    flashcards: ["fc1", "fc2", "fc3", "fc4"],
    assessment: ["q1", "q2", "q3", "q4"]
  },
  {
    _id: "topic2", 
    name: "Cybersecurity Fundamentals",
    description: "Essential cybersecurity principles, threat modeling, encryption methods, and security best practices for modern applications.",
    sourceTitle: "OWASP Security Guide",
    sourceURL: "https://owasp.org",
    flashcards: ["fc5", "fc6", "fc7"],
    assessment: ["q5", "q6", "q7"]
  },
  {
    _id: "topic3",
    name: "Machine Learning Basics",
    description: "Introduction to machine learning algorithms, neural networks, and practical applications in data science and AI.",
    sourceTitle: "ML Course",
    flashcards: ["fc8", "fc9", "fc10", "fc11"],
    assessment: ["q8", "q9", "q10"]
  }
];

export const sampleFlashcards: Record<string, IFlashcard[]> = {
  topic1: [
    {
      _id: "fc1",
      front: "What is the React Context API used for?",
      back: "The Context API allows you to share state between components without prop drilling. It's perfect for global state like user authentication, themes, or language preferences."
    },
    {
      _id: "fc2", 
      front: "What are React Hooks and why are they useful?",
      back: "Hooks are functions that let you use state and lifecycle features in functional components. They make components more reusable and easier to test while reducing complexity."
    },
    {
      _id: "fc3",
      front: "Explain the difference between useMemo and useCallback",
      back: "useMemo memoizes a computed value, while useCallback memoizes a function. Both help optimize performance by preventing unnecessary recalculations on re-renders."
    },
    {
      _id: "fc4",
      front: "What is React.lazy() and Suspense?",
      back: "React.lazy() enables code splitting by allowing you to load components dynamically. Suspense provides a fallback UI while the lazy component is loading."
    }
  ],
  topic2: [
    {
      _id: "fc5",
      front: "What is the principle of least privilege?",
      back: "Users and systems should only have the minimum level of access needed to perform their functions. This reduces the attack surface and limits potential damage from compromised accounts."
    },
    {
      _id: "fc6",
      front: "What is two-factor authentication (2FA)?",
      back: "2FA adds an extra layer of security by requiring two different authentication factors: something you know (password) and something you have (phone, token) or are (biometric)."
    },
    {
      _id: "fc7",
      front: "What is SQL injection and how can it be prevented?",
      back: "SQL injection occurs when malicious SQL code is inserted into application queries. Prevent it using parameterized queries, input validation, and least privilege database access."
    }
  ],
  topic3: [
    {
      _id: "fc8",
      front: "What is supervised learning?",
      back: "Supervised learning uses labeled training data to learn a mapping function from inputs to outputs. Examples include classification and regression tasks."
    },
    {
      _id: "fc9",
      front: "What is the difference between overfitting and underfitting?",
      back: "Overfitting occurs when a model learns training data too well but performs poorly on new data. Underfitting happens when a model is too simple to capture patterns."
    },
    {
      _id: "fc10",
      front: "What is a neural network?",
      back: "A neural network is a computing system inspired by biological neural networks. It consists of interconnected nodes (neurons) that process information through weighted connections."
    },
    {
      _id: "fc11",
      front: "What is gradient descent?",
      back: "Gradient descent is an optimization algorithm used to minimize the cost function by iteratively moving in the direction of steepest descent of the gradient."
    }
  ]
};

export const sampleQuestions: Record<string, IQuestion[]> = {
  topic1: [
    {
      _id: "q1",
      questionText: "Which hook is used for managing side effects in React?",
      options: ["useState", "useEffect", "useContext", "useMemo"],
      correctAnswer: "useEffect",
      explanation: "useEffect is specifically designed for handling side effects like API calls, subscriptions, and DOM manipulation."
    },
    {
      _id: "q2",
      questionText: "What is the correct way to update state in React?",
      options: ["Directly modify state", "Use setState function", "Use state setter from useState", "Manually trigger re-render"],
      correctAnswer: "Use state setter from useState",
      explanation: "In functional components, you should use the state setter function returned by useState hook."
    },
    {
      _id: "q3", 
      questionText: "When should you use useCallback?",
      options: ["Always for all functions", "Never, it's deprecated", "When passing functions as dependencies", "Only in class components"],
      correctAnswer: "When passing functions as dependencies",
      explanation: "useCallback prevents unnecessary re-renders by memoizing functions, especially useful when passing to child components or using in dependency arrays."
    },
    {
      _id: "q4",
      questionText: "What does React.StrictMode do?",
      options: ["Improves performance", "Enables strict type checking", "Highlights potential problems in development", "Prevents all errors"],
      correctAnswer: "Highlights potential problems in development",
      explanation: "StrictMode helps identify unsafe lifecycles, legacy API usage, and other potential issues during development."
    }
  ],
  topic2: [
    {
      _id: "q5", 
      questionText: "What is the primary purpose of encryption?",
      options: ["Speed up data transfer", "Compress data", "Protect data confidentiality", "Validate user identity"],
      correctAnswer: "Protect data confidentiality",
      explanation: "Encryption transforms readable data into an unreadable format to protect it from unauthorized access."
    },
    {
      _id: "q6",
      questionText: "Which of these is NOT a type of malware?",
      options: ["Trojan", "Firewall", "Ransomware", "Spyware"],
      correctAnswer: "Firewall", 
      explanation: "A firewall is a security system that monitors network traffic. Trojans, ransomware, and spyware are all types of malicious software."
    },
    {
      _id: "q7",
      questionText: "What does HTTPS provide that HTTP doesn't?",
      options: ["Faster loading", "Better SEO", "Encryption in transit", "Smaller file sizes"],
      correctAnswer: "Encryption in transit",
      explanation: "HTTPS encrypts data transmitted between the browser and server, preventing eavesdropping and tampering."
    }
  ],
  topic3: [
    {
      _id: "q8",
      questionText: "What is the main goal of unsupervised learning?",
      options: ["Predict outcomes", "Find hidden patterns", "Classify data", "Reduce errors"],
      correctAnswer: "Find hidden patterns",
      explanation: "Unsupervised learning discovers hidden patterns and structures in data without labeled examples."
    },
    {
      _id: "q9", 
      questionText: "Which algorithm is commonly used for classification?",
      options: ["K-means", "Linear regression", "Decision tree", "PCA"],
      correctAnswer: "Decision tree",
      explanation: "Decision trees are popular classification algorithms that create a model predicting target values based on decision rules."
    },
    {
      _id: "q10",
      questionText: "What is cross-validation used for?",
      options: ["Data preprocessing", "Model evaluation", "Feature selection", "Data collection"], 
      correctAnswer: "Model evaluation",
      explanation: "Cross-validation evaluates model performance by training and testing on different subsets of data to assess generalization ability."
    }
  ]
};