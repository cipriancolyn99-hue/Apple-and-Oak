import { useState, useRef, useEffect } from 'react';
import { useDesktopStore } from '@/hooks/useDesktopStore';
import { Send, Users, MessageCircle, Heart } from 'lucide-react';
import { format } from 'date-fns';

interface ChatWindowProps {
  room: 'mothers' | 'fathers' | 'public';
}

const roomConfig = {
  mothers: {
    title: 'Live Chat - Mothers',
    icon: <Heart className="w-5 h-5 text-rose-400" />,
    color: 'rose',
    welcome: 'Welcome to the Mothers\' chat room. This is a safe space to share, support, and connect with other mothers.',
  },
  fathers: {
    title: 'Live Chat - Fathers',
    icon: <MessageCircle className="w-5 h-5 text-sky-400" />,
    color: 'sky',
    welcome: 'Welcome to the Fathers\' chat room. A supportive space for dads to connect and share experiences.',
  },
  public: {
    title: 'Public Live Chat',
    icon: <Users className="w-5 h-5 text-teal-400" />,
    color: 'teal',
    welcome: 'Welcome to the public chat. Everyone is welcome here! Please be kind and respectful.',
  },
};

export function ChatWindow({ room }: ChatWindowProps) {
  const { messages, sendMessage, usersOnline, visitorAccount } = useDesktopStore();
  const [input, setInput] = useState('');
  const [userName, setUserName] = useState('');
  const [hasJoined, setHasJoined] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const config = roomConfig[room];

  const roomMessages = messages.filter(m => m.room === room);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [roomMessages]);

  // Auto-join if visitor is logged in
  useEffect(() => {
    if (visitorAccount && !hasJoined) {
      setUserName(visitorAccount.name);
      setHasJoined(true);
    }
  }, [visitorAccount, hasJoined]);

  const handleJoin = () => {
    const name = visitorAccount?.name || userName;
    if (name.trim()) {
      setUserName(name);
      setHasJoined(true);
      sendMessage(room, `joined the chat.`, name);
    }
  };

  const handleSend = () => {
    if (input.trim() && hasJoined) {
      sendMessage(room, input.trim(), userName);
      setInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!hasJoined) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6">
        <div className="bg-white/5 rounded-2xl p-8 border border-white/10 max-w-sm w-full text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center mx-auto mb-4">
            {config.icon}
          </div>
          <h3 className="text-white font-bold text-lg mb-2">{config.title}</h3>
          <p className="text-white/60 text-sm mb-6">{config.welcome}</p>
          <div className="flex items-center gap-2 mb-4 text-white/50 text-sm">
            <Users className="w-4 h-4" />
            <span>{usersOnline} people online</span>
          </div>
          {visitorAccount ? (
            <button
              onClick={handleJoin}
              className="w-full bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-500 hover:to-teal-600 text-white font-semibold py-2.5 rounded-lg transition-all"
            >
              Join as {visitorAccount.name}
            </button>
          ) : (
            <>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter your name..."
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:border-teal-400 transition-colors mb-4"
                onKeyPress={(e) => e.key === 'Enter' && handleJoin()}
              />
              <button
                onClick={handleJoin}
                className="w-full bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-500 hover:to-teal-600 text-white font-semibold py-2.5 rounded-lg transition-all"
              >
                Join Chat
              </button>
              <p className="text-white/40 text-xs mt-4">
                Tip: Click <span className="text-teal-400">Login</span> (top right) to sign in and keep your name saved
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 bg-white/5 border-b border-white/10 flex items-center gap-3">
        {config.icon}
        <div className="flex-1">
          <h3 className="text-white font-semibold text-sm">{config.title}</h3>
          <div className="flex items-center gap-1 text-white/50 text-xs">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
            {Math.floor(usersOnline * 0.3)} online
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto p-4 space-y-3">
        {/* Welcome message */}
        <div className="bg-teal-500/10 border border-teal-500/20 rounded-xl p-3 text-center">
          <p className="text-teal-300 text-sm">{config.welcome}</p>
        </div>

        {roomMessages.map((msg) => (
          <div key={msg.id} className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-xs font-bold shrink-0 self-start">
              {msg.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="text-white font-medium text-sm">{msg.userName}</span>
                <span className="text-white/30 text-xs">{format(msg.timestamp, 'HH:mm')}</span>
              </div>
              <p className="text-white/80 text-sm mt-0.5 break-words">{msg.content}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-white/10 bg-white/5">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:border-teal-400 transition-colors text-sm"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
