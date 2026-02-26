'use client';

interface TabsProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  favoritesCount?: number;
}

export default function Tabs({ activeTab = 'all', onTabChange = () => {}, favoritesCount = 0 }: TabsProps) {
  return (
    <div className="flex gap-8 border-b border-gray-900 py-4">
      <button
        onClick={() => onTabChange('favorites')}
        className={`text-sm font-medium transition pb-2 border-b-2 flex items-center gap-2 ${
          activeTab === 'favorites'
            ? 'text-white border-b-white'
            : 'text-gray-400 border-b-transparent hover:text-gray-300'
        }`}
      >

        Favorites
        {favoritesCount > 0 && (
          <span className="bg-yellow-500/20 text-yellow-400 text-xs px-2 py-0.5 rounded-full">
            {favoritesCount}
          </span>
        )}
      </button>
      <button
        onClick={() => onTabChange('all')}
        className={`text-sm font-medium transition pb-2 border-b-2 ${
          activeTab === 'all'
            ? 'text-white border-b-white'
            : 'text-gray-400 border-b-transparent hover:text-gray-300'
        }`}
      >

        All cryptos
      </button>
    </div>
  );
}
