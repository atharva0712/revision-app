// Topic extraction prompt for OpenAI
export const buildTopicExtractionPrompt = (
  text: string,
  content: any,
  customPrompt?: string
): string => {
  const basePrompt = `Analyze the following ${
    content.type
  } content and extract 3-6 key learning topics that would be valuable for educational purposes.

CONTENT DETAILS:
Title: ${content.title}
Type: ${content.type}
Word Count: ${content.wordCount || "unknown"}

CONTENT TEXT:
${text}

Please extract topics and return them in this exact JSON format:
{
  "topics": [
    {
      "id": "unique-topic-id-1",
      "name": "Clear Topic Name (2-4 words)",
      "description": "Brief description explaining what this topic covers and why it's valuable for learning (1-2 sentences)",
      "confidence": 0.85,
      "category": "relevant-category",
      "keywords": ["keyword1", "keyword2", "keyword3"]
    }
  ]
}

Guidelines:
- Focus on educational value and practical learning outcomes.
- Make topic names clear and specific.
- Include confidence scores between 0.6-1.0.
- Ensure topics are distinct and non-overlapping.
- Prioritize actionable learning concepts.
- For technical content, include both concepts and practical skills.
- For articles, focus on key insights and takeaways.`;

  // If custom prompt is provided, append it with clear instructions
  if (customPrompt && customPrompt.trim()) {
    return basePrompt + `

--- ADDITIONAL USER INSTRUCTIONS ---
The user has provided the following specific instructions for topic extraction:
"${customPrompt.trim()}"

Please incorporate these instructions while still following the JSON format and basic guidelines above.`;
  }

  return basePrompt;
};

export const systemPrompt =
  "You are an expert educational content analyzer. Extract clear, actionable learning topics from content.";
