interface Question {
  buttonName: string;
  question: string;
}

interface LanguageEntry {
  "lang-code": string;
  "lang-name": string;
  "flag-src": string;
  questions: Question[];
  placeholder: string;
  message: string;
  header: string;
  description: string;
}

interface AssistantConfig {
  langs: LanguageEntry[];
}

/**
 * Energy Assistant Configuration
 * Contains predefined messages, questions and language settings
 */
const assistantConfig: AssistantConfig = {
  langs: [
    {
      "lang-code": "tr-TR",
      "lang-name": "Türkçe",
      "flag-src": "/flags/tr-TR.svg",
      "questions": [
        {
          "buttonName": "Enerji tasarrufu?",
          "question": "Enerji tasarrufu için evimde nelere dikkat etmeliyim?"
        },
        {
          "buttonName": "Cihaz önerileri",
          "question": "Cihazlarımla ilgili enerji tasarrufu önerileri nelerdir?"
        },
        {
          "buttonName": "Fatura analizi",
          "question": "Elektrik faturamı nasıl düşürebilirim?"
        },
        {
          "buttonName": "Verimlilik",
          "question": "Enerji verimliliğini artırmak için neler yapabilirim?"
        },
        {
          "buttonName": "Aydınlatma",
          "question": "Aydınlatma için enerji tasarrufu tavsiyeleri nelerdir?"
        },
        {
          "buttonName": "Isıtma/Soğutma",
          "question": "Isıtma ve soğutma sistemlerinde enerji tasarrufu nasıl sağlanır?"
        },
        {
          "buttonName": "Bekleme modu",
          "question": "Bekleme modunda olan cihazlar ne kadar enerji harcar?"
        }
      ],
      "placeholder": "Mesajınızı yazın",
      "message": "Merhaba, ben Enerji Asistanı. Enerji tasarrufu ve verimlilik konusunda sorularınızı yanıtlamak için buradayım. Size nasıl yardımcı olabilirim?",
      "header": "Enerji Asistanı",
      "description": "Enerji tüketiminizi optimize etmek için kişiselleştirilmiş öneriler sunan akıllı asistan."
    },
    {
      "lang-code": "en-US",
      "lang-name": "English",
      "flag-src": "/flags/en-US.svg",
      "questions": [
        {
          "buttonName": "Energy saving?",
          "question": "What should I pay attention to at home for energy saving?"
        },
        {
          "buttonName": "Device tips",
          "question": "What are energy saving recommendations for my devices?"
        },
        {
          "buttonName": "Bill analysis",
          "question": "How can I reduce my electricity bill?"
        },
        {
          "buttonName": "Efficiency",
          "question": "What can I do to increase energy efficiency?"
        },
        {
          "buttonName": "Lighting",
          "question": "What are energy saving tips for lighting?"
        },
        {
          "buttonName": "Heating/Cooling",
          "question": "How to save energy in heating and cooling systems?"
        },
        {
          "buttonName": "Standby mode",
          "question": "How much energy do devices in standby mode consume?"
        }
      ],
      "placeholder": "Type your message",
      "message": "Hello, I'm the Energy Assistant. I'm here to answer your questions about energy saving and efficiency. How can I help you today?",
      "header": "Energy Assistant",
      "description": "Smart assistant providing personalized recommendations to optimize your energy consumption."
    }
  ]
};

export default assistantConfig; 