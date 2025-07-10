import { 
  NewsItem, 
  NewsFeedRequest, 
  NewsFeedResponse, 
  NewsSymbolResponse, 
  NewsRefreshResponse, 
  NewsInsightsResponse 
} from '../types';

const API_BASE_URL = (import.meta as any).env.VITE_API_URL || 'https://7mjwgcrtq0.execute-api.ap-southeast-2.amazonaws.com';

/**
 * News Service for managing investment news and AI insights
 * Handles news feed, symbol-specific news, refresh, and AI analysis
 */
export class NewsService {
  
  /**
   * Get news items for a specific symbol
   * @param symbol Stock/ETF symbol
   * @param limit Number of items to return (default: 10)
   * @param days Number of days back to fetch (default: 7)
   * @returns Promise<NewsSymbolResponse>
   */
  static async getNewsForSymbol(
    symbol: string, 
    limit: number = 10, 
    days: number = 7
  ): Promise<NewsSymbolResponse> {
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        days: days.toString()
      });

      const response = await fetch(
        `${API_BASE_URL}/news/${symbol.toUpperCase()}?${params}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch news for ${symbol}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error fetching news for symbol ${symbol}:`, error);
      throw error;
    }
  }

  /**
   * Get recent news items across all symbols or specific symbols
   * @param request NewsFeedRequest with filtering options
   * @returns Promise<NewsFeedResponse>
   */
  static async getAllNews(request: NewsFeedRequest = {}): Promise<NewsFeedResponse> {
    try {
      const params = new URLSearchParams();
      
      if (request.limit) params.append('limit', request.limit.toString());
      if (request.days) params.append('days', request.days.toString());
      if (request.symbols && request.symbols.length > 0) {
        params.append('symbols', request.symbols.join(','));
      }

      const response = await fetch(
        `${API_BASE_URL}/news?${params}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch news feed: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching news feed:', error);
      throw error;
    }
  }

  /**
   * Refresh news for a specific symbol
   * @param symbol Stock/ETF symbol to refresh news for
   * @returns Promise<NewsRefreshResponse>
   */
  static async refreshNewsForSymbol(symbol: string): Promise<NewsRefreshResponse> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/news/refresh/${symbol.toUpperCase()}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to refresh news for ${symbol}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error refreshing news for symbol ${symbol}:`, error);
      throw error;
    }
  }

  /**
   * Generate AI insights for news items of a specific symbol
   * @param symbol Stock/ETF symbol to generate insights for
   * @returns Promise<NewsInsightsResponse>
   */
  static async generateInsights(symbol: string): Promise<NewsInsightsResponse> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/news/insights/${symbol.toUpperCase()}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to generate insights for ${symbol}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error generating insights for symbol ${symbol}:`, error);
      throw error;
    }
  }

  /**
   * Get news with AI recommendations (analyzed news only)
   * @param symbols Optional array of symbols to filter by
   * @param limit Number of items to return
   * @param days Number of days back to fetch
   * @returns Promise<NewsItem[]>
   */
  static async getNewsWithRecommendations(
    symbols?: string[], 
    limit: number = 20, 
    days: number = 3
  ): Promise<NewsItem[]> {
    try {
      const request: NewsFeedRequest = {
        symbols,
        limit,
        days,
        status: 'analyzed' // Only get news with AI analysis
      };

      const response = await this.getAllNews(request);
      
      // Filter to only include items with recommendations
      const newsWithRecommendations = response.news.filter(item => 
        item.recommendation && item.confidence && item.sentiment
      );

      return newsWithRecommendations;
    } catch (error) {
      console.error('Error fetching news with recommendations:', error);
      throw error;
    }
  }

  /**
   * Get latest news for portfolio symbols (helper method)
   * @param portfolioSymbols Array of symbols in user's portfolio
   * @param limit Number of items per symbol
   * @returns Promise<Record<string, NewsItem[]>>
   */
  static async getPortfolioNews(
    portfolioSymbols: string[], 
    limit: number = 3
  ): Promise<Record<string, NewsItem[]>> {
    try {
      const newsPromises = portfolioSymbols.map(async (symbol) => {
        try {
          const symbolNews = await this.getNewsForSymbol(symbol, limit, 7);
          return { symbol, news: symbolNews.news };
        } catch (error) {
          console.warn(`Failed to fetch news for ${symbol}:`, error);
          return { symbol, news: [] };
        }
      });

      const results = await Promise.allSettled(newsPromises);
      const portfolioNews: Record<string, NewsItem[]> = {};

      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          portfolioNews[result.value.symbol] = result.value.news;
        }
      });

      return portfolioNews;
    } catch (error) {
      console.error('Error fetching portfolio news:', error);
      throw error;
    }
  }

  /**
   * Get top news stories with BUY recommendations
   * @param limit Number of stories to return
   * @param days Days back to search
   * @returns Promise<NewsItem[]>
   */
  static async getBuyRecommendations(limit: number = 10, days: number = 7): Promise<NewsItem[]> {
    try {
      const allNews = await this.getNewsWithRecommendations(undefined, limit * 3, days);
      
      return allNews
        .filter(item => item.recommendation === 'BUY')
        .sort((a, b) => (b.confidence || 0) - (a.confidence || 0))
        .slice(0, limit);
    } catch (error) {
      console.error('Error fetching buy recommendations:', error);
      throw error;
    }
  }

  /**
   * Get news sentiment summary for a symbol
   * @param symbol Stock/ETF symbol
   * @param days Number of days to analyze
   * @returns Promise with sentiment analysis
   */
  static async getSymbolSentiment(symbol: string, days: number = 30) {
    try {
      const symbolNews = await this.getNewsForSymbol(symbol, 50, days);
      const analyzedNews = symbolNews.news.filter(item => item.sentiment);

      if (analyzedNews.length === 0) {
        return {
          overall: 'NEUTRAL' as const,
          positive: 0,
          negative: 0,
          neutral: 0,
          totalAnalyzed: 0,
          averageConfidence: 0
        };
      }

      const sentimentCounts = {
        POSITIVE: analyzedNews.filter(item => item.sentiment === 'POSITIVE').length,
        NEGATIVE: analyzedNews.filter(item => item.sentiment === 'NEGATIVE').length,
        NEUTRAL: analyzedNews.filter(item => item.sentiment === 'NEUTRAL').length
      };

      const totalAnalyzed = analyzedNews.length;
      const averageConfidence = analyzedNews.reduce((sum, item) => sum + (item.confidence || 0), 0) / totalAnalyzed;

      // Determine overall sentiment
      let overall: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' = 'NEUTRAL';
      if (sentimentCounts.POSITIVE > sentimentCounts.NEGATIVE) {
        overall = 'POSITIVE';
      } else if (sentimentCounts.NEGATIVE > sentimentCounts.POSITIVE) {
        overall = 'NEGATIVE';
      }

      return {
        overall,
        positive: sentimentCounts.POSITIVE,
        negative: sentimentCounts.NEGATIVE,
        neutral: sentimentCounts.NEUTRAL,
        totalAnalyzed,
        averageConfidence: Math.round(averageConfidence)
      };
    } catch (error) {
      console.error(`Error analyzing sentiment for ${symbol}:`, error);
      throw error;
    }
  }

  /**
   * Refresh news for multiple symbols in batch
   * @param symbols Array of symbols to refresh
   * @returns Promise<NewsRefreshResponse[]>
   */
  static async batchRefreshNews(symbols: string[]): Promise<NewsRefreshResponse[]> {
    try {
      const refreshPromises = symbols.map(symbol => this.refreshNewsForSymbol(symbol));
      const results = await Promise.allSettled(refreshPromises);
      
      return results.map((result, index) => {
        if (result.status === 'fulfilled') {
          return result.value;
        } else {
          return {
            message: `Failed to refresh ${symbols[index]}`,
            successful: 0,
            total: 1,
            results: [{
              symbol: symbols[index],
              success: false,
              action: 'no_news' as const,
              error: result.reason?.message || 'Unknown error'
            }],
            isScheduled: false
          };
        }
      });
    } catch (error) {
      console.error('Error in batch news refresh:', error);
      throw error;
    }
  }
}

export default NewsService;