import { useState, useEffect } from 'react';
import { Search, Plus, Trash2, X } from 'lucide-react';
import API_BASE_URL from '../config/api';

export default function Sidebar({ user, currentChatId, onChatSelect, onNewChat, darkMode, isOpen, onClose }) {
  const [chats, setChats] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredChats, setFilteredChats] = useState([]);

  // Refresh chats when sidebar opens
  useEffect(() => {
    if (user && isOpen) {
      loadChats();
    }
  }, [user, isOpen]);

  useEffect(() => {
    if (user) {
      loadChats();
    }
  }, [user]);

  // Expose refresh function
  useEffect(() => {
    window.refreshSidebar = loadChats;
    return () => {
      delete window.refreshSidebar;
    };
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      setFilteredChats(chats.filter(chat => 
        chat.title.toLowerCase().includes(searchQuery.toLowerCase())
      ));
    } else {
      setFilteredChats(chats);
    }
  }, [searchQuery, chats]);

  const loadChats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/messages/chats/${user.userId}`);
      if (response.ok) {
        const chatList = await response.json();
        setChats(chatList);
      }
    } catch (error) {
      console.error('Failed to load chats:', error);
    }
  };

  const deleteChat = async (chatId, e) => {
    e.stopPropagation();
    if (confirm('Delete this chat?')) {
      try {
        await fetch(`${API_BASE_URL}/api/messages/chats/${chatId}`, {
          method: 'DELETE'
        });
        setChats(chats.filter(chat => chat._id !== chatId));
        if (currentChatId === chatId) {
          onNewChat();
        }
      } catch (error) {
        console.error('Failed to delete chat:', error);
      }
    }
  };

  if (!user) return null;

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full w-80 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-r transform transition-transform z-50 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* Header */}
        <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
          <h2 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Chat History</h2>
          <button
            onClick={onClose}
            className={`p-1 rounded ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            title="Close Sidebar"
          >
            <X size={20} className={darkMode ? 'text-gray-400' : 'text-gray-600'} />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-4">
          <button
            onClick={onNewChat}
            className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 border-dashed transition-colors ${darkMode ? 'border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white' : 'border-gray-300 hover:border-gray-400 text-gray-600 hover:text-gray-900'}`}
          >
            <Plus size={20} />
            <span>New Chat</span>
          </button>
        </div>

        {/* Search */}
        <div className="px-4 pb-4">
          <div className="relative">
            <Search size={16} className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            <input
              type="text"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-green-500`}
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {filteredChats.length === 0 ? (
            <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <p className="text-sm">No chats found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredChats.map((chat) => (
                <div
                  key={chat._id}
                  onClick={() => onChatSelect(chat._id)}
                  className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                    currentChatId === chat._id
                      ? darkMode ? 'bg-green-700' : 'bg-green-100'
                      : darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${
                      currentChatId === chat._id
                        ? darkMode ? 'text-white' : 'text-green-800'
                        : darkMode ? 'text-gray-200' : 'text-gray-900'
                    }`}>
                      {chat.title}
                    </p>
                    <p className={`text-xs truncate ${
                      currentChatId === chat._id
                        ? darkMode ? 'text-green-200' : 'text-green-600'
                        : darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {new Date(chat.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={(e) => deleteChat(chat._id, e)}
                    className={`opacity-0 group-hover:opacity-100 p-1 rounded transition-opacity ${darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                  >
                    <Trash2 size={14} className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}