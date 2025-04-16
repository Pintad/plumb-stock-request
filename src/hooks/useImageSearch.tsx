
import { useState } from 'react';
import { toast } from '@/components/ui/use-toast';

interface ImageSearchProps {
  apiKey: string;
}

export const useImageSearch = ({ apiKey }: ImageSearchProps) => {
  const [isSearching, setIsSearching] = useState(false);

  const searchImage = async (query: string): Promise<string | null> => {
    setIsSearching(true);
    try {
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-small-128k-online',
          messages: [
            {
              role: 'system',
              content: 'Find an appropriate image URL for this product. Return only the URL, nothing else.'
            },
            {
              role: 'user',
              content: `Find a professional product image URL for: ${query}`
            }
          ],
          temperature: 0.2,
          max_tokens: 100
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to search for image');
      }

      const data = await response.json();
      const imageUrl = data.choices[0].message.content;
      return imageUrl;
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de trouver une image",
      });
      return null;
    } finally {
      setIsSearching(false);
    }
  };

  return { searchImage, isSearching };
};
