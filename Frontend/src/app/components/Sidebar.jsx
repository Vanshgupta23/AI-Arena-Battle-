import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { 
  Plus, 
  Swords, 
  MessageSquare, 
  Trash2, 
  Settings, 
  LogOut, 
  Sparkles, 
  X,
  BookOpen,
  Trophy,
  BarChart2,
  Bell,
  User
} from "lucide-react";

export default function Sidebar({ 
  chats, 
  currentChatId, 
  setCurrentChatId, 
  createNewChat, 
  onSelectPrompt, 
  onOpenSettings, 
  onDeleteChat,
  onLogout,
  currentView,
  setCurrentView,
  isOpen,
  onClose
}) {
  const { logout: contextLogout } = useContext(AuthContext);

  const handleLogoutClick = () => {
    if (onClose) onClose();
    if (onLogout) {
      onLogout();
    } else {
      contextLogout();
    }
  };

  const handleNavClick = (view) => {
    setCurrentView(view);
    if (onClose) onClose();
  };

  const savedPromptsList = [
    { label: "Redux vs Context API", prompt: "Explain the differences between Redux and React Context API. When should I use which?" },
    { label: "Fastest Sorting Algorithm", prompt: "What is the fastest sorting algorithm in practice? Explain average and worst-case complexities." },
    { label: "SQL joins vs subqueries", prompt: "Compare SQL joins and subqueries in terms of readability, performance, and use cases." },
    { label: "TS Interface vs Type", prompt: "What is the difference between an interface and a type alias in TypeScript? Provide examples." }
  ];

  const sidebarContent = (
    <div className="flex-1 flex flex-col h-full bg-zinc-950/80 backdrop-blur-xl border-r border-zinc-900/60 p-4 justify-between relative shadow-[10px_0_30px_rgba(0,0,0,0.3)] select-none">
      {/* Laser Gradient Accent Side */}
      <div className="absolute right-0 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-blue-500/25 to-purple-500/25" />

      {/* Mobile Close Button */}
      {onClose && (
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 md:hidden text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-zinc-900 border border-zinc-800 transition"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      <div className="flex-1 flex flex-col min-h-0">
        {/* Logo */}
        <div className="flex items-center gap-3 px-2 py-3 mb-4 select-none shrink-0 cursor-pointer" onClick={() => handleNavClick('battle')}>
          <div className="p-2 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-lg shadow-blue-500/10">
            <Swords className="w-5.5 h-5.5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              AiArena<span className="text-blue-500 font-extrabold">Battle</span>
            </h1>
            <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Model Combat Simulator</p>
          </div>
        </div>

        {/* New Battle Button */}
        <button
          onClick={() => {
            createNewChat();
            handleNavClick('battle');
          }}
          className="w-full flex items-center justify-center gap-2 mb-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 transition-all duration-300 p-2.5 rounded-xl text-white text-xs font-bold shadow-lg shadow-blue-500/20 hover:shadow-indigo-500/30 hover:scale-[1.01] active:scale-95 group shrink-0"
        >
          <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
          <span>New Battle</span>
        </button>

        {/* Scrollable Navigation Sections */}
        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-1">
          {/* Main Navigation Links */}
          <div className="space-y-0.5">
            <button
              onClick={() => handleNavClick('winners')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                currentView === 'winners'
                  ? "bg-zinc-900 border-zinc-800 text-white shadow-md"
                  : "border-transparent text-zinc-400 hover:bg-zinc-900/40 hover:text-zinc-200"
              }`}
            >
              <Trophy className={`w-4 h-4 ${currentView === 'winners' ? 'text-amber-400' : 'text-zinc-500'}`} />
              <span>Winners Board</span>
            </button>
            <button
              onClick={() => handleNavClick('analytics')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                currentView === 'analytics'
                  ? "bg-zinc-900 border-zinc-800 text-white shadow-md"
                  : "border-transparent text-zinc-400 hover:bg-zinc-900/40 hover:text-zinc-200"
              }`}
            >
              <BarChart2 className={`w-4 h-4 ${currentView === 'analytics' ? 'text-blue-400' : 'text-zinc-500'}`} />
              <span>Analytics</span>
            </button>
            <button
              onClick={() => handleNavClick('notifications')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                currentView === 'notifications'
                  ? "bg-zinc-900 border-zinc-800 text-white shadow-md"
                  : "border-transparent text-zinc-400 hover:bg-zinc-900/40 hover:text-zinc-200"
              }`}
            >
              <div className="relative">
                <Bell className={`w-4 h-4 ${currentView === 'notifications' ? 'text-purple-400' : 'text-zinc-500'}`} />
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-indigo-500 rounded-full" />
              </div>
              <span>Notifications</span>
            </button>
            <button
              onClick={() => handleNavClick('profile')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                currentView === 'profile'
                  ? "bg-zinc-900 border-zinc-800 text-white shadow-md"
                  : "border-transparent text-zinc-400 hover:bg-zinc-900/40 hover:text-zinc-200"
              }`}
            >
              <User className={`w-4 h-4 ${currentView === 'profile' ? 'text-teal-400' : 'text-zinc-500'}`} />
              <span>Profile</span>
            </button>
          </div>

          {/* Battle History Section */}
          <div>
            <div className="flex items-center justify-between text-[9px] font-bold text-zinc-500 uppercase tracking-widest px-2 mb-2">
              <span>Battle History</span>
              <span className="bg-zinc-900 border border-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded text-[8px]">{chats.length}</span>
            </div>
            <div className="space-y-0.5">
              {chats.length === 0 ? (
                <p className="text-[11px] text-zinc-650 px-2 italic py-1">No past battles yet</p>
              ) : (
                chats.map(chat => (
                  <div
                    key={chat.id}
                    onClick={() => {
                      setCurrentChatId(chat.id);
                      handleNavClick('battle');
                    }}
                    className={`group flex items-center justify-between p-2 rounded-xl cursor-pointer transition-all duration-200 border ${
                      chat.id === currentChatId && currentView === 'battle'
                        ? "bg-zinc-900 border-zinc-800 text-white shadow-md"
                        : "border-transparent text-zinc-450 hover:bg-zinc-900/20 hover:text-zinc-200"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${chat.id === currentChatId && currentView === 'battle' ? "text-blue-400" : "text-zinc-650"}`} />
                      <p className="truncate text-[11px] font-semibold">{chat.title || "Untitled Battle"}</p>
                    </div>
                    {onDeleteChat && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteChat(chat.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-zinc-500 hover:text-red-400 hover:bg-zinc-850 transition-all duration-200"
                        title="Delete battle"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Saved Prompts Section */}
          <div>
            <div className="flex items-center gap-1.5 text-[9px] font-bold text-zinc-500 uppercase tracking-widest px-2 mb-2">
              <Sparkles className="w-3 h-3 text-purple-400" />
              <span>Saved Prompts</span>
            </div>
            <div className="space-y-0.5">
              {savedPromptsList.map((item, index) => (
                <button
                  key={index}
                  onClick={() => {
                    onSelectPrompt(item.prompt);
                    handleNavClick('battle');
                  }}
                  className="w-full flex items-center gap-2.5 p-2 rounded-xl text-left text-[11px] text-zinc-450 hover:text-zinc-200 hover:bg-zinc-900/25 border border-transparent hover:border-zinc-850 transition-all"
                >
                  <BookOpen className="w-3.5 h-3.5 text-zinc-700 shrink-0" />
                  <span className="truncate font-semibold">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="border-t border-zinc-900/80 pt-3 mt-3 space-y-0.5 shrink-0">
        <button
          onClick={() => handleNavClick('settings')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
            currentView === 'settings'
              ? "bg-zinc-900 border-zinc-800 text-white shadow-md"
              : "border-transparent text-zinc-400 hover:bg-zinc-900/40 hover:text-zinc-200"
          }`}
        >
          <Settings className="w-4 h-4 text-zinc-500" />
          <span>System Settings</span>
        </button>
        <button
          onClick={handleLogoutClick}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-red-400/80 hover:text-red-400 hover:bg-red-950/20 border border-transparent hover:border-red-900/20 transition-all"
        >
          <LogOut className="w-4 h-4 text-red-500/70" />
          <span>Terminates Session</span>
        </button>
        <div className="text-[8px] text-zinc-650 text-center pt-2 select-none font-bold uppercase tracking-wider">
          AI Arena Battle v1.2.0
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-72 h-full flex-col relative z-20 shrink-0">
        {sidebarContent}
      </div>

      {/* Mobile Drawer Sidebar */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Overlay */}
          <div 
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          />
          {/* Drawer Panel */}
          <div className="relative flex flex-col w-72 max-w-xs h-full bg-zinc-950 shadow-2xl animate-in slide-in-from-left duration-300">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}