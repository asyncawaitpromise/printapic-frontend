// Available prompt styles
export const PROMPT_STYLES = [
  {
    key: 'sticker',
    name: 'Sticker Style',
    description: 'Transform into a fun sticker design',
    icon: '🏷️',
    color: '#3B82F6'
  },
  {
    key: 'line-art',
    name: 'Line Art',
    description: 'Convert to clean line art illustration',
    icon: '✏️',
    color: '#10B981'
  },
  {
    key: 'van-gogh',
    name: 'Van Gogh Style',
    description: 'Apply Van Gogh artistic style',
    icon: '🎨',
    color: '#F59E0B'
  },
  {
    key: 'manga-style',
    name: 'Manga Style',
    description: 'Transform into manga/anime artwork',
    icon: '📚',
    color: '#8B5CF6'
  },
  {
    key: 'oil-painting',
    name: 'Oil Painting',
    description: 'Create an oil painting effect',
    icon: '🖼️',
    color: '#EF4444'
  }
];

// AI Workflow Data
export const WORKFLOWS = [
  {
    id: 'ai_style_transfer',
    name: 'AI Style Transfer',
    description: 'Transform your photo with various artistic styles',
    category: 'style',
    tokenCost: 3,
    estimatedTime: 20000,
    icon: '🎭',
    color: '#F59E0B',
    supportsPromptStyles: true,
    defaultPromptKey: 'sticker'
  },
  {
    id: 'remove_background',
    name: 'Remove Background',
    description: 'Cleanly remove the background from your photo using AI',
    category: 'editing',
    tokenCost: 2,
    estimatedTime: 15000,
    icon: '✂️',
    color: '#3B82F6',
    supportsPromptStyles: false
  },
  {
    id: 'enhance_colors',
    name: 'Enhance Colors',
    description: 'Make your photo colors pop with AI enhancement',
    category: 'enhancement',
    tokenCost: 1,
    estimatedTime: 10000,
    icon: '🎨',
    color: '#10B981',
    supportsPromptStyles: false
  },
  {
    id: 'vintage_filter',
    name: 'Vintage Filter',
    description: 'Add a classic vintage look to your photo',
    category: 'filter',
    tokenCost: 1,
    estimatedTime: 8000,
    icon: '📸',
    color: '#8B5CF6',
    supportsPromptStyles: false
  }
];

// Mock processing status responses
export const PROCESSING_STATUSES = {
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
export const RESULT_IMAGES = {
  remove_background: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzMzMzMzMyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkJhY2tncm91bmQgUmVtb3ZlZDwvdGV4dD48L3N2Zz4=',
  enhance_colors: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImNvbG9yR3JhZGllbnQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNmZjAwMDAiLz48c3RvcCBvZmZzZXQ9IjMzJSIgc3RvcC1jb2xvcj0iIzAwZmYwMCIvPjxzdG9wIG9mZnNldD0iNjYlIiBzdG9wLWNvbG9yPSIjMDAwMGZmIi8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjZmZmZjAwIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNjb2xvckdyYWRpZW50KSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+RW5oYW5jZWQgQ29sb3JzPC90ZXh0Pjwvc3ZnPg==',
  vintage_filter: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cmFkaWFsR3JhZGllbnQgaWQ9InZpbnRhZ2VHcmFkaWVudCIgY3g9IjUwJSIgY3k9IjUwJSIgcj0iNTAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjZmZkYjk5Ii8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjOGI0NTEzIi8+PC9yYWRpYWxHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCN2aW50YWdlR3JhZGllbnQpIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzMzMzMzMyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlZpbnRhZ2UgRmlsdGVyPC90ZXh0Pjwvc3ZnPg==',
  // Style-specific result images
  ai_style_transfer: {
    sticker: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjgwIiBmaWxsPSIjM0I4MkY2IiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iNCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+U3RpY2tlciBTdHlsZTwvdGV4dD48L3N2Zz4=',
    'line-art': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNTAgNTAgTDE1MCA1MCBMMTUwIDE1MCBMNTAgMTUwIFoiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzMzMzMzMyIgc3Ryb2tlLXdpZHRoPSIyIi8+PHRleHQgeD0iNTAlIiB5PSI4MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzMzMzMzMyIgdGV4dC1hbmNob3I9Im1pZGRsZSI+TGluZSBBcnQ8L3RleHQ+PC9zdmc+',
    'van-gogh': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0ic3dpcmxzIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiPjxwYXRoIGQ9Ik0gMTAgMTAgbSAtNSAwIGEgNSA1IDAgMSAxIDEwIDAgYSA1IDUgMCAxIDEgLTEwIDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI0Y1OUUwQiIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI3N3aXJscykiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSIjMzMzIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+VmFuIEdvZ2ggU3R5bGU8L3RleHQ+PC9zdmc+',
    'manga-style': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cG9seWdvbiBwb2ludHM9IjEwMCwyMCAxODAsMTgwIDIwLDE4MCIgZmlsbD0iIzhCNUNGNiIgc3Ryb2tlPSIjMzMzIiBzdHJva2Utd2lkdGg9IjIiLz48dGV4dCB4PSI1MCUiIHk9IjgwJSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSIjMzMzIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5NYW5nYSBTdHlsZTwvdGV4dD48L3N2Zz4=',
    'oil-painting': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudjMub3JnLzIwMDAvc3ZnIj48ZGVmcz48ZmlsdGVyIGlkPSJibHVyIj48ZmVHYXVzc2lhbkJsdXIgaW49IlNvdXJjZUdyYXBoaWMiIHN0ZERldmlhdGlvbj0iMiIvPjwvZmlsdGVyPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjRUY0NDQ0IiBmaWx0ZXI9InVybCgjYmx1cikiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk9pbCBQYWludGluZzwvdGV4dD48L3N2Zz4='
  }
};

// Mock cost calculator
export const calculateMockTokenCost = (workflowId, photoCount = 1) => {
  const workflow = WORKFLOWS.find(w => w.id === workflowId);
  if (!workflow) return 0;
  
  const baseCost = workflow.tokenCost * photoCount;
  const bulkDiscount = photoCount > 5 ? 0.1 : 0; // 10% discount for bulk
  
  return Math.max(1, Math.floor(baseCost * (1 - bulkDiscount)));
};

// Mock processing time calculator
export const calculateMockProcessingTime = (workflowId, photoCount = 1) => {
  const workflow = WORKFLOWS.find(w => w.id === workflowId);
  if (!workflow) return 10000;
  
  const baseTime = workflow.estimatedTime;
  const additionalTime = (photoCount - 1) * (baseTime * 0.3); // 30% additional time per extra photo
  
  return baseTime + additionalTime;
};

export default WORKFLOWS; 