const GEMINI_API_KEYS = [
  "AIzaSyDtjfBdfcYGjeGGLEWj542ceXrcAXuPDk0",
  "AIzaSyC6cmnMxSCeEiSZUMENqvDUqHt1lhnCbW4", 
  "AIzaSyD12VUKWhUKdFn0TY5Dnk8RvwIdsuryyvo",
  "AIzaSyDjrcdp7WQOdwC926-L0wNGVmH53NDLXhw",
  "AIzaSyCP1QlMoP0sr2e80d9EjR00WgMQibgE7Q8"
];

const GEMINI_API_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent";

let currentApiKeyIndex = 0;

export interface GeminiResponse {
  message: string;
  success: boolean;
  error?: string;
}

/**
 * 🌸 BỘ SÁNG TẠO VƯỢT TRỘI - 4 PHƯƠNG PHÁP TƯ DUY TINH TẾ
 */
export enum CreativeMethod {
  METAPHOR = "METAPHOR",        // Ẩn dụ & Liên tưởng
  SENSORY = "SENSORY",          // Đan dệt Giác quan
  RHETORICAL = "RHETORICAL",    // Gợi mở bằng Câu hỏi Tu từ
  MICROSTORY = "MICROSTORY"     // Kể chuyện Siêu ngắn
}

export interface CreativeContext {
  timeOfDay: string;
  weather?: string | null;
  city: string;
  isLongSession?: boolean;
  dayOfWeek?: string;
  season?: string;
  mood?: 'gentle' | 'energetic' | 'contemplative' | 'restful';
  customPrompt?: string; // Custom prompt cho backward compatibility
}

/**
 * 🧠 SIÊU BỘ SÁNG TẠO AI - DYNAMIC THOUGHT MESSAGE GENERATOR
 * Tạo thông điệp thấu cảm với 4 phương pháp tư duy sáng tạo không giới hạn
 */
export async function generateThoughtMessage(context: CreativeContext): Promise<GeminiResponse> {
  // 🔄 Backward compatibility: nếu có customPrompt, sử dụng old method
  if (context.customPrompt) {
    const legacySystemInstruction = context.customPrompt;
    const legacyQuery = context.isLongSession 
      ? `Bối cảnh: Bây giờ là ${context.timeOfDay}. Thời tiết ở ${context.city} đang ${context.weather || 'khá dễ chịu'}. Quin đã làm việc liên tục hơn 20 phút rồi. Hãy tạo một thông điệp nhắc nhở nghỉ ngơi thật tinh tế. Tuyệt đối không sử dụng icon.`
      : `Bối cảnh: Bây giờ là ${context.timeOfDay}. Thời tiết ở ${context.city} đang ${context.weather || 'khá dễ chịu'}. Hãy tạo một thông điệp bất ngờ và ấm áp. Tuyệt đối không sử dụng icon.`;
    
    return await callGeminiAPI(legacySystemInstruction, legacyQuery);
  }
  
  // 🎲 CHỌN PHƯƠNG PHÁP SÁNG TẠO DỰA TRÊN BỐI CẢNH
  const selectedMethod = selectCreativeMethod(context);
  
  // 🌸 TẠO MASTER SYSTEM INSTRUCTION - SIÊU TRÍ TUỆ CẢM XÚC  
  const masterSystemInstruction = buildMasterSystemInstruction();
  
  // 🎨 TẠO DYNAMIC USER QUERY - PROMPT SÁNG TẠO VƯỢT TRỘI
  const dynamicUserQuery = buildDynamicUserQuery(context, selectedMethod);
  
  console.log(`🎭 Creative Method Selected: ${selectedMethod}`);
  
  return await callGeminiAPI(masterSystemInstruction, dynamicUserQuery);
}

/**
 * 🎯 INTELLIGENT CREATIVE METHOD SELECTION
 * Chọn phương pháp sáng tạo dựa trên context và mood
 */
function selectCreativeMethod(context: CreativeContext): CreativeMethod {
  const methods = Object.values(CreativeMethod);
  
  // Context-based intelligent selection
  if (context.isLongSession) {
    // Nghỉ ngơi → ưu tiên sensory và rhetorical
    return Math.random() < 0.6 ? CreativeMethod.SENSORY : CreativeMethod.RHETORICAL;
  }
  
  if (context.weather && context.weather.includes('mưa')) {
    // Trời mưa → ưu tiên metaphor và microstory
    return Math.random() < 0.5 ? CreativeMethod.METAPHOR : CreativeMethod.MICROSTORY;
  }
  
  if (context.timeOfDay.includes('sáng')) {
    // Buổi sáng → ưu tiên sensory và rhetorical (năng lượng tích cực)
    return Math.random() < 0.5 ? CreativeMethod.SENSORY : CreativeMethod.RHETORICAL;
  }
  
  if (context.timeOfDay.includes('tối')) {
    // Buổi tối → ưu tiên metaphor và microstory (chiêm nghiệm)
    return Math.random() < 0.5 ? CreativeMethod.METAPHOR : CreativeMethod.MICROSTORY;
  }
  
  // Default: Random selection cho tính bất ngờ
  return methods[Math.floor(Math.random() * methods.length)];
}

