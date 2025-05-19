import React, { useState, useRef, useEffect } from 'react';
import { NodeViewProps, NodeViewWrapper } from '@tiptap/react';

export const CustomBlockView: React.FC<NodeViewProps> = (props) => {
  const { node, updateAttributes, editor } = props;
  const [editing, setEditing] = useState(!node.attrs.title && !node.attrs.description);
  const [title, setTitle] = useState(node.attrs.title || '');
  const [description, setDescription] = useState(node.attrs.description || '');
  const [hovered, setHovered] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const [prevTitle, setPrevTitle] = useState(title);
  const [prevDesc, setPrevDesc] = useState(description);

  useEffect(() => {
    if (editing && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [editing]);

  const handleSave = () => {
    updateAttributes({ title, description });
    setPrevTitle(title);
    setPrevDesc(description);
    setEditing(false);
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const handleCancel = () => {
    setTitle(prevTitle);
    setDescription(prevDesc);
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  return (
    <NodeViewWrapper
      className={`custom-block transition-shadow border border-blue-200 rounded-xl p-5 bg-white my-4 shadow-sm hover:shadow-lg relative group`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {editing ? (
        <div>
          <input
            ref={titleInputRef}
            className="block w-full mb-3 p-2 border border-blue-200 rounded-lg text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-400"
            placeholder="请输入标题..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={50}
          />
          <textarea
            className="block w-full mb-3 p-2 border border-blue-200 rounded-lg min-h-[60px] focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-400"
            placeholder="请输入描述..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={200}
          />
          <div className="flex gap-2">
            <button
              className="px-4 py-1.5 bg-blue-500 text-white rounded-lg font-medium shadow hover:bg-blue-600 transition-colors"
              onClick={handleSave}
            >
              保存
            </button>
            <button
              className="px-4 py-1.5 bg-gray-200 text-gray-700 rounded-lg font-medium shadow hover:bg-gray-300 transition-colors"
              onClick={handleCancel}
            >
              取消
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="font-bold text-blue-700 text-lg mb-1">
            {title || <span className="text-gray-400">（无标题）</span>}
          </div>
          <div className="text-blue-900 mb-2 whitespace-pre-line min-h-[24px]">
            {description || <span className="text-gray-300">（无描述）</span>}
          </div>
          {editor?.isEditable && (
            <button
              className={`absolute top-3 right-3 px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded-lg shadow hover:bg-blue-100 hover:text-blue-700 transition-opacity duration-200 ${hovered ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
              onClick={handleEdit}
              tabIndex={-1}
            >
              编辑
            </button>
          )}
        </div>
      )}
    </NodeViewWrapper>
  );
};
