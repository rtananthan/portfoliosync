import React from 'react';
import { NewsItem as NewsItemType } from '../types';
import { ExternalLink, TrendingUp, TrendingDown, Minus, Clock, Tag } from 'lucide-react';

interface NewsItemProps {
  news: NewsItemType;
  showSymbol?: boolean;
  compact?: boolean;
  onClick?: () => void;
}

const NewsItem: React.FC<NewsItemProps> = ({ 
  news, 
  showSymbol = true, 
  compact = false, 
  onClick 
}) => {
  const getRecommendationColor = (recommendation?: string) => {
    switch (recommendation) {
      case 'BUY': return 'text-green-600 bg-green-50';
      case 'SELL': return 'text-red-600 bg-red-50';
      case 'HOLD': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getRecommendationIcon = (recommendation?: string) => {
    switch (recommendation) {
      case 'BUY': return <TrendingUp className="w-3 h-3" />;
      case 'SELL': return <TrendingDown className="w-3 h-3" />;
      case 'HOLD': return <Minus className="w-3 h-3" />;
      default: return null;
    }
  };

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case 'POSITIVE': return 'text-green-600';
      case 'NEGATIVE': return 'text-red-600';
      case 'NEUTRAL': return 'text-gray-600';
      default: return 'text-gray-400';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays}d ago`;
    } else if (diffHours > 0) {
      return `${diffHours}h ago`;
    } else {
      return 'Just now';
    }
  };

  const handleSourceClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(news.sourceUrl, '_blank', 'noopener,noreferrer');
  };

  if (compact) {
    return (
      <div 
        className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
        onClick={onClick}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {showSymbol && (
                <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                  {news.symbol}
                </span>
              )}
              {news.recommendation && (
                <div className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${getRecommendationColor(news.recommendation)}`}>
                  {getRecommendationIcon(news.recommendation)}
                  {news.recommendation}
                  {news.confidence && <span className="ml-1">({news.confidence}%)</span>}
                </div>
              )}
            </div>
            <h4 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
              {news.headline}
            </h4>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>{news.sourceName}</span>
              <span>•</span>
              <span>{formatTimeAgo(news.publishedAt)}</span>
            </div>
          </div>
          <button
            onClick={handleSourceClick}
            className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 transition-colors"
            title="View full article"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      {/* Header with symbol and recommendation */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {showSymbol && (
            <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              {news.symbol}
            </span>
          )}
          {news.recommendation && (
            <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getRecommendationColor(news.recommendation)}`}>
              {getRecommendationIcon(news.recommendation)}
              {news.recommendation}
              {news.confidence && (
                <span className="ml-1 text-xs">
                  {news.confidence}% confidence
                </span>
              )}
            </div>
          )}
        </div>
        <button
          onClick={handleSourceClick}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
          title="View full article"
        >
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>

      {/* Headline */}
      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
        {news.headline}
      </h3>

      {/* Summary */}
      <p className="text-gray-600 mb-3 line-clamp-3">
        {news.summary}
      </p>

      {/* AI Insights */}
      {news.keyPoints && news.keyPoints.length > 0 && (
        <div className="mb-3">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Key Investment Points:</h4>
          <ul className="space-y-1">
            {news.keyPoints.slice(0, 3).map((point, index) => (
              <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                <span className="w-1 h-1 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Sentiment and metadata */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-gray-500">
            <Clock className="w-4 h-4" />
            <span>{formatTimeAgo(news.publishedAt)}</span>
          </div>
          <span className="text-gray-400">•</span>
          <span className="text-gray-500">{news.sourceName}</span>
          {news.sentiment && (
            <>
              <span className="text-gray-400">•</span>
              <span className={`font-medium ${getSentimentColor(news.sentiment)}`}>
                {news.sentiment}
              </span>
            </>
          )}
        </div>

        {/* Tags */}
        {news.tags && news.tags.length > 0 && (
          <div className="flex items-center gap-1">
            <Tag className="w-3 h-3 text-gray-400" />
            <span className="text-xs text-gray-500">
              {news.tags.slice(0, 2).join(', ')}
              {news.tags.length > 2 && '...'}
            </span>
          </div>
        )}
      </div>

      {/* Price target if available */}
      {news.priceTarget && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">AI Price Target:</span>
            <span className="text-sm font-semibold text-gray-900">
              ${news.priceTarget.toFixed(2)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsItem;