import React, { useState, useEffect } from 'react';
import { NewsItem as NewsItemType } from '../types';
import NewsService from '../services/newsService';
import { Newspaper, TrendingUp, TrendingDown, ExternalLink, RefreshCw, AlertCircle } from 'lucide-react';

interface NewsWidgetProps {
  symbol?: string;
  maxItems?: number;
  showHeader?: boolean;
  className?: string;
  onViewAll?: () => void;
}

const NewsWidget: React.FC<NewsWidgetProps> = ({
  symbol,
  maxItems = 3,
  showHeader = true,
  className = '',
  onViewAll
}) => {
  const [news, setNews] = useState<NewsItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadNews();
  }, [symbol, maxItems]);

  const loadNews = async () => {
    try {
      setLoading(true);
      setError(null);

      if (symbol) {
        const response = await NewsService.getNewsForSymbol(symbol, maxItems, 3);
        setNews(response.news);
      } else {
        const response = await NewsService.getNewsWithRecommendations(undefined, maxItems, 3);
        setNews(response);
      }
    } catch (err) {
      console.error('Error loading news widget:', err);
      setError('Failed to load news');
    } finally {
      setLoading(false);
    }
  };

  const getRecommendationIcon = (recommendation?: string) => {
    switch (recommendation) {
      case 'BUY': return <TrendingUp className="w-3 h-3 text-green-600" />;
      case 'SELL': return <TrendingDown className="w-3 h-3 text-red-600" />;
      default: return null;
    }
  };

  const getRecommendationColor = (recommendation?: string) => {
    switch (recommendation) {
      case 'BUY': return 'text-green-600 bg-green-50';
      case 'SELL': return 'text-red-600 bg-red-50';
      case 'HOLD': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  const handleSourceClick = (url: string, e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
        {showHeader && (
          <div className="flex items-center gap-2 mb-3">
            <Newspaper className="w-4 h-4 text-gray-400" />
            <h3 className="text-sm font-medium text-gray-600">Recent News</h3>
          </div>
        )}
        <div className="flex items-center justify-center py-6">
          <RefreshCw className="w-4 h-4 animate-spin text-gray-400" />
          <span className="ml-2 text-sm text-gray-500">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
        {showHeader && (
          <div className="flex items-center gap-2 mb-3">
            <Newspaper className="w-4 h-4 text-gray-400" />
            <h3 className="text-sm font-medium text-gray-600">Recent News</h3>
          </div>
        )}
        <div className="flex items-center justify-center py-6">
          <AlertCircle className="w-4 h-4 text-red-400" />
          <span className="ml-2 text-sm text-red-600">{error}</span>
        </div>
      </div>
    );
  }

  if (news.length === 0) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
        {showHeader && (
          <div className="flex items-center gap-2 mb-3">
            <Newspaper className="w-4 h-4 text-gray-400" />
            <h3 className="text-sm font-medium text-gray-600">Recent News</h3>
          </div>
        )}
        <div className="text-center py-6">
          <p className="text-sm text-gray-500">No recent news available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {showHeader && (
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Newspaper className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-medium text-gray-900">
              {symbol ? `${symbol} News` : 'Latest News'}
            </h3>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
              {news.length}
            </span>
          </div>
          {onViewAll && (
            <button
              onClick={onViewAll}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              View All
            </button>
          )}
        </div>
      )}

      <div className="p-4 space-y-3">
        {news.map((newsItem) => (
          <div
            key={newsItem.id}
            className="group cursor-pointer"
            onClick={() => handleSourceClick(newsItem.sourceUrl, {} as React.MouseEvent)}
          >
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                {/* Symbol and recommendation */}
                <div className="flex items-center gap-2 mb-1">
                  {!symbol && (
                    <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                      {newsItem.symbol}
                    </span>
                  )}
                  {newsItem.recommendation && (
                    <div className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${getRecommendationColor(newsItem.recommendation)}`}>
                      {getRecommendationIcon(newsItem.recommendation)}
                      {newsItem.recommendation}
                      {newsItem.confidence && (
                        <span className="text-xs opacity-75">
                          {newsItem.confidence}%
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Headline */}
                <h4 className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {newsItem.headline}
                </h4>

                {/* Summary for first item or if only one item */}
                {(news.indexOf(newsItem) === 0 || news.length === 1) && newsItem.summary && (
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                    {newsItem.summary}
                  </p>
                )}

                {/* Key point for items with AI analysis */}
                {newsItem.keyPoints && newsItem.keyPoints.length > 0 && news.indexOf(newsItem) === 0 && (
                  <div className="mt-2 flex items-start gap-1">
                    <span className="w-1 h-1 bg-blue-400 rounded-full mt-1.5 flex-shrink-0"></span>
                    <p className="text-xs text-gray-600 italic">
                      {newsItem.keyPoints[0]}
                    </p>
                  </div>
                )}

                {/* Metadata */}
                <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                  <span>{newsItem.sourceName}</span>
                  <span>•</span>
                  <span>{formatTimeAgo(newsItem.publishedAt)}</span>
                  {newsItem.sentiment && (
                    <>
                      <span>•</span>
                      <span className={`font-medium ${
                        newsItem.sentiment === 'POSITIVE' ? 'text-green-600' :
                        newsItem.sentiment === 'NEGATIVE' ? 'text-red-600' :
                        'text-gray-600'
                      }`}>
                        {newsItem.sentiment}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* External link icon */}
              <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0 mt-1" />
            </div>
          </div>
        ))}
      </div>

      {/* View all footer for larger feeds */}
      {onViewAll && news.length >= maxItems && (
        <div className="p-3 border-t border-gray-100">
          <button
            onClick={onViewAll}
            className="w-full text-xs text-blue-600 hover:text-blue-800 font-medium py-1"
          >
            View All News →
          </button>
        </div>
      )}
    </div>
  );
};

export default NewsWidget;