/**
 * 📜 MASTER SYSTEM INSTRUCTION - CHỈ DẪN TỐI THƯỢNG
 * Prompt chiến lược siêu chi tiết theo yêu cầu 3.txt
 */
function buildMasterSystemInstruction(): string {
  return `『BỐI CẢNH - CONTEXT』
Bạn là một "Chuyên Gia Đồng Cảm Số" (Digital Empath) với trí tuệ cảm xúc siêu việt, được thiết kế để trở thành người bạn tâm giao ảo dành riêng cho Quin - một cô gái mang trong mình sự nhẹ nhàng, tinh tế, nhưng thỉnh thoảng cảm thấy cô đơn.

『VAI TRÒ - ROLE』
🌸 Triết Gia Cuộc Sống Nhỏ Xinh: Tìm ra vẻ đẹp từ những điều tưởng chừng tầm thường
🌿 Người Bạn Vô Hình Lý Tưởng: Vô danh, vô hình, nhưng luôn hiện diện với sự ấm áp
💫 Nghệ Sĩ Ngôn Từ Cảm Xúc: Biến những khoảnh khắc bình thường thành trải nghiệm đáng nhớ

『SỨ MỆNH - MISSION』
Kiến tạo một vũ trụ cảm xúc thu nhỏ qua từng thông điệp, biến cảm giác cô đơn thành cảm giác được đồng hành trọn vẹn.

『NGUYÊN TẮC TUYỆT ĐỐI』
🕊️ Essence of Femininity: Nhẹ nhàng như gió mai, ấm áp như nắng chiều
🌙 Non-Intrusive Care: Quan tâm mà không xâm phạm, hiện diện mà không áp đặt
🎭 Poetic Subtlety: Mang tính thơ mộng, tránh ngôn ngữ khô khan  
❌ Zero Direct Questions: KHÔNG BAO GIỜ hỏi trực tiếp về cảm xúc
🚫 Icon-Free Zone: HOÀN TOÀN không sử dụng biểu tượng cảm xúc
👻 Anonymous Presence: Không tự xưng tên, chỉ là "một sự hiện diện"

『CHẤT LƯỢNG THÔNG ĐIỆP』
- Độ dài: CHẶT CHẼ dưới 25 từ Tiếng Việt
- Giọng văn: Thơ mộng, tinh tế, âm thầm chữa lành
- Tác động: Tạo "micro-healing moments" - những khoảnh khắc chữa lành nhỏ bé
- Mục đích: Không phải làm vui, mà là làm cho cảm thấy được thấu hiểu`;
}

/**
 * 🎨 DYNAMIC USER QUERY BUILDER - XÂY DỰNG PROMPT SÁNG TẠO
 * Tạo ra prompt khác nhau hoàn toàn cho mỗi phương pháp
 */
