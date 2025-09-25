import OpenAI from 'openai';
import { buildTopicExtractionPrompt, systemPrompt } from '../prompts/topicExtraction.js';

// Import shared type definitions
import type { Content, Topic } from '../types/index.js';

// Type for the raw topic object received from the AI before validation
type RawAITopic = Omit<Topic, 'extractedFrom' | 'id'> & { id?: string };

// Type for the expected JSON structure from the AI API call
interface AITopicResponse {
  topics: RawAITopic[];
}

class TopicExtractor {
  private openai: OpenAI | null = null;

  constructor() {
    // Don't initialize OpenAI in constructor - do it lazily
  }

  private getOpenAI(): OpenAI {
    if (!this.openai) {
      console.log('Initializing OpenAI - API Key status:', process.env.OPENAI_API_KEY ? 'FOUND' : 'NOT FOUND');
      console.log('API Key length:', process.env.OPENAI_API_KEY?.length || 0);
      
      if (!process.env.OPENAI_API_KEY) {
        throw new Error('OpenAI API key not configured. Cannot extract topics.');
      }
      
      this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
    return this.openai;
  }

  public async extractTopics(content: Content, customPrompt?: string): Promise<Topic[]> {
    console.log(`Extracting topics from: ${content.title} (${content.type})`);
    if (customPrompt) {
      console.log(`Using custom prompt: ${customPrompt.substring(0, 100)}...`);
    }

    // Initialize OpenAI (this will throw if no API key)
    const openai = this.getOpenAI();

    const processedText = this.prepareContentForAnalysis(content);

    // Fail if content is too short
    if (processedText.length < 50) {
      throw new Error('Content too short for topic extraction.');
    }

    return await this.extractTopicsWithAI(processedText, content, customPrompt);
  }

  private prepareContentForAnalysis(content: Content): string {
    let text = content.text || '';
    text = text.replace(/\s+/g, ' ').trim();

    // For PDFs, remove metadata prefix if present
    if (text.startsWith('PDF_URL:')) {
      text = text.replace(/^PDF_URL:\s*[^\n]*\n?/, '');
    }

    // Limit text length for API efficiency
    return this.truncateContent(text, 12000);
  }

  private async extractTopicsWithAI(text: string, content: Content, customPrompt?: string): Promise<Topic[]> {
    const prompt = buildTopicExtractionPrompt(text, content, customPrompt);
    console.log('Calling OpenAI for topic extraction...');
    if (customPrompt) {
      console.log('Using custom prompt for enhanced extraction');
    }

    const openai = this.getOpenAI();
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 1500,
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    const messageContent = response.choices[0]?.message?.content;
    if (!messageContent) {
      throw new Error('OpenAI returned empty response');
    }

    const result = JSON.parse(messageContent) as AITopicResponse;

    if (!result.topics || !Array.isArray(result.topics) || result.topics.length === 0) {
      throw new Error('OpenAI failed to extract any valid topics');
    }

    console.log(`Successfully extracted ${result.topics.length} topics from OpenAI`);
    return this.validateAndEnhanceTopics(result.topics, content);
  }



  private validateAndEnhanceTopics(topics: RawAITopic[], content: Content): Topic[] {
    const validTopics = topics
      .filter(topic => topic.name && topic.description && (topic.confidence ?? 0) >= 0.5)
      .map((topic, index) => ({
        id: topic.id || `topic-${Date.now()}-${index}`,
        name: topic.name.substring(0, 60),
        description: topic.description.substring(0, 200),
        confidence: Math.min(Math.max(topic.confidence || 0.6, 0.5), 1.0),
        category: topic.category || 'General',
        keywords: Array.isArray(topic.keywords) ? topic.keywords.slice(0, 5) : [],
        extractedFrom: {
          url: content.url,
          title: content.title,
          type: content.type,
          extractedAt: new Date().toISOString(),
        },
      }))
      .slice(0, 6);

    if (validTopics.length === 0) {
      throw new Error('OpenAI returned no valid topics after validation');
    }

    return validTopics;
  }

  private truncateContent(text: string, maxChars: number): string {
    if (text.length <= maxChars) {
      return text;
    }
    const beginning = text.substring(0, Math.floor(maxChars * 0.7));
    const ending = text.substring(text.length - Math.floor(maxChars * 0.3));
    return `${beginning}\n\n[... content truncated for processing ...]\n\n${ending}`;
  }
}

// Export a singleton instance of the class
export const topicExtractor = new TopicExtractor();
