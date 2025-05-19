import { Icon } from '@/components/ui/Icon';

interface SearchTabProps {
  isActive: boolean;
}

const SearchTab = ({ isActive }: SearchTabProps) => {
  return (
    <div className="p-4 space-y-4">
      <div className="relative">
        <input
          type="text"
          className="w-full bg-white border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg py-2 pl-9 pr-3 text-sm"
          placeholder="搜索文档..."
          autoFocus={isActive}
        />
        <Icon name="Search" className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
      </div>
      <div className="text-sm text-gray-500">输入关键词搜索文档内容</div>
    </div>
  );
};

export default SearchTab;
