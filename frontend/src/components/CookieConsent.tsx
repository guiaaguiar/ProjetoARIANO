import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const STORAGE_KEY = "ariano_cookie_consent";

/**
 * CookieConsent
 *
 * Banner flutuante de consentimento de cookies (LGPD/GDPR-compliant).
 * - Persiste a decisão no localStorage do próprio navegador (sem IP tracking).
 * - Exibe-se com delay de 1,5 s após o primeiro carregamento da página.
 * - Anima entrada (fade + slide-up) e saída (fade + slide-down) via Framer Motion.
 * - Glassmorphism totalmente compatível com light/dark mode.
 */
export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Verifica se o usuário já consentiu anteriormente
    if (localStorage.getItem(STORAGE_KEY)) return;

    // Delay leve para não "pular na cara" do usuário imediatamente
    const timer = setTimeout(() => setIsVisible(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  function handleAccept() {
    localStorage.setItem(STORAGE_KEY, "true");
    setIsVisible(false);
  }

  function handleDecline() {
    // Armazena recusa explícita — não rastreia, apenas respeita a preferência
    localStorage.setItem(STORAGE_KEY, "declined");
    setIsVisible(false);
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="cookie-banner"
          role="dialog"
          aria-live="polite"
          aria-label="Aviso de consentimento de cookies"
          /* ── Posicionamento fixo no canto inferior direito ── */
          className="fixed bottom-6 right-6 z-50 max-w-sm w-full p-2"
          /* ── Animação de entrada (slide-up + fade) ── */
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          /* ── Animação de saída (slide-down + fade) ── */
          exit={{ opacity: 0, y: 20, scale: 0.96 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* ── Card de vidro (Glassmorphism) ── */}
          <div
            className={[
              "relative flex flex-col gap-4 p-6 rounded-2xl",
              /* Fundo translúcido + blur */
              "bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl",
              /* Bordas sutis */
              "border border-slate-200 dark:border-slate-700",
              /* Sombra profunda */
              "shadow-2xl",
            ].join(" ")}
          >
            {/* Acento visual teal no topo do card */}
            <div
              aria-hidden="true"
              className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent rounded-full"
            />

            {/* Ícone de cookies (SVG inline — sem dependência extra) */}
            <div className="flex items-start gap-3">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  Sua privacidade importa
                </p>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  Utilizamos cookies para melhorar sua experiência na plataforma
                  e garantir a segurança do seu login. Ao continuar navegando,
                  você concorda com nossa{" "}
                  <a
                    href="/privacidade"
                    className="underline underline-offset-2 text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 transition-colors"
                  >
                    Política de Privacidade
                  </a>
                  .
                </p>
              </div>
            </div>

            {/* Ações */}
            <div className="flex items-center gap-2 justify-end">
              <button
                type="button"
                onClick={handleDecline}
                className={[
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  "text-slate-500 dark:text-slate-400",
                  "hover:bg-slate-100 dark:hover:bg-slate-800",
                ].join(" ")}
              >
                Recusar
              </button>
              <button
                type="button"
                onClick={handleAccept}
                className={[
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  "bg-cyan-500 hover:bg-cyan-600 text-white",
                  "shadow-md shadow-cyan-500/30",
                ].join(" ")}
              >
                Aceitar
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