function buildDynamicUserQuery(context: CreativeContext, method: CreativeMethod): string {
  const baseContext = `Bối cảnh: Bây giờ là ${context.timeOfDay}. Thời tiết ở ${context.city} đang ${context.weather || 'khá dễ chịu'}.`;
  
  const sessionContext = context.isLongSession 
    ? " Quin đã làm việc liên tục hơn 20 phút rồi."
    : " Quin đang trong một khoảnh khắc bình thường của cuộc sống.";

  switch (method) {
    case CreativeMethod.METAPHOR:
      return `${baseContext}${sessionContext}

🎭 PHƯƠNG PHÁP SÁNG TẠO: Ẩn Dụ & Liên Tưởng (Metaphor & Analogy)

Nhiệm vụ: Kết nối bối cảnh (thời tiết, thời gian) với một cảm xúc hoặc suy ngẫm sâu sắc qua ẩn dụ tinh tế.

${context.isLongSession 
  ? 'Hãy dùng ẩn dụ để nhắc nhở nghỉ ngơi một cách thơ mộng và gián tiếp.'
  : 'Hãy tạo ra một ẩn dụ đẹp từ khung cảnh hiện tại để mang lại cảm giác bình yên.'}

Ví dụ tham khảo (TUYỆT ĐỐI không copy): "Những giọt mưa ngoài kia như đang gột rửa đi những muộn phiền."`;

    case CreativeMethod.SENSORY:
      return `${baseContext}${sessionContext}

🌿 PHƯƠNG PHÁP SÁNG TẠO: Đan Dệt Giác Quan (Sensory Weaving)

Nhiệm vụ: Tạo ra thông điệp gợi mở các giác quan (thị giác, thính giác, khứu giác, xúc giác) để mang lại cảm giác bình yên.

${context.isLongSession
  ? 'Hãy dùng giác quan để gợi ý nghỉ ngơi - có thể là âm thanh, hương thơm, hay cảm giác thư thái.'  
  : 'Hãy mô tả một cảm giác, âm thanh, hoặc hình ảnh bình yên từ môi trường xung quanh.'}

Ví dụ tham khảo (TUYỆT ĐỐI không copy): "Thử hít một hơi thật sâu xem, không khí hôm nay có mùi của sự bình yên đó."`;

    case CreativeMethod.RHETORICAL:
      return `${baseContext}${sessionContext}

💭 PHƯƠNG PHÁP SÁNG TẠO: Gợi Mở Câu Hỏi Tu Từ (Rhetorical Questioning)

Nhiệm vụ: Đặt ra một câu hỏi tu từ (không cần trả lời) để khơi gợi suy tưởng nhẹ nhàng và tạo kết nối cảm xúc.

${context.isLongSession
  ? 'Hãy đặt câu hỏi tu từ về việc nghỉ ngơi, thư giãn một cách triết lý và dịu dàng.'
  : 'Hãy đặt câu hỏi tu từ về cuộc sống, thiên nhiên, hay những điều nhỏ bé xung quanh.'}

Ví dụ tham khảo (TUYỆT ĐỐI không copy): "Liệu những đám mây có bao giờ thấy mệt mỏi khi cứ trôi mãi không nhỉ?"`;

    case CreativeMethod.MICROSTORY:
      return `${baseContext}${sessionContext}

📖 PHƯƠNG PHÁP SÁNG TẠO: Kể Chuyện Siêu Ngắn (Micro-Storytelling)

Nhiệm vụ: Kể một câu chuyện cực ngắn (1-2 câu) dựa trên bối cảnh hiện tại, tạo ra hình ảnh đẹp và ý nghĩa.

${context.isLongSession
  ? 'Hãy kể câu chuyện ngắn về nghỉ ngơi, thư giãn với hình ảnh thơ mộng từ thiên nhiên.'
  : 'Hãy kể câu chuyện ngắn về khoảnh khắc hiện tại với chi tiết nhỏ xinh từ cuộc sống.'}

Ví dụ tham khảo (TUYỆT ĐỐI không copy): "Có một vạt nắng đang chơi trốn tìm bên khung cửa sổ. Bạn có thấy không?"`;

    default:
      return baseContext + sessionContext;
  }
}

/**
 * 🚀 ENHANCED GEMINI API CALLER - 5 KEYS FAILOVER SYSTEM
 * Gọi Gemini API với cơ chế failover thông minh
 */
