import { GeneratedContent } from './types';

export const generateRecipeContent = async (recipeName: string): Promise<GeneratedContent> => {
  return {
    youtubeTitle: [`Как приготовить ${recipeName}`],
    youtubeDescription: `В этом видео вы узнаете, как приготовить ${recipeName}.`,
    youtubeTags: ['рецепт', recipeName, 'еда'],
    socialMediaPosts: [
      { platform: 'VK', type: 'Post', text: `Попробуй приготовить ${recipeName}!` },
    ],
    ingredients: [
      { name: 'Вода', quantity: '1', unit: 'л' },
      { name: recipeName, quantity: '500', unit: 'г' },
    ],
    instructions: ['Шаг 1', 'Шаг 2'],
    thumbnailDescription: `Яркая миниатюра для ${recipeName}`,
  };
};

export const generateCanvasThumbnail = async (recipeName: string): Promise<string> => {
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 200;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = 'orange';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'white';
  ctx.font = '20px Arial';
  ctx.fillText(recipeName, 50, 100);
  return canvas.toDataURL('image/png');
};
