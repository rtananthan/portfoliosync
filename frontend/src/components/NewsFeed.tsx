import React, { useState, useEffect } from 'react';
import { NewsItem as NewsItemType, NewsWidgetConfig } from '../types';
import NewsService from '../services/newsService';
import NewsItem from './NewsItem';
import { Loader, RefreshCw, Filter, AlertCircle, TrendingUp, Newspaper } from 'lucide-react';

interface NewsFeedProps {
  config?: NewsWidgetConfig;
  portfolioSymbols?: string[];
  className?: string;
}

const NewsFeed: React.FC<NewsFeedProps> = ({ 
  config = {}, 
  portfolioSymbols = [], 
  className = '' 
}) => {
  const [news, setNews] = useState<NewsItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'buy' | 'sell' | 'hold'>('all');

  // Configuration with defaults
  const {
    symbol,
    maxItems = 10,
    showRecommendations = true,
    timeframe = 7,
    layout = 'card'
  } = config;

  useEffect(() => {
    loadNews();
  }, [symbol, maxItems, timeframe, portfolioSymbols]);

  const loadNews = async () => {
    try {
      setLoading(true);
      setError(null);

      let newsData: NewsItemType[];

      if (symbol) {
        // Get news for specific symbol
        const response = await NewsService.getNewsForSymbol(symbol, maxItems, timeframe);
        newsData = response.news;
      } else if (portfolioSymbols.length > 0) {
        // Get news for portfolio symbols
        const response = await NewsService.getAllNews({
          symbols: portfolioSymbols,
          limit: maxItems * 2, // Get more to account for filtering
          days: timeframe
        });
        newsData = response.news.slice(0, maxItems);
      } else {
        // Get general news feed
        const response = await NewsService.getAllNews({
          limit: maxItems,
          days: timeframe
        });
        newsData = response.news;
      }

      setNews(newsData);
    } catch (err) {
      console.error('Error loading news:', err);
      setError(err instanceof Error ? err.message : 'Failed to load news');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      
      if (symbol) {
        // Refresh news for specific symbol
        await NewsService.refreshNewsForSymbol(symbol);
      } else if (portfolioSymbols.length > 0) {
        // Refresh news for portfolio symbols
        await NewsService.batchRefreshNews(portfolioSymbols.slice(0, 5)); // Limit to first 5
      }
      
      // Reload news after refresh
      await loadNews();
    } catch (err) {
      console.error('Error refreshing news:', err);
      setError('Failed to refresh news');
    } finally {
      setRefreshing(false);
    }
  };

  const filteredNews = news.filter(item => {
    if (!showRecommendations || selectedFilter === 'all') return true;
    return item.recommendation?.toLowerCase() === selectedFilter;
  });

  const getRecommendationCounts = () => {
    const counts = {
      buy: news.filter(item => item.recommendation === 'BUY').length,
      sell: news.filter(item => item.recommendation === 'SELL').length,
      hold: news.filter(item => item.recommendation === 'HOLD').length
    };
    return counts;
  };

  const counts = getRecommendationCounts();

  if (loading) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <div className="flex items-center justify-center">
          <Loader className="w-6 h-6 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-600">Loading news...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <div className="flex items-center justify-center text-red-600">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>{error}</span>
        </div>
        <button
          onClick={loadNews}
          className="mt-3 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              {symbol ? `${symbol} News` : 'Investment News'}
            </h3>
            {news.length > 0 && (
              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {news.length}
              </span>
            )}
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            title="Refresh news"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Filters */}
        {showRecommendations && news.some(item => item.recommendation) && (
          <div className="flex items-center gap-2 mt-3">
            <Filter className="w-4 h-4 text-gray-400" />
            <div className="flex gap-1">
              <button
                onClick={() => setSelectedFilter('all')}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  selectedFilter === 'all'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All ({news.length})
              </button>
              {counts.buy > 0 && (
                <button
                  onClick={() => setSelectedFilter('buy')}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    selectedFilter === 'buy'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  BUY ({counts.buy})
                </button>
              )}
              {counts.hold > 0 && (
                <button
                  onClick={() => setSelectedFilter('hold')}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    selectedFilter === 'hold'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  HOLD ({counts.hold})
                </button>
              )}
              {counts.sell > 0 && (
                <button
                  onClick={() => setSelectedFilter('sell')}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    selectedFilter === 'sell'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  SELL ({counts.sell})
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* News items */}
      <div className="p-4">
        {filteredNews.length === 0 ? (
          <div className="text-center py-8">
            <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">
              {selectedFilter === 'all' 
                ? 'No news available for the selected timeframe' 
                : `No ${selectedFilter.toUpperCase()} recommendations found`
              }
            </p>
            {symbol && (
              <button
                onClick={handleRefresh}
                className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Refresh News for {symbol}
              </button>
            )}
          </div>
        ) : (
          <div className={`space-y-${layout === 'compact' ? '2' : '4'}`}>
            {filteredNews.map((newsItem) => (
              <NewsItem
                key={newsItem.id}
                news={newsItem}
                showSymbol={!symbol}
                compact={layout === 'compact'}
                onClick={() => {
                  // Could open a detailed view modal here
                  console.log('News item clicked:', newsItem.headline);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Load more button for large feeds */}
      {news.length >= maxItems && layout !== 'compact' && (
        <div className="p-4 border-t border-gray-200">
          <button
            className="w-full px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
            onClick={() => {
              // Could implement pagination here
              console.log('Load more news requested');
            }}
          >
            Load More News
          </button>
        </div>
      )}
    </div>
  );
};

export default NewsFeed;