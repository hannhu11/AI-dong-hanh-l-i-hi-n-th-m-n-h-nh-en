import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import React, { Suspense, useState, useEffect } from "react";
import Loading from "./Loading";
import { useSettings } from "./hooks/useSettings";
import { appWindow } from "@tauri-apps/api/window";
import { useDefaultPets, usePets } from "./hooks/usePets";
import { confirm } from "@tauri-apps/api/dialog";
import { MantineProvider } from "@mantine/core";
import { PrimaryColor } from "./utils";
import { ColorSchemeType } from "./types/ISetting";
import EnhancedThoughtBubble from "./ui/components/EnhancedThoughtBubble";
import "./ui/components/EnhancedThoughtBubble.css";
import { AIMessage } from "./services/petAIService";
import { startContextMonitoring } from "./services/contextService";

const PhaserWrapper = React.lazy(() => import("./PhaserWrapper"));
const SettingWindow = React.lazy(() => import("./SettingWindow"));

function App() {
  useSettings();
  useDefaultPets();
  const { isError, error } = usePets();
  
  // State for AI thought bubble with enhanced features
  const [currentThought, setCurrentThought] = useState<string>("");
  const [isThoughtVisible, setIsThoughtVisible] = useState(false);
  const [bubbleType, setBubbleType] = useState<'gentle' | 'rest' | 'creative' | 'healing'>('gentle');

  // Listen for AI messages from Phaser scene with enhanced bubble detection
  useEffect(() => {
    const handleAIMessage = (event: CustomEvent<AIMessage>) => {
      const message = event.detail;
      
      // Determine bubble type based on message content
      let detectedBubbleType: typeof bubbleType = 'gentle';
      if (message.isLongSessionMessage || message.text.includes('nghỉ') || message.text.includes('mỏi')) {
        detectedBubbleType = 'rest';
      } else if (message.text.includes('sáng tạo') || message.text.includes('thử') || message.text.includes('vẽ')) {
        detectedBubbleType = 'creative';
      } else if (message.text.includes('hít thở') || message.text.includes('thư giãn') || message.text.includes('yên bình')) {
        detectedBubbleType = 'healing';
      }
      
      setBubbleType(detectedBubbleType);
      setCurrentThought(message.text);
      setIsThoughtVisible(true);
    };

    // Add event listener
    window.addEventListener('ai-message' as any, handleAIMessage);

    return () => {
      window.removeEventListener('ai-message' as any, handleAIMessage);
    };
  }, []);

  // Initialize simplified context service - no welcome message spam
  useEffect(() => {
    let isMounted = true;
    
    const initializeContextService = async () => {
      try {
        console.log("🌸 Khởi tạo Người Bạn Đồng Hành AI...");
        
        // Start simplified context monitoring (no clipboard)
        await startContextMonitoring();
        
        if (isMounted) {
          console.log("✅ Người Bạn Đồng Hành AI đã sẵn sàng bên cạnh Quin");
          // No welcome message - let natural interactions begin
        }
        
      } catch (error) {
        console.error("❌ Lỗi khởi tạo:", error);
      }
    };

    initializeContextService();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isError) {
    confirm(`Error: ${error.message}`, {
      title: 'WindowPet Dialog',
      type: 'error',
    }).then((ok) => {
      if (ok !== undefined) {
        appWindow.close();
      }
    });
  }

  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<PhaserWrapper />} />
          <Route path="/setting" element={
            <Suspense fallback={<Loading />}>
              <MantineProvider
                defaultColorScheme={ColorSchemeType.Dark}
                theme={{
                  fontFamily: 'cursive, Siemreap, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji',
                  colors: {
                    dark: [
                      "#C1C2C5",
                      "#A6A7AB",
                      "#909296",
                      "#5C5F66",
                      "#373A40",
                      "#2C2E33",
                      // shade
                      "#1A1B1E",
                      // background
                      "#141517",
                      "#1A1B1E",
                      "#101113",
                    ],
                  },
                  primaryColor: PrimaryColor,
                }} >
                <SettingWindow />
              </MantineProvider>
            </Suspense>
          } />
        </Routes>
      </Router>
      
      {/* Enhanced AI Thought Bubble - Beautiful, context-aware display */}
      <EnhancedThoughtBubble
        message={currentThought}
        isVisible={isThoughtVisible}
        bubbleType={bubbleType}
        onAnimationComplete={() => {
          setIsThoughtVisible(false);
          setCurrentThought("");
        }}
        duration={12000}
      />
      
      {/* Removed ContextSuggestionBubble - focus only on ThoughtBubble */}
    </>
  );
}

export default App;