const TemplatesTab = () => {
  return (
    <div className="p-4">
      <div className="mb-3 font-medium text-gray-700">文档模板</div>
      <div className="space-y-2">
        <div className="p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 cursor-pointer">
          <div className="text-sm font-medium">空白文档</div>
          <div className="text-xs text-gray-500 mt-1">从零开始创建内容</div>
        </div>
        <div className="p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 cursor-pointer">
          <div className="text-sm font-medium">会议记录</div>
          <div className="text-xs text-gray-500 mt-1">包含标题、议程和决策点</div>
        </div>
        <div className="p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 cursor-pointer">
          <div className="text-sm font-medium">知识库</div>
          <div className="text-xs text-gray-500 mt-1">结构化的文档组织</div>
        </div>
      </div>
    </div>
  );
};

export default TemplatesTab;
