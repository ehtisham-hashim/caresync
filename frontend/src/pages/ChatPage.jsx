import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User } from 'lucide-react';
import Button from '../components/common/Button';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function ChatPage() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: "Hello! I'm your AI Health Companion. I can help answer general health questions, explain medical terms, and provide wellness tips. How can I assist you today?",
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentQuery = input;
    setInput('');
    setIsTyping(true);

    try {
      const { data } = await api.post('/chat/ask', { query: currentQuery });

      const aiMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: data.data.response,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      toast.error('Failed to get AI response. Please try again.');
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: "I'm sorry, I encountered an error. Please try again in a moment.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 h-[calc(100vh-10rem)] flex flex-col">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-1 h-5 bg-[#1976d2] rounded-full"></div>
        <div>
          <h1 className="text-xl font-bold text-[#2c3e50]">AI Health Companion</h1>
          <p className="text-sm text-gray-500 mt-1">Ask me anything about your health</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden bg-gray-50 rounded-2xl border border-gray-100">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-4 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                message.role === 'user' ? 'bg-[#1976d2] text-white' : 'bg-[#2c3e50] text-white'
              }`}>
                {message.role === 'user' ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
              </div>
              <div className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'} max-w-[80%]`}>
                <div className={`p-4 rounded-2xl ${
                  message.role === 'user'
                    ? 'bg-[#1976d2] text-white rounded-tr-none'
                    : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none shadow-sm'
                }`}>
                  <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                </div>
                <span className="text-xs text-gray-400 mt-1 mx-1 font-medium">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-4">
              <div className="shrink-0 w-10 h-10 rounded-xl bg-[#2c3e50] text-white flex items-center justify-center">
                <Bot className="h-5 w-5" />
              </div>
              <div className="bg-white border border-gray-200 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-gray-200">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type your health question..."
              className="flex-1 border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
            />
            <Button onClick={handleSend} disabled={!input.trim() || isTyping} className="px-6 rounded-xl bg-[#1976d2] hover:bg-[#1565c0]">
              <Send className="h-5 w-5" />
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center font-medium">
            ⚠️ This AI provides general information only. Always consult your doctor for medical advice.
          </p>
        </div>
      </div>
    </div>
  );
}
