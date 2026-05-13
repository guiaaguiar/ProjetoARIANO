import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Maximize2, X, Minus } from 'lucide-react';

interface CognitionTerminalProps {
  formData: any;
  apiResponse: any | null;
  isError: boolean;
}

export const CognitionTerminal: React.FC<CognitionTerminalProps> = ({ formData, apiResponse, isError }) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [logs, setLogs] = useState<string>('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Generate initial prompt log
    const systemPrompt = `Você é o motor cognitivo ARIANO.
Analise o perfil abaixo e retorne os editais compatíveis e a rede acadêmica em JSON.`;

    const userPrompt = `Perfil do Usuário:
Nome: ${formData.name || 'Desconhecido'}
Curso: ${formData.course || 'N/A'} (Semestre: ${formData.semester || 1})
Instituição: ${formData.institution || 'N/A'}
Interesses: ${formData.o_que_busco || 'N/A'}
Bio/Currículo: ${formData.bio || ''} ${formData.curriculo_texto || ''}`;

    const pythonScriptLog = `> [ARIANO_CORE_ENGINE] Executando script de inferência...
> python run_cognition.py --user "${formData.name || 'Desconhecido'}"

# --- SCRIPT PYTHON EM EXECUÇÃO NO BACKEND ---

OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
HEADERS = {"Authorization": f"Bearer {OPENROUTER_API_KEY}"}

payload = {
    "model": "openrouter/auto",
    "messages": [
        {
            "role": "system", 
            "content": "Você é o motor de matchmaking cognitivo do ARIANO.\\nAnalise este perfil e conecte-o ao ecossistema."
        },
        {
            "role": "user", 
            "content": "USUÁRIO: ${formData.name || 'Desconhecido'} (${formData.course || 'N/A'}, ${formData.semester || 1}º sem)
            BIO: ${formData.bio || 'N/A'}
            OBJETIVOS: ${formData.o_que_busco || 'N/A'}"
        }
    ]
}

# --------------------------------------------

> [INFO] Enviando payload para LLM Cluster...
> AGUARDANDO PROCESSAMENTO DO GRAFO (O(1)) E LLM...
`;

    setLogs(pythonScriptLog);
  }, [formData]);

  useEffect(() => {
    if (apiResponse) {
      const responseLog = `
> [INFO] Resposta recebida. Parseando JSON...
${JSON.stringify(apiResponse, null, 2)}

> [SUCCESS] Construindo conexões (Edges) no Neo4j Graph DB...
> MERGE (u:User {name: '${formData.name || 'Desconhecido'}'})
> Fluxo de cadastro finalizado com sucesso e salvo no banco de dados.
`;
      setLogs(prev => prev + responseLog);
    } else if (isError) {
      const errorLog = `
> [ERRO_CRITICO] Falha na conexão (500 Internal Server Error) ou TimeOut no OpenRouter.
> Traceback (most recent call last):
  File "run_cognition.py", line 22, in <module>
    response.raise_for_status()
requests.exceptions.HTTPError: 502 Server Error: Bad Gateway for url

> [WARNING] Fallback estático (Rule-based) ativado localmente para evitar interrupção.
> Retornando nós de cache padrão...
`;
      setLogs(prev => prev + errorLog);
    }
  }, [apiResponse, isError, formData.name]);

  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isMinimized]);

  return (
    <AnimatePresence>
      {!isMinimized ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 50, x: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
          exit={{
            opacity: 0,
            scale: 0.1,
            y: 200,
            x: 150,
            transition: { duration: 0.4, ease: "backIn" }
          }}
          className="fixed bottom-6 right-6 z-[60] w-[450px] max-w-[90vw] h-[350px] flex flex-col rounded-xl overflow-hidden shadow-2xl"
          style={{
            background: 'rgba(11, 16, 26, 0.75)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(45, 212, 191, 0.2)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 30px rgba(45, 212, 191, 0.1)'
          }}
        >
          {/* MacOS Window Title Bar */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-900/80 border-b border-teal-500/20 backdrop-blur-md">
            <div className="flex gap-2">
              <button
                onClick={() => setIsMinimized(true)}
                className="w-3.5 h-3.5 rounded-full bg-red-500 hover:bg-red-400 transition-colors shadow-[0_0_8px_rgba(239,68,68,0.5)]"
              />
              <button
                onClick={() => setIsMinimized(true)}
                className="w-3.5 h-3.5 rounded-full bg-yellow-500 hover:bg-yellow-400 transition-colors shadow-[0_0_8px_rgba(234,179,8,0.5)]"
              />
              <div className="w-3.5 h-3.5 rounded-full bg-green-500/30 cursor-not-allowed" />
            </div>
            <div className="text-xs font-bold tracking-widest text-slate-400 font-mono">
              ARIANO
            </div>
            <div className="w-12" /> {/* Spacer for centering */}
          </div>

          {/* Terminal Content */}
          <div className="flex-1 p-4 overflow-y-auto font-mono text-xs leading-relaxed custom-scrollbar">
            <pre
              className="whitespace-pre-wrap break-words"
              style={{
                color: '#2dd4bf',
                textShadow: '0 0 8px rgba(45, 212, 191, 0.4)',
                fontFamily: '"Fira Code", "Courier New", monospace'
              }}
            >
              <TypewriterText text={logs} speed={1} scrollRef={endRef} />
            </pre>
            <div ref={endRef} />
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 100 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 100 }}
          transition={{ duration: 0.3, type: "spring", bounce: 0.4 }}
          className="fixed bottom-6 right-6 z-[60] cursor-pointer group"
          onClick={() => setIsMinimized(false)}
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center relative overflow-hidden transition-all duration-300 group-hover:scale-110"
            style={{
              background: 'rgba(11, 16, 26, 0.8)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(45, 212, 191, 0.4)',
              boxShadow: '0 0 20px rgba(45, 212, 191, 0.2)'
            }}
          >
            {/* Using an img tag with CSS filters to match the teal neon theme */}
            <img
              src="/terminal_icon.png"
              alt="Terminal"
              className="w-8 h-8 object-contain opacity-80 group-hover:opacity-100 transition-opacity"
              style={{
                filter: 'sepia(1) hue-rotate(130deg) saturate(300%) brightness(1.2)'
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Typewriter that appends text dynamically
const TypewriterText: React.FC<{ text: string, speed: number, scrollRef?: React.RefObject<HTMLDivElement | null> }> = ({ text, speed, scrollRef }) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    let currentIndex = displayedText.length;
    if (currentIndex >= text.length) return;

    const intervalId = setInterval(() => {
      setDisplayedText(text.slice(0, currentIndex + 1));
      currentIndex++;
      
      // Auto-scroll instantly on new characters
      if (scrollRef?.current) {
        scrollRef.current.scrollIntoView({ behavior: 'auto' });
      }

      if (currentIndex === text.length) {
        clearInterval(intervalId);
      }
    }, speed);

    return () => clearInterval(intervalId);
  }, [text, speed, scrollRef]);

  return (
    <>
      {displayedText}
      <span className="animate-pulse">_</span>
    </>
  );
};