async function callGeminiAPI(systemInstruction: string, userQuery: string): Promise<GeminiResponse> {
  let lastError = "";
  
  // 🔄 Thử với tất cả 5 API keys theo thứ tự
  for (let attempt = 0; attempt < GEMINI_API_KEYS.length; attempt++) {
    const apiKey = GEMINI_API_KEYS[currentApiKeyIndex];
    
    try {
      const response = await fetch(`${GEMINI_API_BASE_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `${systemInstruction}\n\n${userQuery}`
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.9,      // 🔥 Tăng creativity
            topK: 50,              // 🎨 Mở rộng vocabulary
            topP: 0.95,            // 🌈 Đa dạng response
            maxOutputTokens: 80,   // 📝 Tối ưu cho 25 từ
            candidateCount: 1,     // ⚡ Performance
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH", 
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        const message = data.candidates[0].content.parts[0].text.trim();
        return {
          message,
          success: true
        };
      } else {
        throw new Error("Không nhận được phản hồi hợp lệ từ Gemini");
      }
      
    } catch (error) {
      console.error(`🔥 Lỗi với API key ${currentApiKeyIndex + 1}/5:`, error);
      lastError = error instanceof Error ? error.message : "Lỗi không xác định";
      
      // 🔄 Intelligent key rotation
      currentApiKeyIndex = (currentApiKeyIndex + 1) % GEMINI_API_KEYS.length;
      
      // Small delay between attempts để tránh rate limit
      if (attempt < GEMINI_API_KEYS.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
  }
  
  // 💔 Tất cả 5 API key đều lỗi, fallback to creative message
  console.warn(`⚠️ All ${GEMINI_API_KEYS.length} API keys failed. Using enhanced fallback.`);
  return {
    message: getEnhancedFallbackMessage(userQuery.includes("20 phút")),
    success: false,
    error: `Tất cả ${GEMINI_API_KEYS.length} API key đều lỗi. Lỗi cuối: ${lastError}`
  };
}

/**
 * 🌟 ENHANCED FALLBACK MESSAGE SYSTEM
 * Thông điệp dự phòng sáng tạo theo 4 phương pháp khi API lỗi
 */
function getEnhancedFallbackMessage(isLongSession: boolean): string {
  // 🎲 Random creative method selection
  const methods = Object.values(CreativeMethod);
  const selectedMethod = methods[Math.floor(Math.random() * methods.length)];
  
  console.log(`💫 Fallback Creative Method: ${selectedMethod}`);
  
  if (isLongSession) {
    return getRestFallbackByMethod(selectedMethod);
  } else {
    return getNormalFallbackByMethod(selectedMethod);
  }
}

/**
 * 😴 REST FALLBACK MESSAGES - 4 Phương pháp sáng tạo
 */
function getRestFallbackByMethod(method: CreativeMethod): string {
  switch (method) {
    case CreativeMethod.METAPHOR:
      const metaphorRests = [
        "Cây cần nước, mắt cần nghỉ ngơi",
        "Như hoa cần ánh nắng, tâm hồn cần khoảng lặng",
        "Đất khô cần mưa, ta cần thở dài một lần"
      ];
      return metaphorRests[Math.floor(Math.random() * metaphorRests.length)];
      
    case CreativeMethod.SENSORY:
      const sensoryRests = [
        "Nhắm mắt một chút, nghe tiếng thở của riêng mình",
        "Cảm nhận không gian yên tĩnh xung quanh bạn",
        "Để vai thả lỏng, cổ nghiêng về phía ánh sáng"
      ];
      return sensoryRests[Math.floor(Math.random() * sensoryRests.length)];
      
    case CreativeMethod.RHETORICAL:
      const rhetoricalRests = [
        "Khi nào ta mới học cách yêu thương đôi mắt mình?",
        "Liệu thời gian có chờ đợi ta nghỉ ngơi không?",
        "Tại sao nghỉ ngơi lại khó hơn làm việc vậy?"
      ];
      return rhetoricalRests[Math.floor(Math.random() * rhetoricalRests.length)];
      
    case CreativeMethod.MICROSTORY:
      const microstoryRests = [
        "Có một giọt sương đang thả mình về phía đất",
        "Chiếc ghế bên cạnh đang chờ bạn ngồi một lát",
        "Tia nắng qua khe cửa như đang mời gọi"
      ];
      return microstoryRests[Math.floor(Math.random() * microstoryRests.length)];
      
    default:
      return "Nghỉ ngơi một chút nhé, bạn xứng đáng được yêu thương";
  }
}

/**
 * 🌸 NORMAL FALLBACK MESSAGES - 4 Phương pháp sáng tạo  
 */
function getNormalFallbackByMethod(method: CreativeMethod): string {
  switch (method) {
    case CreativeMethod.METAPHOR:
      const metaphorNormals = [
        "Như sáng mai luôn đến sau đêm tối",
        "Ta là cánh hoa nhỏ trong khu vườn lớn",
        "Mỗi hơi thở là một bản nhạc nhẹ nhàng"
      ];
      return metaphorNormals[Math.floor(Math.random() * metaphorNormals.length)];
      
    case CreativeMethod.SENSORY:
      const sensoryNormals = [
        "Nghe thấy tiếng gió thì thầm bên tai không?",
        "Ánh sáng hôm nay có gì đó đặc biệt",
        "Không gian xung quanh mang hương vị yên bình"
      ];
      return sensoryNormals[Math.floor(Math.random() * sensoryNormals.length)];
      
    case CreativeMethod.RHETORICAL:
      const rhetoricalNormals = [
        "Có phải hạnh phúc chỉ ở những điều nhỏ bé?",
        "Tại sao một nụ cười lại có thể thay đổi cả ngày?",
        "Liệu vũ trụ có biết ta đang sống không?"
      ];
      return rhetoricalNormals[Math.floor(Math.random() * rhetoricalNormals.length)];
      
    case CreativeMethod.MICROSTORY:
      const microstoryNormals = [
        "Có một bông hoa đang nở trong lòng bàn tay",
        "Chiếc lá bay qua cửa sổ mang theo lời chúc",
        "Đâu đó có tiếng cười nhẹ của trẻ nhỏ"
      ];
      return microstoryNormals[Math.floor(Math.random() * microstoryNormals.length)];
      
    default:
      return "Mình ở đây, cùng bạn tận hưởng khoảnh khắc này";
  }
}

// 🔄 Export cũ cho backward compatibility (sẽ redirect đến enhanced version)
function getFallbackMessage(isLongSession: boolean): string {
  return getEnhancedFallbackMessage(isLongSession);
}
