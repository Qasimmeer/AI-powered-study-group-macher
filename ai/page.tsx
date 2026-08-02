"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Sidebar } from "@/components/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  Loader2,
  Zap,
  BookOpen,
  MessageCircle,
  Clock,
  BrainCircuit,
  RotateCcw
} from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { QuizCard } from "@/components/ai/QuizCard";
import { FlashcardDeck } from "@/components/ai/FlashcardDeck";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: "1",
    role: "assistant",
    content: "Hello! I'm your AI Study Group Maker Assistant. What topic are we focusing on today? You can also paste your notes here, and I can help you understand them or generate quizzes and flashcards!",
    timestamp: new Date(),
  }
];

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to connect to AI");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";
      
      const assistantMessageId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, {
        id: assistantMessageId,
        role: "assistant",
        content: "",
        timestamp: new Date(),
      }]);

      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        assistantContent += chunk;
        
        setMessages(prev => prev.map(msg => 
          msg.id === assistantMessageId ? { ...msg, content: assistantContent } : msg
        ));
      }
    } catch (err: any) {
      console.error("AI Error:", err);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: "assistant",
        content: `⚠️ **System Note:** ${err.message || "I encountered an error while processing your request. Please try again in a few moments."}`,
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessageContent = (content: string) => {
    const parts = content.split(/```json([\s\S]*?)```/);
    
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        try {
          const data = JSON.parse(part.trim());
          if (data.type === "quiz") {
            return <QuizCard key={index} {...data} />;
          }
          if (data.type === "flashcards") {
            return <FlashcardDeck key={index} {...data} />;
          }
        } catch (e) {
          console.error("Failed to parse AI JSON component:", e);
        }
      }
      
      return (
        <div key={index} className="prose dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-muted/50 prose-pre:border prose-pre:border-border/40">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {part}
          </ReactMarkdown>
        </div>
      );
    });
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <Sidebar />

      <main className="flex-1 flex flex-col relative bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-background to-background">
        {/* Header */}
        <header className="h-16 border-b border-border/40 bg-card/30 backdrop-blur-3xl flex items-center justify-between px-6 shrink-0 z-10">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shadow-inner">
              <Sparkles className="h-5 w-5" />
            </div>
            <h1 className="text-lg font-bold tracking-tight">AI Study Group Maker Assistant</h1>
          </div>
          
          <Button variant="ghost" size="sm" onClick={() => setMessages(INITIAL_MESSAGES)} className="gap-2 text-muted-foreground font-semibold h-8">
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </Button>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 scroll-smooth no-scrollbar" ref={scrollRef}>
          <div className="max-w-4xl mx-auto space-y-10">
            {messages.map((msg) => (
              <div key={msg.id} className={cn(
                "flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300",
                msg.role === "assistant" ? "flex-row" : "flex-row-reverse"
              )}>
                <div className={cn(
                  "h-10 w-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm mt-1",
                  msg.role === "assistant" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                )}>
                  {msg.role === "assistant" ? <Bot className="h-6 w-6" /> : <User className="h-6 w-6" />}
                </div>
                
                <div className={cn(
                  "space-y-2 max-w-[85%]",
                  msg.role === "user" ? "items-end" : "items-start"
                )}>
                  <div className={cn(
                    "px-6 py-4 rounded-[2rem] text-base shadow-sm leading-relaxed",
                    msg.role === "assistant" 
                      ? "bg-card border border-border/40 rounded-tl-none text-foreground" 
                      : "bg-primary text-primary-foreground rounded-tr-none"
                  )}>
                    {renderMessageContent(msg.content)}
                  </div>
                  <div className="flex items-center gap-2 px-2 opacity-30">
                    <Clock className="h-3 w-3" />
                    <span className="text-[10px] font-bold uppercase tracking-tighter">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && messages[messages.length - 1].role === "user" && (
              <div className="flex gap-4 animate-in fade-in duration-300">
                <div className="h-10 w-10 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                  <Bot className="h-6 w-6" />
                </div>
                <div className="bg-card border border-border/40 px-6 py-4 rounded-3xl rounded-tl-none flex items-center">
                   <div className="flex gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-primary/40 animate-bounce" />
                    <div className="h-2 w-2 rounded-full bg-primary/40 animate-bounce [animation-delay:0.2s]" />
                    <div className="h-2 w-2 rounded-full bg-primary/40 animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="p-6 bg-background/50 backdrop-blur-md border-t border-border/10 shrink-0">
          <div className="max-w-4xl mx-auto space-y-4">
            {/* Quick Actions */}
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {[
                { icon: BrainCircuit, label: "Generate a quiz" },
                { icon: BookOpen, label: "Create flashcards" },
                { icon: Sparkles, label: "Simplify this topic" },
                { icon: MessageCircle, label: "Check my understanding" }
              ].map((s, i) => (
                <Button 
                  key={i} 
                  variant="outline" 
                  size="sm" 
                  className="rounded-full bg-card/50 border-border/40 text-xs font-bold gap-2 whitespace-nowrap hover:bg-primary/5 hover:text-primary transition-all active:scale-95 px-4 h-9"
                  onClick={() => setInput(s.label)}
                >
                  <s.icon className="h-3.5 w-3.5 text-primary/60" />
                  {s.label}
                </Button>
              ))}
            </div>

            <form onSubmit={handleSendMessage} className="flex items-center gap-4">
              <div className="flex-1 relative group">
                <Input 
                  placeholder="Ask anything or paste notes to start learning..." 
                  className="h-14 pl-6 pr-20 bg-card/50 border-border/20 focus:bg-card focus:border-primary/50 transition-all rounded-[2rem] shadow-inner backdrop-blur-sm text-lg"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isLoading}
                />
                <Button 
                  type="submit" 
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 top-2 h-10 px-6 rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all font-bold gap-2"
                >
                  {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                    <>
                      Send
                      <Send className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
