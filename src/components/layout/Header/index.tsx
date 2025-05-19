'use client';

import { Editor } from '@tiptap/core';
import { useCallback, useEffect, useState } from 'react';
import { HocuspocusProvider } from '@hocuspocus/provider';

import { Icon } from '@/components/ui/Icon';
import { Tooltip } from '@/components/ui/Tooltip';
import { cn } from '@/utils/utils';

interface CollaborationUser {
  id: string;
  name: string;
  avatar: string;
  color: string;
  isOnline: boolean;
  isSelf: boolean;
}

type HeaderProps = {
  isSidebarOpen?: boolean;
  toggleSidebar?: () => void;
  editor: Editor;
  provider?: HocuspocusProvider;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  maxUsers?: number;
  showSelf?: boolean;
  className?: string;
};

export const Header = ({
  editor,
  isSidebarOpen,
  toggleSidebar,
  provider,
  position = 'top-right',
  maxUsers = 5,
  showSelf = true,
  className,
}: HeaderProps) => {
  const toggleEditable = useCallback(() => {
    if (!editor) return;
    editor.setOptions({ editable: !editor.isEditable });
    editor.view.dispatch(editor.view.state.tr);
  }, [editor]);

  return (
    <div className="flex flex-row items-center justify-between flex-none py-2.5 px-4 sticky top-0 z-50 backdrop-blur-lg bg-white/90 border-b border-neutral-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className={`relative overflow-hidden group w-9 h-9 flex items-center justify-center rounded-lg transition-all duration-300 ${
            isSidebarOpen
              ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30'
              : 'bg-neutral-50 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-800'
          }`}
        >
          <span className="absolute inset-0 bg-gradient-to-tr from-blue-400/10 to-white/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
          <Icon
            name={isSidebarOpen ? 'PanelLeftClose' : 'PanelLeft'}
            className="w-4 h-4 relative z-10"
          />
        </button>

        <div className="flex items-center bg-neutral-50 border border-neutral-100 rounded-full h-9 p-1 shadow-[0_2px_6px_rgba(0,0,0,0.04)] relative">
          <div
            className={`absolute ${editor.isEditable ? 'left-1' : 'left-[calc(50%-2px)]'} top-1 bottom-1 w-[calc(50%-2px)] rounded-full bg-white shadow-[0_2px_5px_rgba(0,0,0,0.05)] transition-all duration-300 ease-in-out`}
          ></div>
          <button
            className={`relative z-10 rounded-full px-4 py-1.5 text-sm font-medium flex items-center transition-all duration-200 ${
              editor.isEditable ? 'text-blue-600' : 'text-neutral-400'
            }`}
            onClick={editor.isEditable ? undefined : toggleEditable}
          >
            <Icon
              name="Pen"
              className={`w-3.5 h-3.5 mr-1.5 transition-transform duration-300 ${editor.isEditable ? 'scale-110' : 'scale-100'}`}
            />
            Edit
          </button>
          <button
            className={`relative z-10 rounded-full px-4 py-1.5 text-sm font-medium flex items-center transition-all duration-200 ${
              !editor.isEditable ? 'text-blue-600' : 'text-neutral-400'
            }`}
            onClick={!editor.isEditable ? undefined : toggleEditable}
          >
            <Icon
              name="Eye"
              className={`w-3.5 h-3.5 mr-1.5 transition-transform duration-300 ${!editor.isEditable ? 'scale-110' : 'scale-100'}`}
            />
            View
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {provider && (
          <div className="relative mr-2">
            <CollaborationUsers
              provider={provider}
              maxUsers={maxUsers}
              showSelf={showSelf}
              position={position}
              className={className}
              inHeader={true}
            />
          </div>
        )}

        <button className="relative overflow-hidden group flex items-center gap-1.5 py-1.5 px-4 text-sm font-medium text-white rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30">
          <span className="absolute inset-0 bg-gradient-to-tr from-white/0 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
          <Icon name="Share2" className="w-3.5 h-3.5 relative z-10" />
          <span className="relative z-10">Share</span>
        </button>
      </div>
    </div>
  );
};

function CollaborationUsers({
  provider,
  position = 'top-right',
  maxUsers = 5,
  showSelf = true,
  className,
  inHeader = false,
}: {
  provider: HocuspocusProvider;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  maxUsers?: number;
  showSelf?: boolean;
  className?: string;
  inHeader?: boolean;
}) {
  const [users, setUsers] = useState<CollaborationUser[]>([]);
  const [showAllUsers, setShowAllUsers] = useState(false);

  useEffect(() => {
    if (!provider || !provider.awareness) return;

    const awareness = provider.awareness;

    const updateUsers = () => {
      const states = awareness.getStates();
      const currentUserClientId = awareness.clientID;

      const userList: CollaborationUser[] = [];

      states.forEach((state: any, clientId: number) => {
        if (!state.user) return;

        const { id, name, avatar, color } = state.user;
        const isSelf = clientId === currentUserClientId;

        if (!showSelf && isSelf) return;

        userList.push({
          id: id,
          name: name,
          avatar: avatar,
          color: color,
          isOnline: true,
          isSelf,
        });
      });

      userList.sort((a, b) => {
        if (a.isSelf) return -1;
        if (b.isSelf) return 1;

        return 0;
      });

      setUsers(userList);
    };

    updateUsers();

    awareness.on('change', updateUsers);

    return () => {
      awareness.off('change', updateUsers);
    };
  }, [provider, showSelf]);

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
  };

  const displayedUsers = showAllUsers ? users : users.slice(0, maxUsers);
  const hiddenUsersCount = users.length - maxUsers;

  return (
    <div
      className={cn(
        inHeader ? '' : 'fixed z-50',
        inHeader ? '' : positionClasses[position],
        className,
      )}
      onMouseEnter={() => setShowAllUsers(true)}
      onMouseLeave={() => setShowAllUsers(false)}
    >
      <div className="flex items-center space-x-1">
        <div className="flex items-center">
          {displayedUsers.map((user, index) => (
            <Tooltip
              key={user.id}
              content={
                <div className="flex items-center space-x-2 p-2">
                  <div
                    className="w-6 h-6 rounded-full bg-cover bg-center"
                    style={{ backgroundImage: `url(${user.avatar})` }}
                  />
                  <span style={{ color: user.color }}>{user.name}</span>
                  <span className="text-xs text-gray-400">{user.isSelf ? '(you)' : ''}</span>
                </div>
              }
            >
              <div
                className={cn(
                  'flex-shrink-0 w-8 h-8 rounded-full bg-cover bg-center border-2 -ml-1 first:ml-0 cursor-pointer relative',
                  user.isSelf ? 'border-blue-500' : 'border-white',
                )}
                style={{
                  backgroundImage: `url(${user.avatar})`,
                  zIndex: displayedUsers.length - index,
                  borderColor: user.isSelf ? user.color : 'white',
                }}
              >
                <div
                  className={cn(
                    'absolute bottom-0 right-0 w-2 h-2 rounded-full border border-white',
                    user.isOnline ? 'bg-green-500' : 'bg-gray-400',
                  )}
                />
              </div>
            </Tooltip>
          ))}

          {hiddenUsersCount > 0 && !showAllUsers && (
            <div
              className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 -ml-1 flex items-center justify-center text-xs font-medium cursor-pointer"
              style={{ zIndex: 0 }}
            >
              +{hiddenUsersCount}
            </div>
          )}
        </div>
      </div>

      {showAllUsers && users.length > maxUsers && (
        <div className="absolute top-full mt-2 right-0 bg-white rounded-md shadow-lg p-2 max-h-60 overflow-y-auto w-64 dark:bg-neutral-800 dark:border dark:border-neutral-700">
          <h3 className="text-sm font-semibold mb-2 px-2">All Users ({users.length})</h3>
          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-center space-x-2 p-2 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded-md"
            >
              <div
                className="w-6 h-6 rounded-full bg-cover bg-center relative"
                style={{ backgroundImage: `url(${user.avatar})` }}
              >
                <div
                  className={cn(
                    'absolute bottom-0 right-0 w-2 h-2 rounded-full border border-white',
                    user.isOnline ? 'bg-green-500' : 'bg-gray-400',
                  )}
                />
              </div>
              <span style={{ color: user.color }}>{user.name}</span>
              {user.isSelf && <span className="text-xs text-gray-400">(you)</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Header;
