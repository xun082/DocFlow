import React from 'react';
import { icons } from 'lucide-react';

import { Icon } from '@/components/ui/Icon';

interface BlockItemProps {
  icon: keyof typeof icons;
  label: string;
  blockType: string;
  onDragStart: (event: React.DragEvent, blockType: string) => void;
}

const BlockItem: React.FC<BlockItemProps> = ({ icon, label, blockType, onDragStart }) => {
  return (
    <div
      className="p-2 text-center bg-white border border-gray-200 rounded-lg hover:border-blue-300 cursor-pointer"
      draggable
      onDragStart={(e) => onDragStart(e, blockType)}
      data-block-type={blockType}
    >
      <Icon name={icon} className="h-5 w-5 mx-auto mb-1 text-gray-700" />
      <div className="text-xs">{label}</div>
    </div>
  );
};

const BlocksTab = () => {
  // Handle drag start event
  const handleDragStart = (event: React.DragEvent, blockType: string) => {
    // Set data for the drag event
    event.dataTransfer.setData('application/x-block-type', blockType);
    event.dataTransfer.effectAllowed = 'copy';

    // Create a custom drag image
    const dragImage = document.createElement('div');
    dragImage.className = 'drag-image';
    dragImage.textContent = blockType;
    dragImage.style.position = 'absolute';
    dragImage.style.top = '-1000px';
    document.body.appendChild(dragImage);

    event.dataTransfer.setDragImage(dragImage, 0, 0);

    // Clean up the drag image after dragging
    setTimeout(() => {
      document.body.removeChild(dragImage);
    }, 0);
  };

  return (
    <div className="p-4">
      <div className="mb-3 font-medium text-gray-700">内容区块</div>
      <div className="grid grid-cols-2 gap-2">
        <BlockItem icon="Type" label="文本" blockType="text" onDragStart={handleDragStart} />
        <BlockItem icon="Image" label="图片" blockType="image" onDragStart={handleDragStart} />
        <BlockItem icon="ListOrdered" label="列表" blockType="list" onDragStart={handleDragStart} />
        <BlockItem icon="Table" label="表格" blockType="table" onDragStart={handleDragStart} />
        <BlockItem
          icon="GitBranch"
          label="思维导图"
          blockType="mindmap"
          onDragStart={handleDragStart}
        />
        <BlockItem icon="ChartBar" label="图表" blockType="chart" onDragStart={handleDragStart} />
        <BlockItem icon="Puzzle" label="自定义" blockType="custom" onDragStart={handleDragStart} />
      </div>
    </div>
  );
};

export default BlocksTab;
