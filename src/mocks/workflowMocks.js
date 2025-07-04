// Mock AI Workflow Data
export const MOCK_WORKFLOWS = [
  {
    id: 'remove_background',
    name: 'Remove Background',
    description: 'Cleanly remove the background from your photo using AI',
    category: 'editing',
    tokenCost: 2,
    estimatedTime: 15000,
    icon: '✂️',
    color: '#3B82F6'
  },
  {
    id: 'enhance_colors',
    name: 'Enhance Colors',
    description: 'Make your photo colors pop with AI enhancement',
    category: 'enhancement',
    tokenCost: 1,
    estimatedTime: 10000,
    icon: '🎨',
    color: '#10B981'
  },
  {
    id: 'cartoon_style',
    name: 'Cartoon Style',
    description: 'Transform your photo into a cartoon illustration',
    category: 'style',
    tokenCost: 3,
    estimatedTime: 20000,
    icon: '🎭',
    color: '#F59E0B'
  },
  {
    id: 'vintage_filter',
    name: 'Vintage Filter',
    description: 'Add a classic vintage look to your photo',
    category: 'filter',
    tokenCost: 1,
    estimatedTime: 8000,
    icon: '📸',
    color: '#8B5CF6'
  }
];

// Mock processing status responses
export const MOCK_PROCESSING_STATUSES = {
  queued: {
    status: 'queued',
    progress: 0,
    message: 'Your photo is in the processing queue',
    estimatedTimeRemaining: 15000
  },
  processing: {
    status: 'processing',
    progress: 45,
    message: 'AI is working on your photo',
    estimatedTimeRemaining: 8000
  },
  completed: {
    status: 'completed',
    progress: 100,
    message: 'Processing complete!',
    estimatedTimeRemaining: 0
  },
  failed: {
    status: 'failed',
    progress: 0,
    message: 'Processing failed. Please try again.',
    estimatedTimeRemaining: 0
  }
};

// Mock result images (base64 placeholders)
export const MOCK_RESULT_IMAGES = {
  remove_background: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzMzMzMzMyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkJhY2tncm91bmQgUmVtb3ZlZDwvdGV4dD48L3N2Zz4=',
  enhance_colors: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImNvbG9yR3JhZGllbnQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNmZjAwMDAiLz48c3RvcCBvZmZzZXQ9IjMzJSIgc3RvcC1jb2xvcj0iIzAwZmYwMCIvPjxzdG9wIG9mZnNldD0iNjYlIiBzdG9wLWNvbG9yPSIjMDAwMGZmIi8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjZmZmZjAwIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNjb2xvckdyYWRpZW50KSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+RW5oYW5jZWQgQ29sb3JzPC90ZXh0Pjwvc3ZnPg==',
  cartoon_style: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjgwIiBmaWxsPSIjZmZkNzAwIiBzdHJva2U9IiMzMzMiIHN0cm9rZS13aWR0aD0iMyIvPjxjaXJjbGUgY3g9IjgwIiBjeT0iODAiIHI9IjgiIGZpbGw9IiMzMzMiLz48Y2lyY2xlIGN4PSIxMjAiIGN5PSI4MCIgcj0iOCIgZmlsbD0iIzMzMyIvPjx0ZXh0IHg9IjUwJSIgeT0iODAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiMzMzMiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkNhcnRvb24gU3R5bGU8L3RleHQ+PC9zdmc+',
  vintage_filter: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cmFkaWFsR3JhZGllbnQgaWQ9InZpbnRhZ2VHcmFkaWVudCIgY3g9IjUwJSIgY3k9IjUwJSIgcj0iNTAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjZmZkYjk5Ii8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjOGI0NTEzIi8+PC9yYWRpYWxHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCN2aW50YWdlR3JhZGllbnQpIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzMzMzMzMyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlZpbnRhZ2UgRmlsdGVyPC90ZXh0Pjwvc3ZnPg=='
};

// Mock cost calculator
export const calculateMockTokenCost = (workflowId, photoCount = 1) => {
  const workflow = MOCK_WORKFLOWS.find(w => w.id === workflowId);
  if (!workflow) return 0;
  
  const baseCost = workflow.tokenCost * photoCount;
  const bulkDiscount = photoCount > 5 ? 0.1 : 0; // 10% discount for bulk
  
  return Math.max(1, Math.floor(baseCost * (1 - bulkDiscount)));
};

// Mock processing time calculator
export const calculateMockProcessingTime = (workflowId, photoCount = 1) => {
  const workflow = MOCK_WORKFLOWS.find(w => w.id === workflowId);
  if (!workflow) return 10000;
  
  const baseTime = workflow.estimatedTime;
  const additionalTime = (photoCount - 1) * (baseTime * 0.3); // 30% additional time per extra photo
  
  return baseTime + additionalTime;
};

export default MOCK_WORKFLOWS; 