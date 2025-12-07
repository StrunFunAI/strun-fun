// NOTE: AI görev üretimi şu an backend'e veya gerçek Gemini API'ye gitmiyor.
// Aşağıdaki sınıf, butonun her zaman çalışması için "mock" (sahte) görevler üretir.

export interface GeneratedTask {
  title: string;
  description: string;
  category: string;
  reward: number;
  location?: {
    lat: number;
    lng: number;
    name: string;
  };
  requirements: string[];
  duration: string;
}

const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';

export class AITaskGenerator {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
  }

  async generateTask(context: {
    userLocation?: { lat: number; lng: number };
    userInterests?: string[];
    difficulty?: 'easy' | 'medium' | 'hard';
    category?: string;
  }): Promise<GeneratedTask> {
    const prompt = this.buildPrompt(context);

    if (!this.apiKey) {
      console.warn('⚠️ [AI Task] EXPO_PUBLIC_GEMINI_API_KEY missing, using mock task');
      return this.generateMockTask(context);
    }

    try {
      const response = await fetch(`${GEMINI_ENDPOINT}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: prompt }],
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`Gemini responded with ${response.status}`);
      }

      const data = await response.json();
      const content = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!content) {
        throw new Error('Gemini response missing content');
      }

      const parsedTask = this.parseAIResponse(content);

      return {
        ...parsedTask,
        location: context.userLocation
          ? {
              lat: context.userLocation.lat,
              lng: context.userLocation.lng,
              name: 'Nearby Spot',
            }
          : undefined,
      };
    } catch (error) {
      console.error('❌ [AI Task] Gemini request failed:', error);
      return this.generateMockTask(context);
    }
  }

  private generateMockTask(context: {
    userLocation?: { lat: number; lng: number };
    userInterests?: string[];
    difficulty?: 'easy' | 'medium' | 'hard';
  }): GeneratedTask {
    const { userLocation, userInterests, difficulty = 'medium' } = context;

    const interest = userInterests && userInterests.length > 0
      ? userInterests[0]
      : 'content creation';

    const baseTitleMap: any = {
      easy: 'Quick Content Shot',
      medium: 'City Story Challenge',
      hard: 'Epic Creator Marathon',
    };

    const rewardMap: any = {
      easy: 50,
      medium: 120,
      hard: 250,
    };

    const title = baseTitleMap[difficulty] || 'Creator Task';
    const reward = rewardMap[difficulty] || 80;

    const locationName = userLocation
      ? 'Nearby Spot'
      : 'Any place you like';

    return {
      title: `${title} • ${interest}`,
      description:
        'Create a short piece of content based on your current environment. Focus on storytelling and show one interesting detail.',
      category: 'creative',
      reward,
      duration: difficulty === 'hard' ? '1-2 hours' : difficulty === 'easy' ? '15-30 min' : '30-60 min',
      requirements: [
        'Capture photo or video in portrait mode',
        'Include at least 1 text overlay or caption',
        'Use #strun hashtag in your description',
      ],
      location: userLocation
        ? {
            lat: userLocation.lat,
            lng: userLocation.lng,
            name: locationName,
          }
        : undefined,
    };
  }

  private buildPrompt(context: any): string {
    const { userLocation, userInterests, difficulty, category } = context;
    
    let prompt = 'Aşağıdaki kriterlere göre bir içerik üretici görevi oluştur:\n\n';
    
    if (userLocation) {
      prompt += `📍 Lokasyon: ${userLocation.lat}, ${userLocation.lng}\n`;
    }
    
    if (userInterests && userInterests.length > 0) {
      prompt += `🎯 İlgi Alanları: ${userInterests.join(', ')}\n`;
    }
    
    if (difficulty) {
      prompt += `⭐ Zorluk: ${difficulty}\n`;
    }
    
    if (category) {
      prompt += `📁 Kategori: ${category}\n`;
    }
    
    prompt += `\nGörev şunları içermeli:
- Yaratıcı ve ilgi çekici bir başlık
- Detaylı açıklama (2-3 cümle)
- Kategori (video, photo, challenge, vlog vb.)
- Ödül miktarı (10-100 STRUN token arası)
- 3-5 tane net gereksinim
- Tahmini süre

JSON formatında şu şekilde cevap ver:
{
  "title": "...",
  "description": "...",
  "category": "...",
  "reward": 50,
  "requirements": ["...", "...", "..."],
  "duration": "15-30 dakika"
}`;

    return prompt;
  }

  private parseAIResponse(content: string): GeneratedTask {
    try {
      // JSON'u extract et
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid response format');
      }
      
      const parsed = JSON.parse(jsonMatch[0]);
      
      return {
        title: parsed.title || 'Yeni Görev',
        description: parsed.description || '',
        category: parsed.category || 'other',
        reward: parsed.reward || 50,
        requirements: parsed.requirements || [],
        duration: parsed.duration || '15-30 dakika',
      };
    } catch (error) {
      console.error('Error parsing AI response:', error);
      // Fallback görev
      return {
        title: 'Yeni İçerik Oluştur',
        description: 'AI tarafından oluşturulan özel görev',
        category: 'video',
        reward: 50,
        requirements: [
          '1-2 dakika video çek',
          'Lokasyon etiketini ekle',
          'En az 3 hashtag kullan'
        ],
        duration: '15-30 dakika',
      };
    }
  }

  // Toplu görev oluştur
  async generateMultipleTasks(
    count: number,
    context: {
      userLocation?: { lat: number; lng: number };
      userInterests?: string[];
    }
  ): Promise<GeneratedTask[]> {
    const tasks: GeneratedTask[] = [];
    
    for (let i = 0; i < count; i++) {
      try {
        const task = await this.generateTask({
          ...context,
          difficulty: ['easy', 'medium', 'hard'][i % 3] as any,
        });
        tasks.push(task);
        
        // Rate limiting için bekle
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Error generating task ${i + 1}:`, error);
      }
    }
    
    return tasks;
  }
}

// Singleton instance
export const aiTaskGenerator = new AITaskGenerator();
