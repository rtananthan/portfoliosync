import React from 'react';
import { NewsItem as NewsItemType } from '../types';
import { Newspaper, TrendingUp, TrendingDown, ExternalLink } from 'lucide-react';

// Mock data to demonstrate the news widget functionality
const mockNewsData: NewsItemType[] = [
  {
    id: '1',
    symbol: 'AAPL',
    headline: 'Apple Shows Strong Q4 Performance with Record Revenue',
    summary: 'Apple reported record quarterly revenue of $119.6 billion, beating analyst expectations. iPhone sales remained robust despite market challenges.',
    sourceUrl: 'https://example.com/apple-earnings',
    sourceName: 'Financial Times',
    publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    recommendation: 'BUY',
    confidence: 87,
    sentiment: 'POSITIVE',
    keyPoints: [
      'Record quarterly revenue exceeds expectations',
      'iPhone sales momentum continues strong',
      'Services revenue shows steady growth',
      'Strong cash position supports future investments'
    ],
    reasoning: 'Analysis based on positive sentiment indicators and strong financial metrics',
    assetType: 'stock',
    status: 'analyzed',
    tags: ['earnings', 'revenue', 'quarterly-results'],
    analysisMethod: 'mock_bedrock_agent',
    modelVersion: 'mock-v1.0'
  },
  {
    id: '2',
    symbol: 'TSLA',
    headline: 'Tesla Faces Production Challenges in Shanghai Factory',
    summary: 'Tesla temporarily reduced production at its Shanghai facility due to supply chain constraints, impacting Q4 delivery targets.',
    sourceUrl: 'https://example.com/tesla-production',
    sourceName: 'Reuters',
    publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    recommendation: 'HOLD',
    confidence: 72,
    sentiment: 'NEGATIVE',
    keyPoints: [
      'Short-term production constraints identified',
      'Supply chain issues affecting delivery timeline',
      'Management expects resolution by Q1 2025'
    ],
    reasoning: 'Analysis based on temporary operational challenges with expected recovery',
    assetType: 'stock',
    status: 'analyzed',
    tags: ['production', 'supply-chain', 'operations'],
    analysisMethod: 'mock_bedrock_agent',
    modelVersion: 'mock-v1.0'
  },
  {
    id: '3',
    symbol: 'MSFT',
    headline: 'Microsoft Azure Cloud Revenue Surges 35% Year-over-Year',
    summary: 'Microsoft Azure continues to capture market share with 35% revenue growth, driven by AI services and enterprise migration to cloud.',
    sourceUrl: 'https://example.com/msft-azure',
    sourceName: 'TechCrunch',
    publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    recommendation: 'BUY',
    confidence: 91,
    sentiment: 'POSITIVE',
    keyPoints: [
      'Azure revenue growth exceeds market expectations',
      'AI services driving significant adoption',
      'Enterprise cloud migration trend continues',
      'Strong competitive position vs AWS'
    ],
    reasoning: 'Analysis based on strong growth metrics and market positioning',
    assetType: 'stock',
    status: 'analyzed',
    tags: ['cloud', 'revenue-growth', 'ai-services'],
    analysisMethod: 'mock_bedrock_agent',
    modelVersion: 'mock-v1.0'
  },
  {
    id: '4',
    symbol: 'VTI',
    headline: 'Vanguard Total Stock Market ETF Reaches New All-Time High',
    summary: 'VTI reached a new record high as broad market sentiment remains positive heading into the new year.',
    sourceUrl: 'https://example.com/vti-high',
    sourceName: 'MarketWatch',
    publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
    recommendation: 'HOLD',
    confidence: 78,
    sentiment: 'POSITIVE',
    keyPoints: [
      'Broad market index hitting new highs',
      'Diversified exposure remains attractive',
      'Low expense ratio continues to appeal to investors'
    ],
    reasoning: 'Analysis based on broad market strength and ETF fundamentals',
    assetType: 'etf',
    status: 'analyzed',
    tags: ['all-time-high', 'broad-market', 'etf'],
    analysisMethod: 'mock_bedrock_agent',
    modelVersion: 'mock-v1.0'
  },
  {
    id: '5',
    symbol: 'NVDA',
    headline: 'NVIDIA Announces Next-Gen AI Chip Architecture',
    summary: 'NVIDIA unveiled its next-generation AI chip architecture, promising 50% performance improvements for data center applications.',
    sourceUrl: 'https://example.com/nvidia-chip',
    sourceName: 'The Verge',
    publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
    recommendation: 'BUY',
    confidence: 93,
    sentiment: 'POSITIVE',
    keyPoints: [
      'Breakthrough AI chip architecture unveiled',
      '50% performance improvement over current generation',
      'Strong demand expected from data center customers',
      'Competitive moat in AI hardware strengthened'
    ],
    reasoning: 'Analysis based on technological advancement and market leadership',
    assetType: 'stock',
    status: 'analyzed',
    tags: ['ai-chips', 'innovation', 'data-center'],
    analysisMethod: 'mock_bedrock_agent',
    modelVersion: 'mock-v1.0'
  }
];

interface NewsWidgetDemoProps {
  maxItems?: number;
  showHeader?: boolean;
  className?: string;
}

const NewsWidgetDemo: React.FC<NewsWidgetDemoProps> = ({
  maxItems = 5,
  showHeader = true,
  className = ''
}) => {
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

  const newsToShow = mockNewsData.slice(0, maxItems);

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {showHeader && (
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Newspaper className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-medium text-gray-900">
              Latest Investment News
            </h3>
            <span className="text-xs text-gray-500 bg-blue-50 px-2 py-0.5 rounded">
              Demo Mode
            </span>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
              {newsToShow.length}
            </span>
          </div>
        </div>
      )}

      <div className="p-4 space-y-3">
        {newsToShow.map((newsItem) => (
          <div
            key={newsItem.id}
            className="group cursor-pointer"
            onClick={() => handleSourceClick(newsItem.sourceUrl, {} as React.MouseEvent)}
          >
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                {/* Symbol and recommendation */}
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                    {newsItem.symbol}
                  </span>
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

                {/* Summary for first item */}
                {newsToShow.indexOf(newsItem) === 0 && newsItem.summary && (
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                    {newsItem.summary}
                  </p>
                )}

                {/* Key point for first item */}
                {newsItem.keyPoints && newsItem.keyPoints.length > 0 && newsToShow.indexOf(newsItem) === 0 && (
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

      {/* Demo notice */}
      <div className="p-3 border-t border-gray-100 bg-blue-50">
        <p className="text-xs text-blue-700 text-center">
          🤖 <strong>Demo Mode:</strong> This shows how AI-powered news analysis will look when live APIs are connected
        </p>
      </div>
    </div>
  );
};

export default NewsWidgetDemo;