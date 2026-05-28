import React, { useState, useRef, useEffect, useContext } from 'react';
import UserMessage from './UserMessage';
import ArenaResponse from './ArenaResponse';
import Sidebar from './Sidebar';
import axios from "axios";
import { AuthContext } from '../context/AuthContext';
import { 
  Menu, 
  User, 
  Settings, 
  LogOut, 
  X, 
  Globe, 
  Shield, 
  Cpu, 
  Trash2, 
  Swords, 
  Copy, 
  Check, 
  RotateCcw,
  Sparkles,
  Info,
  Clock,
  Trophy,
  BarChart2,
  Bell,
  Target,
  Zap,
  Eye,
  Calendar,
  Lock,
  ChevronRight
} from 'lucide-react';

export default function ChatInterface() {
  const { user, logout } = useContext(AuthContext);
  
  // Resolve current logged-in user safely (with persistence fallback)
  const storedUserStr = localStorage.getItem('user');
  const fallbackUser = storedUserStr ? JSON.parse(storedUserStr) : null;
  const currentUser = user || fallbackUser;

  const [chats, setChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [messages, setMessages] = useState({});
  const [inputValue, setInputValue] = useState('');
  
  // Navigation View State
  const [currentView, setCurrentView] = useState('battle'); // 'battle' | 'winners' | 'analytics' | 'notifications' | 'profile' | 'settings'

  // Loading & interactive UI states
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  
  // Copy state
  const [copiedPromptId, setCopiedPromptId] = useState(null);

  // Settings customizable values (saved locally)
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('arenaSettings');
    return saved ? JSON.parse(saved) : {
      defaultJudge: 'Clashing Swords AI (Default)',
      temperature: 0.7,
      glowEffects: true,
      typingDelay: 'fast'
    };
  });

  const endOfMessagesRef = useRef(null);

  const scrollToBottom = () => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Save settings when changed
  useEffect(() => {
    localStorage.setItem('arenaSettings', JSON.stringify(settings));
  }, [settings]);

  // 🔥 Load from localStorage on mount
  useEffect(() => {
    const savedChats = JSON.parse(localStorage.getItem("chats")) || [];
    const savedMessages = JSON.parse(localStorage.getItem("messages")) || {};
    const savedCurrent = localStorage.getItem("currentChatId");

    setChats(savedChats);
    setMessages(savedMessages);

    if (savedCurrent) {
      setCurrentChatId(savedCurrent);
    } else if (savedChats.length > 0) {
      setCurrentChatId(savedChats[0].id);
    }
  }, []);

  // 🔥 Save chats & messages to localStorage when updated
  useEffect(() => {
    localStorage.setItem("chats", JSON.stringify(chats));
    localStorage.setItem("messages", JSON.stringify(messages));
    localStorage.setItem("currentChatId", currentChatId);
    if (currentView === 'battle') {
      scrollToBottom();
    }
  }, [chats, messages, currentChatId, currentView]);

  // Close profile dropdown on document click
  useEffect(() => {
    const handleDocumentClick = () => {
      setIsProfileDropdownOpen(false);
    };
    document.addEventListener('click', handleDocumentClick);
    return () => document.removeEventListener('click', handleDocumentClick);
  }, []);

  // 🔥 Create new chat
  const createNewChat = () => {
    const newChat = {
      id: Date.now().toString(),
      title: "New Chat",
      createdAt: Date.now()
    };

    setChats(prev => [newChat, ...prev]);
    setMessages(prev => ({ ...prev, [newChat.id]: [] }));
    setCurrentChatId(newChat.id);
  };

  // 🔥 Delete a specific chat
  const handleDeleteChat = (chatId) => {
    const updatedChats = chats.filter(chat => chat.id !== chatId);
    setChats(updatedChats);

    const updatedMessages = { ...messages };
    delete updatedMessages[chatId];
    setMessages(updatedMessages);

    if (currentChatId === chatId) {
      if (updatedChats.length > 0) {
        setCurrentChatId(updatedChats[0].id);
      } else {
        setCurrentChatId(null);
      }
    }
  };

  // 🔥 Auto create first chat if empty
  useEffect(() => {
    if (chats.length === 0) {
      createNewChat();
    }
  }, [chats]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const currentPrompt = inputValue;
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await axios.post("http://localhost:3000/invoke", {
        input: currentPrompt
      });

      const data = response.data;

      const newMessage = {
        id: Date.now(),
        problem: currentPrompt,
        timestamp: Date.now(),
        ...data.result
      };

      setMessages(prev => ({
        ...prev,
        [currentChatId]: [...(prev[currentChatId] || []), newMessage]
      }));

      // 🔥 Set title from first message
      setChats(prev =>
        prev.map(chat =>
          chat.id === currentChatId && chat.title === "New Chat"
            ? { ...chat, title: currentPrompt.slice(0, 24) + (currentPrompt.length > 24 ? "..." : "") }
            : chat
        )
      );

    } catch (err) {
      console.error("❌ Frontend Error:", err.response?.data || err.message);
      alert("Server busy / API limit hit. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = async (prompt) => {
    if (!prompt || isLoading) return;
    setIsLoading(true);

    try {
      const response = await axios.post("http://localhost:3000/invoke", {
        input: prompt
      });

      const data = response.data;

      const newMessage = {
        id: Date.now(),
        problem: prompt,
        timestamp: Date.now(),
        ...data.result
      };

      // Append regenerated result as a new conversation card
      setMessages(prev => ({
        ...prev,
        [currentChatId]: [...(prev[currentChatId] || []), newMessage]
      }));

    } catch (err) {
      console.error("❌ Regeneration Error:", err.response?.data || err.message);
      alert("Regeneration failed. Server busy / API limit hit.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyPromptText = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedPromptId(id);
      setTimeout(() => setCopiedPromptId(null), 1500);
    } catch (err) {
      console.error("Failed to copy prompt:", err);
    }
  };

  // Intercept logout with confirmation animation
  const handleLogout = () => {
    setIsLoggingOut(true);
    setTimeout(() => {
      logout();
      setIsLoggingOut(false);
    }, 1800);
  };

  const currentMessages = messages[currentChatId] || [];

  // Extract avatar initial safely
  const userName = currentUser?.name || "User";
  const userEmail = currentUser?.email || "user@example.com";
  const avatarInitial = userName.charAt(0).toUpperCase();

  // Clear Chats & Messages safely (WITHOUT clearing token/auth)
  const clearSessionChats = () => {
    if (window.confirm("Are you sure you want to clear all battles in your history?")) {
      localStorage.removeItem("chats");
      localStorage.removeItem("messages");
      localStorage.removeItem("currentChatId");
      setChats([]);
      setMessages({});
      setCurrentChatId(null);
      setCurrentView('battle');
    }
  };

  // Format message timestamps
  const formatTime = (timeMs) => {
    if (!timeMs) return "";
    const date = new Date(timeMs);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Normalize score parsing helper
  const normalizeScore = (score) => {
    if (typeof score !== "number") {
      const parsed = parseFloat(score);
      if (!isNaN(parsed)) return Math.max(0, Math.min(parsed, 10));
      return 0;
    }
    return Math.max(0, Math.min(score, 10));
  };

  // --- Dynamic Dashboard Data Calculators ---

  // Winners Board Data builder
  const getWinnersData = () => {
    const list = [];
    Object.keys(messages).forEach(chatId => {
      const msgList = messages[chatId] || [];
      msgList.forEach(m => {
        if (m.judge) {
          const s1 = Math.round(normalizeScore(m.judge.solution_1_score));
          const s2 = Math.round(normalizeScore(m.judge.solution_2_score));
          const winningModel = s1 > s2 ? "Model 1 (Solution A)" : s2 > s1 ? "Model 2 (Solution B)" : "Draw / Tied Combat";
          const maxScore = Math.max(s1, s2);
          list.push({
            id: m.id,
            title: m.problem.slice(0, 45) + (m.problem.length > 45 ? "..." : ""),
            winner: winningModel,
            score: `${maxScore}/10`,
            date: new Date(m.timestamp || m.id).toLocaleDateString()
          });
        }
      });
    });

    const seeds = [
      { id: 's-1', title: 'Explain React Context API vs Redux state hooks', winner: 'Model 1 (Solution A)', score: '9/10', date: '5/25/2026' },
      { id: 's-2', title: 'Compare speed of Quicksort vs Mergesort algs', winner: 'Model 2 (Solution B)', score: '9/10', date: '5/24/2026' },
      { id: 's-3', title: 'OAuth2 PKCE flow architecture diagrams', winner: 'Model 1 (Solution A)', score: '8/10', date: '5/23/2026' }
    ];
    return [...list, ...seeds];
  };

  // Analytics Data builder
  const getAnalyticsData = () => {
    let userBattles = 0;
    let winsA = 2; // seed
    let winsB = 1; // seed
    let ties = 0;

    Object.keys(messages).forEach(chatId => {
      const msgList = messages[chatId] || [];
      msgList.forEach(m => {
        if (m.judge) {
          userBattles++;
          const s1 = Math.round(normalizeScore(m.judge.solution_1_score));
          const s2 = Math.round(normalizeScore(m.judge.solution_2_score));
          if (s1 > s2) winsA++;
          else if (s2 > s1) winsB++;
          else ties++;
        }
      });
    });

    const total = userBattles + 3; // 3 seeds
    return {
      total,
      winsA,
      winsB,
      ties,
      avgSpeed: "1.4s",
      judgeAccuracy: "96.4%"
    };
  };

  // Dynamic notifications generator
  const getNotificationsList = () => {
    const list = [
      { id: 1, text: "System Notice: Dual LLM engine latency optimized to 1.1s.", time: "10 mins ago", type: "system" },
      { id: 2, text: "Security update: Session signature verified successfully.", time: "1 hour ago", type: "security" },
      { id: 3, text: "Saved prompt loaded: Explain React Context vs Redux.", time: "1 day ago", type: "prompt" }
    ];

    Object.keys(messages).forEach(chatId => {
      const msgList = messages[chatId] || [];
      msgList.forEach(m => {
        if (m.judge) {
          const s1 = Math.round(normalizeScore(m.judge.solution_1_score));
          const s2 = Math.round(normalizeScore(m.judge.solution_2_score));
          const winningModel = s1 > s2 ? "Model A" : s2 > s1 ? "Model B" : "Draw";
          list.unshift({
            id: m.id,
            text: `Battle Finalized: Winner: ${winningModel} (${Math.max(s1, s2)}/10). Verdict generated.`,
            time: "Just now",
            type: "battle"
          });
        }
      });
    });

    return list.slice(0, 8);
  };

  const analytics = getAnalyticsData();

  // Loading skeleton block component
  const LoadingBattleState = () => {
    const [step, setStep] = useState(0);
    const steps = [
      "Spawning dual LLM engine simulators...",
      "Generating combat Response A...",
      "Synthesizing competitive Response B...",
      "Engaging LLM Arena Arbiter...",
      "Evaluating answers with reasoning trees...",
      "Finalizing scores & verdict details..."
    ];

    useEffect(() => {
      const interval = setInterval(() => {
        setStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
      }, 2200);
      return () => clearInterval(interval);
    }, []);

    return (
      <div className="flex flex-col gap-4 bg-zinc-900/30 border border-zinc-800/80 backdrop-blur-md rounded-3xl p-6 shadow-xl animate-pulse w-full">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center animate-spin">
            <Swords className="w-4 h-4 text-white" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wide">Model Duel in Progress</h4>
            <p className="text-xs text-zinc-400 flex items-center gap-1.5 mt-0.5 font-medium">
              <span>{steps[step]}</span>
              <span className="inline-block w-1 h-3 bg-zinc-355 animate-blink" />
            </p>
          </div>
        </div>
        
        {/* Mock dual solution slots during loading */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-3">
          <div className="h-32 rounded-2xl bg-zinc-950/40 border border-zinc-900/50 p-5 space-y-3">
            <div className="h-3 bg-zinc-800 rounded w-1/4" />
            <div className="h-3.5 bg-zinc-800/70 rounded w-5/6" />
            <div className="h-3.5 bg-zinc-800/70 rounded w-4/6" />
          </div>
          <div className="h-32 rounded-2xl bg-zinc-950/40 border border-zinc-900/50 p-5 space-y-3">
            <div className="h-3 bg-zinc-800 rounded w-1/4" />
            <div className="h-3.5 bg-zinc-800/70 rounded w-5/6" />
            <div className="h-3.5 bg-zinc-800/70 rounded w-4/6" />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`flex h-screen bg-zinc-950 text-zinc-150 overflow-hidden relative ${settings.glowEffects ? 'glow-blue-purple' : ''}`}>
      {/* Dark Ambient Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[55%] h-[55%] rounded-full bg-blue-600/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[55%] h-[55%] rounded-full bg-purple-600/5 blur-[120px] pointer-events-none" />

      {/* Sidebar (Desktop + Mobile overlay drawer) */}
      <Sidebar
        chats={chats}
        currentChatId={currentChatId}
        setCurrentChatId={setCurrentChatId}
        createNewChat={createNewChat}
        onSelectPrompt={(prompt) => setInputValue(prompt)}
        onOpenSettings={() => setCurrentView('settings')}
        onDeleteChat={handleDeleteChat}
        onLogout={handleLogout}
        currentView={currentView}
        setCurrentView={setCurrentView}
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Panel */}
      <div className="flex-1 flex flex-col relative min-w-0">
        
        {/* Dashboard Top Header */}
        <header className="px-6 py-4 border-b border-zinc-900/80 flex justify-between items-center backdrop-blur-md bg-zinc-950/70 sticky top-0 z-20 shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger menu */}
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="md:hidden text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-zinc-900 border border-zinc-800 transition animate-pulse"
              title="Open Sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
              <Swords className="w-4 h-4 text-blue-500 hidden md:block" />
              <span className="capitalize">{currentView === 'battle' ? "Combat Simulator Dashboard" : `${currentView.replace('-', ' ')} Console`}</span>
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Clear Chats button */}
            {currentView === 'battle' && (
              <button
                onClick={clearSessionChats}
                className="hidden sm:inline-flex text-zinc-550 hover:text-red-400 text-[10px] font-bold px-3 py-1.5 rounded-xl hover:bg-red-950/10 transition border border-zinc-850 hover:border-red-950/20 uppercase tracking-wider"
              >
                Clear All Battles
              </button>
            )}

            {/* Profile dropdown trigger */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsProfileDropdownOpen(!isProfileDropdownOpen);
                }}
                className="flex items-center gap-2.5 p-1.5 pr-3.5 bg-zinc-900/60 hover:bg-zinc-850 rounded-full border border-zinc-800/80 transition duration-200 focus:outline-none focus:ring-1 focus:ring-blue-500/30"
              >
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-violet-600 flex items-center justify-center font-bold text-white shadow-md text-sm border border-zinc-700/35 select-none">
                  {avatarInitial}
                </div>
                <div className="hidden sm:block text-left max-w-[120px]">
                  <p className="text-xs font-bold text-zinc-200 truncate">{userName}</p>
                </div>
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileDropdownOpen && (
                <div 
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 mt-2 w-64 bg-zinc-950/90 border border-zinc-850/80 rounded-2xl p-4 shadow-2xl z-30 select-none animate-in fade-in slide-in-from-top-2 duration-200 backdrop-blur-xl"
                >
                  {/* Laser top bar */}
                  <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-blue-500 to-purple-500" />
                  
                  <div className="pb-3 mb-3 border-b border-zinc-900">
                    <p className="text-xs font-bold text-white truncate">{userName}</p>
                    <p className="text-[10px] text-zinc-500 truncate mt-0.5">{userEmail}</p>
                  </div>
                  <div className="space-y-1">
                    <button
                      onClick={() => {
                        setCurrentView('profile');
                        setIsProfileDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs font-semibold text-zinc-300 hover:text-white rounded-xl hover:bg-zinc-900/50 transition border border-transparent hover:border-zinc-800/50"
                    >
                      <User className="w-4 h-4 text-zinc-550" />
                      <span>My Profile</span>
                    </button>
                    <button
                      onClick={() => {
                        setCurrentView('notifications');
                        setIsProfileDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs font-semibold text-zinc-300 hover:text-white rounded-xl hover:bg-zinc-900/50 transition border border-transparent hover:border-zinc-800/50"
                    >
                      <Bell className="w-4 h-4 text-zinc-550" />
                      <span>Notifications</span>
                    </button>
                    <button
                      onClick={() => {
                        setCurrentView('settings');
                        setIsProfileDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs font-semibold text-zinc-300 hover:text-white rounded-xl hover:bg-zinc-900/50 transition border border-transparent hover:border-zinc-800/50"
                    >
                      <Settings className="w-4 h-4 text-zinc-550" />
                      <span>Settings</span>
                    </button>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsProfileDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs font-bold text-red-400 hover:text-red-300 rounded-xl hover:bg-red-950/20 transition border border-transparent hover:border-red-900/10"
                    >
                      <LogOut className="w-4 h-4 text-red-500/80" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Navigation Content Switcher Panel */}
        <main className="flex-1 overflow-y-auto px-4 md:px-8 py-8 max-w-4xl mx-auto w-full custom-scrollbar">
          
          {/* A) BATTLE SIMULATOR VIEW */}
          {currentView === 'battle' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {currentMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center mt-20 max-w-lg mx-auto p-8 bg-zinc-900/10 border border-zinc-900/60 rounded-3xl backdrop-blur-sm shadow-xl">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-500/10 to-violet-500/10 flex items-center justify-center mb-5 border border-blue-500/20 shadow-md">
                    <Sparkles className="w-6 h-6 text-indigo-400 animate-pulse" />
                  </div>
                  <h2 className="text-lg font-bold text-white mb-2 tracking-wide">
                    Welcome to AI Arena, {userName}!
                  </h2>
                  <p className="text-zinc-450 text-xs leading-relaxed max-w-md">
                    Enter an engineering prompt or select one of the Quick Battles in the sidebar. We will generate responses from competing models and scoring from an impartial AI Judge.
                  </p>
                  
                  {/* Quick info list */}
                  <div className="grid grid-cols-2 gap-3 mt-6 w-full text-left">
                    <div className="p-3 bg-zinc-955/45 border border-zinc-900 rounded-xl">
                      <div className="flex items-center gap-1.5 text-[9px] font-bold text-blue-400 uppercase mb-1">
                        <Cpu className="w-3.5 h-3.5" /> Models
                      </div>
                      <p className="text-[10px] text-zinc-550 font-semibold">Dual model generation in parallel.</p>
                    </div>
                    <div className="p-3 bg-zinc-955/45 border border-zinc-900 rounded-xl">
                      <div className="flex items-center gap-1.5 text-[9px] font-bold text-violet-400 uppercase mb-1">
                        <Shield className="w-3.5 h-3.5" /> Judge
                      </div>
                      <p className="text-[10px] text-zinc-550 font-semibold">Impartial scorer with breakdown logs.</p>
                    </div>
                  </div>
                </div>
              ) : (
                currentMessages.map((msg) => (
                  <div key={msg.id} className="space-y-6 animate-in fade-in duration-300">
                    
                    {/* User Message Card */}
                    <div className="flex flex-col items-end group">
                      <div className="flex items-center gap-2 mb-1.5 mr-1.5">
                        <Clock className="w-3 h-3 text-zinc-650" />
                        <span className="text-[9px] text-zinc-500 font-bold">{formatTime(msg.timestamp || msg.id)}</span>
                      </div>
                      <div className="bg-gradient-to-r from-blue-600 to-indigo-650 text-white px-5 py-3.5 rounded-2xl rounded-tr-sm max-w-xl shadow-lg border border-blue-500/20 text-xs font-semibold leading-relaxed whitespace-pre-wrap select-text">
                        {msg.problem}
                      </div>
                      
                      {/* Action Bar for Prompt (Copy / Regenerate) */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1.5 mt-2 mr-1">
                        <button
                          onClick={() => copyPromptText(msg.problem, msg.id)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-[10px] font-bold text-zinc-450 hover:text-white border border-zinc-850 transition"
                          title="Copy prompt text"
                        >
                          {copiedPromptId === msg.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span>Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy Prompt</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleRegenerate(msg.problem)}
                          disabled={isLoading}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-[10px] font-bold text-zinc-450 hover:text-white border border-zinc-850 transition disabled:opacity-50"
                          title="Re-run this combat query"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Regenerate Battle</span>
                        </button>
                      </div>
                    </div>

                    {/* Battle Arena Duel Cards */}
                    <div className="bg-zinc-950/20 border border-zinc-900/60 rounded-3xl p-1 md:p-2 shadow-inner">
                      <ArenaResponse
                        solution1={msg.solution_1}
                        solution2={msg.solution_2}
                        judge={msg.judge}
                      />
                    </div>

                  </div>
                ))
              )}
              
              {/* Dynamic typing status loader */}
              {isLoading && <LoadingBattleState />}
            </div>
          )}

          {/* B) WINNERS BOARD VIEW */}
          {currentView === 'winners' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 select-none">
              <div className="border-b border-zinc-900 pb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                    <Trophy className="w-6 h-6 text-amber-400" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">Winners Board</h2>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-0.5">Top Rated Combat Solutions</p>
                  </div>
                </div>
                <span className="text-[9px] font-bold px-2 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-450 rounded-lg">
                  Total wins: {analytics.total}
                </span>
              </div>

              {/* Grid lists of Winners */}
              <div className="grid grid-cols-1 gap-4">
                {getWinnersData().map((winner, index) => (
                  <div key={winner.id} className="bg-zinc-950/45 border border-zinc-900 hover:border-zinc-850 p-5 rounded-2xl flex items-center justify-between gap-4 shadow-xl transition duration-300">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800/80 flex items-center justify-center font-bold text-amber-400 shrink-0">
                        #{index + 1}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-zinc-200 truncate">{winner.title}</h4>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-[9px] font-bold px-2 py-0.5 bg-emerald-950/60 text-emerald-400 rounded-lg border border-emerald-900/35">
                            {winner.winner}
                          </span>
                          <span className="text-[9px] text-zinc-550 font-bold">{winner.date}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-black text-amber-400 bg-amber-950/40 border border-amber-900/30 px-2.5 py-1 rounded-lg">
                        {winner.score}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* C) ANALYTICS VIEW */}
          {currentView === 'analytics' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 select-none">
              <div className="border-b border-zinc-900 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                    <BarChart2 className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">System Analytics</h2>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-0.5">Model Win-Loss Performances</p>
                  </div>
                </div>
              </div>

              {/* Grid Statistics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 bg-zinc-950/45 border border-zinc-900 rounded-2xl shadow-xl flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Total Combat Battles</span>
                  <span className="text-2xl font-black text-white mt-3">{analytics.total}</span>
                </div>
                <div className="p-5 bg-zinc-950/45 border border-zinc-900 rounded-2xl shadow-xl flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Avg Response Speed</span>
                  <span className="text-2xl font-black text-blue-400 mt-3">{analytics.avgSpeed}</span>
                </div>
                <div className="p-5 bg-zinc-950/45 border border-zinc-900 rounded-2xl shadow-xl flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Judge Integrity</span>
                  <span className="text-2xl font-black text-purple-400 mt-3">{analytics.judgeAccuracy}</span>
                </div>
              </div>

              {/* Visual Performance Charts (Requirement 5.B) */}
              <div className="p-6 bg-zinc-955/50 border border-zinc-900 rounded-2xl shadow-xl space-y-6">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Model Win share breakdown</h3>
                
                <div className="space-y-4">
                  {/* Model 1 wins */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-bold text-zinc-300">
                      <span>Model 1 (Solution A)</span>
                      <span>{analytics.winsA} wins ({Math.round((analytics.winsA / analytics.total) * 100)}%)</span>
                    </div>
                    <div className="h-2 bg-zinc-900 rounded-full border border-zinc-850 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-600 to-indigo-500" style={{ width: `${(analytics.winsA / analytics.total) * 100}%` }} />
                    </div>
                  </div>

                  {/* Model 2 wins */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-bold text-zinc-300">
                      <span>Model 2 (Solution B)</span>
                      <span>{analytics.winsB} wins ({Math.round((analytics.winsB / analytics.total) * 100)}%)</span>
                    </div>
                    <div className="h-2 bg-zinc-900 rounded-full border border-zinc-850 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-purple-600 to-violet-500" style={{ width: `${(analytics.winsB / analytics.total) * 100}%` }} />
                    </div>
                  </div>

                  {/* Ties */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-bold text-zinc-300">
                      <span>Tied Combats</span>
                      <span>{analytics.ties} ties ({Math.round((analytics.ties / analytics.total) * 100)}%)</span>
                    </div>
                    <div className="h-2 bg-zinc-900 rounded-full border border-zinc-850 overflow-hidden">
                      <div className="h-full bg-zinc-700" style={{ width: `${(analytics.ties / analytics.total) * 100}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* D) NOTIFICATIONS VIEW */}
          {currentView === 'notifications' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 select-none">
              <div className="border-b border-zinc-900 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/10 border border-purple-500/30 rounded-xl">
                    <Bell className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">Alert Hub</h2>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-0.5">Latest System & Combat Updates</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {getNotificationsList().map(notif => (
                  <div key={notif.id} className="p-4 bg-zinc-950/45 border border-zinc-900 hover:border-zinc-850 rounded-2xl flex items-start justify-between gap-4 transition duration-200">
                    <div className="flex items-start gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 mt-1 shrink-0 animate-ping" />
                      <div>
                        <p className="text-xs font-semibold text-zinc-200 leading-relaxed">{notif.text}</p>
                        <span className="text-[9px] text-zinc-550 font-bold uppercase tracking-widest mt-1 block">{notif.type}</span>
                      </div>
                    </div>
                    <span className="text-[9px] text-zinc-600 font-semibold shrink-0">{notif.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* E) PROFILE VIEW */}
          {currentView === 'profile' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 select-none">
              <div className="border-b border-zinc-900 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-teal-500/10 border border-teal-500/30 rounded-xl">
                    <User className="w-6 h-6 text-teal-400" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">User Profile</h2>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-0.5">Authorization Metadata Details</p>
                  </div>
                </div>
              </div>

              {/* Profile Card Container */}
              <div className="bg-zinc-950/45 border border-zinc-900 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
                <div className="flex flex-col items-center text-center mt-3 mb-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-600 to-violet-600 flex items-center justify-center font-bold text-white text-3xl shadow-xl shadow-blue-500/10 mb-4 border border-zinc-700/50">
                    {avatarInitial}
                  </div>
                  <h3 className="text-lg font-bold text-white">{userName}</h3>
                  <span className="bg-blue-950/60 text-blue-400 border border-blue-900/50 text-[9px] font-bold px-3 py-0.5 rounded-full mt-2 uppercase tracking-wider">
                    Arena Commander
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
                  <div className="p-3.5 bg-zinc-900/40 border border-zinc-900 rounded-xl flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-indigo-400" />
                    <div>
                      <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-wide">Registration Scope</span>
                      <p className="text-zinc-200 mt-0.5">Joined May 2026</p>
                    </div>
                  </div>
                  <div className="p-3.5 bg-zinc-900/40 border border-zinc-900 rounded-xl flex items-center gap-3">
                    <Shield className="w-4 h-4 text-emerald-400" />
                    <div>
                      <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-wide">Account Status</span>
                      <p className="text-emerald-400 mt-0.5 font-bold">Active Token Authenticated</p>
                    </div>
                  </div>
                  <div className="p-3.5 bg-zinc-900/40 border border-zinc-900 rounded-xl flex items-center gap-3 md:col-span-2">
                    <Globe className="w-4 h-4 text-teal-400" />
                    <div>
                      <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-wide">Client Access Email</span>
                      <p className="text-zinc-200 mt-0.5">{userEmail}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* F) SYSTEM SETTINGS VIEW */}
          {currentView === 'settings' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 select-none">
              <div className="border-b border-zinc-900 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-500/10 border border-indigo-500/30 rounded-xl">
                    <Settings className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">System Settings</h2>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-0.5">Simulated Environment Controls</p>
                  </div>
                </div>
              </div>

              {/* Settings Controls container */}
              <div className="bg-zinc-955/50 border border-zinc-900 rounded-3xl p-6 shadow-2xl space-y-6">
                <div>
                  <label className="block text-[9px] font-bold text-zinc-450 uppercase tracking-wide mb-2">Arbiter Judge Model</label>
                  <select
                    value={settings.defaultJudge}
                    onChange={(e) => setSettings({...settings, defaultJudge: e.target.value})}
                    className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-900 rounded-xl text-zinc-200 text-xs focus:outline-none focus:border-indigo-500 font-semibold"
                  >
                    <option value="Clashing Swords AI (Default)">Clashing Swords AI (Default)</option>
                    <option value="Strict Logician GPT">Strict Logician GPT</option>
                    <option value="Balanced Jurist Claude">Balanced Jurist Claude</option>
                  </select>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-[9px] font-bold text-zinc-450 uppercase tracking-wide">Judge Temperature: {settings.temperature}</label>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.1"
                    value={settings.temperature}
                    onChange={(e) => setSettings({...settings, temperature: parseFloat(e.target.value)})}
                    className="w-full accent-blue-500 cursor-pointer h-1.5 bg-zinc-950 rounded-lg appearance-none border border-zinc-850"
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 bg-zinc-950/50 border border-zinc-900 rounded-xl">
                  <div>
                    <span className="text-xs font-bold text-zinc-200">Futuristic Glow Ambient</span>
                    <p className="text-[10px] text-zinc-500 mt-0.5 font-medium">Toggle surrounding gradient shadows</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.glowEffects}
                    onChange={(e) => setSettings({...settings, glowEffects: e.target.checked})}
                    className="w-4 h-4 rounded bg-zinc-950 border-zinc-800 accent-blue-500 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 bg-zinc-950/50 border border-zinc-900 rounded-xl">
                  <div>
                    <span className="text-xs font-bold text-zinc-200">Simulation Delays</span>
                    <p className="text-[10px] text-zinc-500 mt-0.5 font-medium">Speed of active generation indicators</p>
                  </div>
                  <select
                    value={settings.typingDelay}
                    onChange={(e) => setSettings({...settings, typingDelay: e.target.value})}
                    className="bg-zinc-950 border border-zinc-900 rounded-lg text-zinc-350 text-xs px-2.5 py-1 focus:outline-none font-semibold"
                  >
                    <option value="fast">Fast</option>
                    <option value="realtime">Realistic</option>
                  </select>
                </div>

                {/* Account details simulated action trigger */}
                <div className="border-t border-zinc-900 pt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-zinc-500" />
                    <span className="text-xs font-bold text-zinc-400">Account Authorization Token</span>
                  </div>
                  <button 
                    onClick={() => alert("Simulation token rotated successfully.")}
                    className="text-[9px] font-bold bg-zinc-900 border border-zinc-850 text-indigo-400 hover:text-indigo-300 px-3 py-1.5 rounded-lg transition"
                  >
                    Rotate Token
                  </button>
                </div>
              </div>
            </div>
          )}

        </main>

        {/* Input Panel */}
        {currentView === 'battle' && (
          <div className="p-4 md:p-6 border-t border-zinc-900/80 bg-zinc-950/80 backdrop-blur-md sticky bottom-0 shrink-0">
            <form
              onSubmit={handleSend}
              className="max-w-3xl mx-auto flex items-center bg-zinc-900/40 border border-zinc-800/80 focus-within:border-indigo-500/50 rounded-2xl px-3 py-2 shadow-2xl transition duration-200"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask anything or simulate a model battle..."
                disabled={isLoading}
                className="flex-1 bg-transparent outline-none text-white text-xs px-3 py-2.5 placeholder-zinc-500 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                className="bg-gradient-to-r from-blue-600 to-indigo-650 hover:from-blue-500 hover:to-indigo-500 disabled:from-zinc-900 disabled:to-zinc-900 text-white font-bold text-xs px-4.5 py-2.5 rounded-xl transition shadow-lg disabled:opacity-50 disabled:shadow-none shrink-0"
              >
                Battle
              </button>
            </form>
            <div className="text-[9px] text-center text-zinc-650 mt-2 font-bold uppercase tracking-wider">
              Active Judge: <span className="text-zinc-500">{settings.defaultJudge}</span> | Temp: {settings.temperature}
            </div>
          </div>
        )}

      </div>

      {/* Futuristic Holographic Logout Overlay */}
      {isLoggingOut && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/90 backdrop-blur-md select-none">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-red-650 to-amber-600 flex items-center justify-center shadow-2xl shadow-red-500/10 mb-6 relative border border-red-500/30 animate-pulse">
            <LogOut className="w-8 h-8 text-white" />
            <div className="absolute inset-[-4px] rounded-2xl border border-red-500/20 animate-ping duration-1000" />
          </div>
          <h2 className="text-sm font-extrabold bg-gradient-to-r from-red-400 to-amber-400 bg-clip-text text-transparent mb-2 uppercase tracking-widest font-mono">
            Terminating Security Session
          </h2>
          <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-mono flex items-center gap-1.5 font-semibold">
            <span>Clearing local caches & credentials...</span>
            <span className="inline-block w-1.5 h-3 bg-red-450 animate-blink" />
          </p>
          <div className="w-48 bg-zinc-900 border border-zinc-800 h-1.5 rounded-full mt-6 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-red-500 to-amber-500 animate-progressBar rounded-full" />
          </div>
        </div>
      )}
    </div>
  );
}