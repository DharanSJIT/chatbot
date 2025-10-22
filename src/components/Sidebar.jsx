import { useState, useEffect } from 'react';
import { Search, Plus, Trash2, X, MoreHorizontal, Edit3, Share, Check } from 'lucide-react';
import API_BASE_URL from '../config/api';

export default function Sidebar({ user, currentChatId, onChatSelect, onNewChat, darkMode, isOpen, onClose }) {
  const [chats, setChats] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredChats, setFilteredChats] = useState([]);
  const [activeMenu, setActiveMenu] = useState(null);
  const [editingChat, setEditingChat] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

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

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (activeMenu && !event.target.closest('.relative')) {
        setActiveMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeMenu]);

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

  const deleteChat = async (chatId) => {
    try {
      await fetch(`${API_BASE_URL}/api/messages/chats/${chatId}`, {
        method: 'DELETE'
      });
      setChats(chats.filter(chat => chat._id !== chatId));
      if (currentChatId === chatId) {
        onNewChat();
      }
      setShowDeleteConfirm(null);
      setActiveMenu(null);
    } catch (error) {
      console.error('Failed to delete chat:', error);
    }
  };

  const renameChat = async (chatId, newTitle) => {
    try {
      await fetch(`${API_BASE_URL}/api/messages/chats/${chatId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle })
      });
      setChats(chats.map(chat => 
        chat._id === chatId ? { ...chat, title: newTitle } : chat
      ));
      setEditingChat(null);
      setActiveMenu(null);
    } catch (error) {
      console.error('Failed to rename chat:', error);
    }
  };

  const shareChat = async (chatId) => {
    try {
      const chat = chats.find(c => c._id === chatId);
      if (navigator.share) {
        await navigator.share({
          title: chat.title,
          text: `Check out this AI conversation: ${chat.title}`,
          url: window.location.href
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        // You could show a toast here
      }
      setActiveMenu(null);
    } catch (error) {
      console.error('Failed to share chat:', error);
    }
  };

  const handleEditSubmit = (chatId) => {
    if (editTitle.trim()) {
      renameChat(chatId, editTitle.trim());
    } else {
      setEditingChat(null);
    }
  };

  const startEdit = (chat) => {
    setEditingChat(chat._id);
    setEditTitle(chat.title);
    setActiveMenu(null);
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
        <div className="px-4 pb-4" style={{ height: '50vh', overflowY: 'auto' }}>
          {filteredChats.length === 0 ? (
            <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <p className="text-sm">No chats found</p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredChats.map((chat) => (
                <div key={chat._id} className="relative">
                  <div
                    onClick={() => !editingChat && onChatSelect(chat._id)}
                    className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                      currentChatId === chat._id
                        ? darkMode ? 'bg-green-700' : 'bg-green-100'
                        : darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex-1 min-w-0 mr-2">
                      {editingChat === chat._id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') handleEditSubmit(chat._id);
                              if (e.key === 'Escape') setEditingChat(null);
                            }}
                            onBlur={() => handleEditSubmit(chat._id)}
                            className={`flex-1 text-sm bg-transparent border-b ${darkMode ? 'border-gray-500 text-white' : 'border-gray-400 text-gray-900'} focus:outline-none`}
                            autoFocus
                          />
                          <button
                            onClick={() => handleEditSubmit(chat._id)}
                            className={`p-1 rounded ${darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                          >
                            <Check size={12} className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
                          </button>
                        </div>
                      ) : (
                        <>
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
                        </>
                      )}
                    </div>
                    
                    {/* Menu Button - Always visible on mobile, hover on desktop */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenu(activeMenu === chat._id ? null : chat._id);
                      }}
                      className={`p-1.5 rounded transition-opacity opacity-100 md:opacity-0 md:group-hover:opacity-100 ${darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                    >
                      <MoreHorizontal size={16} className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
                    </button>
                  </div>
                  
                  {/* Dropdown Menu */}
                  {activeMenu === chat._id && (
                    <div className={`absolute right-0 top-full mt-1 w-48 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg shadow-lg z-50`}>
                      <button
                        onClick={() => startEdit(chat)}
                        className={`w-full px-4 py-2 text-left text-sm flex items-center gap-3 ${darkMode ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-100 text-gray-700'} transition-colors`}
                      >
                        <Edit3 size={16} />
                        <span>Rename</span>
                      </button>
                      {/* <button
                        onClick={() => shareChat(chat._id)}
                        className={`w-full px-4 py-2 text-left text-sm flex items-center gap-3 ${darkMode ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-100 text-gray-700'} transition-colors`}
                      >
                        <Share size={16} />
                        <span>Share</span>
                      </button> */}
                      <button
                        onClick={() => {
                          setShowDeleteConfirm(chat._id);
                          setActiveMenu(null);
                        }}
                        className={`w-full px-4 py-2 text-left text-sm flex items-center gap-3 ${darkMode ? 'hover:bg-gray-700 text-red-400' : 'hover:bg-gray-100 text-red-600'} transition-colors border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
                      >
                        <Trash2 size={16} />
                        <span>Delete</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Delete Confirmation Modal - Outside sidebar container */}
      {showDeleteConfirm && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-[100]"
            onClick={() => setShowDeleteConfirm(null)}
          />
          <div className="fixed inset-0 flex items-center justify-center z-[100] pointer-events-none">
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 max-w-sm mx-4 shadow-xl pointer-events-auto`}>
              <h3 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Delete chat?
              </h3>
              <p className={`text-sm mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                This will delete the conversation permanently. You cannot undo this action.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'} transition-colors`}
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteChat(showDeleteConfirm)}
                  className="flex-1 px-4 py-2 text-sm font-medium bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}