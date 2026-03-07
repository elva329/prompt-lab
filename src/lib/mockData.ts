export type User = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
};

export type Prompt = {
  id: string;
  title: string;
  content: string;
  category: string;
  createdAt: string;
};

export type ExperimentResult = {
  id: string;
  promptId: string;
  aiResponse: string;
  userRating: number;
  aiScore: number;
  responseLength: number;
  responseTimeMs: number;
};

export type Experiment = {
  id: string;
  name: string;
  taskDescription: string;
  createdAt: string;
  status: 'draft' | 'completed';
  results: ExperimentResult[];
  selectedPromptIds: string[];
};

export const MOCK_USER: User = {
  id: 'u-1',
  name: 'Alex Developer',
  email: 'alex@promptlab.dev',
  role: 'admin',
};

export const MOCK_PROMPTS: Prompt[] = [
  {
    id: 'p-1',
    title: 'SEO Blog Intro',
    content: 'Write a compelling, SEO-optimized introduction for a blog post about [Topic]. Include the keyword naturally in the first sentence. Tone should be engaging and professional.',
    category: 'Content Writing',
    createdAt: '2023-10-01T10:00:00Z',
  },
  {
    id: 'p-2',
    title: 'Code Refactor Assistant',
    content: 'Review the following React code. Suggest performance improvements and refactor it to use modern hooks. Provide only the refactored code and a brief bulleted list of changes.',
    category: 'Coding',
    createdAt: '2023-10-02T14:30:00Z',
  },
  {
    id: 'p-3',
    title: 'Marketing Email V1',
    content: 'Act as an expert copywriter. Write a short promotional email for a new feature launch: [Feature]. The goal is to get users to click the CTA to try it out. Keep it under 150 words.',
    category: 'Marketing',
    createdAt: '2023-10-05T09:15:00Z',
  },
  {
    id: 'p-4',
    title: 'Marketing Email V2 (AIDA)',
    content: 'Using the AIDA framework (Attention, Interest, Desire, Action), write an email promoting [Feature]. Make the subject line punchy and irresistible.',
    category: 'Marketing',
    createdAt: '2023-10-05T09:45:00Z',
  }
];

export const MOCK_EXPERIMENTS: Experiment[] = [
  {
    id: 'e-1',
    name: 'Marketing Email Optimization',
    taskDescription: 'Testing two different prompt structures for a new feature announcement email.',
    createdAt: '2023-10-10T11:00:00Z',
    status: 'completed',
    selectedPromptIds: ['p-3', 'p-4'],
    results: [
      {
        id: 'r-1',
        promptId: 'p-3',
        aiResponse: "Subject: New Feature Alert!\n\nHi there,\n\nWe're excited to announce our newest feature. It's designed to save you time and make your workflow smoother. Try it out today by clicking the link below!\n\nBest,\nThe Team",
        userRating: 3,
        aiScore: 72,
        responseLength: 39,
        responseTimeMs: 1200,
      },
      {
        id: 'r-2',
        promptId: 'p-4',
        aiResponse: "Subject: Stop wasting hours on manual tasks 🛑\n\nHey,\n\nAre you tired of repetitive busywork? We've just launched a new feature that automates your entire workflow in seconds. Imagine getting 5 hours back every week.\n\nReady to see it in action? Click here to try it now.\n\nCheers!",
        userRating: 5,
        aiScore: 94,
        responseLength: 48,
        responseTimeMs: 1450,
      }
    ]
  }
];

export const CATEGORY_STATS = [
  { name: 'Marketing', count: 45 },
  { name: 'Coding', count: 32 },
  { name: 'Content', count: 28 },
  { name: 'Data Analysis', count: 15 },
  { name: 'Other', count: 10 },
];