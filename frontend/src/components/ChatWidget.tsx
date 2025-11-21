import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../types';
import { useSettings } from '../context/SettingsContext';
import { getAiChatResponse } from '../api'; // Use the new API function

export default function ChatWidget(): React.ReactNode {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { sender: 'bot', text: "Bonjour ! Je suis ExpertBot. Comment puis-je vous aider aujourd'hui ?" }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { settings } = useSettings();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading) return;

    const userMessage: ChatMessage = { sender: 'user', text: userInput };
    const currentMessages = [...messages, userMessage];
    setMessages(currentMessages);
    setUserInput('');
    setIsLoading(true);

    try {
      const history = currentMessages.slice(0, -1);
      const botResponseText = await getAiChatResponse(userInput, history, settings);
      const botMessage: ChatMessage = { sender: 'bot', text: botResponseText };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("Chat API Error:", error);
      const errorMessage: ChatMessage = { sender: 'bot', text: "Désolé, une erreur est survenue." };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-5 right-5 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-expert-blue text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg hover:bg-expert-blue/80 transition-all transform hover:scale-110"
          aria-label="Ouvrir le chat"
        >
          <i className={`fas ${isOpen ? 'fa-times' : 'fa-comments'} text-2xl`}></i>
        </button>
      </div>

      {isOpen && (
        <div className="fixed bottom-24 right-5 w-80 h-[450px] bg-white rounded-lg shadow-2xl z-50 flex flex-col transition-all duration-300 ease-out origin-bottom-right transform scale-100 animate-fade-in-up">
          <header className="bg-expert-blue text-white p-4 rounded-t-lg flex justify-between items-center">
            <h3 className="font-bold font-heading">Chat en direct</h3>
            <button onClick={() => setIsOpen(false)} className="text-white hover:text-gray-300">
              <i className="fas fa-times"></i>
            </button>
          </header>

          <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
            {messages.map((msg, index) => (
              <div key={index} className={`flex mb-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`rounded-lg py-2 px-3 max-w-xs ${
                    msg.sender === 'user' ? 'bg-expert-green text-white' : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
               <div className="flex justify-start mb-3">
                 <div className="bg-gray-200 text-gray-800 rounded-lg py-2 px-3">
                   <span className="animate-pulse">...</span>
                 </div>
               </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="p-3 border-t bg-white">
            <div className="flex">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Tapez votre message..."
                className="flex-1 p-2 border rounded-l-md focus:ring-expert-blue focus:border-expert-blue"
                disabled={isLoading}
              />
              <button
                type="submit"
                className="bg-expert-blue text-white px-4 rounded-r-md hover:bg-expert-blue/90 disabled:bg-gray-400"
                disabled={isLoading || !userInput.trim()}
              >
                <i className="fas fa-paper-plane"></i>
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
