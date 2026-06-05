import re

with open('frontend/src/pages/Landing.tsx', 'r') as f:
    content = f.read()

# 1. Global Text Corrections
content = content.replace('text-slate-500', 'text-slate-600')
content = content.replace('dark:text-white/50', 'dark:text-slate-300')
content = content.replace('text-slate-800', 'text-slate-900') # Some titles were text-slate-800
# Wait, for the "Textos principais estão invisíveis", maybe there's a missing dark: prefix somewhere? Let's check text-white.
# Oh, the instruction says: "ATENÇÃO: Nos botões flutuantes 3D do grafo, os ÍCONES devem permanecer BRANCOS (text-white) independente do tema"
# So I need to ensure the graph icons have text-white! Let's do that separately.

# 2. Refactoring "Meus Matches" window
# Sidebar background
content = content.replace(
    'border-slate-200 bg-slate-50/90 dark:border-white/[0.06] dark:bg-[#0a0f18]',
    'border-white/50 bg-white/40 dark:border-white/[0.06] dark:bg-[#0a0f18]/40'
)
# Top controls background
content = content.replace(
    'bg-slate-100/80 border-slate-200 dark:bg-[#060c14]/40 dark:border-white/[0.06]',
    'bg-white/40 border-white/50 dark:bg-[#060c14]/40 dark:border-white/[0.06]'
)
# Menu items
content = content.replace(
    'text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:text-white/40 dark:hover:text-white dark:hover:bg-white/5',
    'text-slate-500 hover:text-slate-900 hover:bg-slate-200/50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5'
)
# List items
content = content.replace(
    'border-slate-100 hover:bg-slate-50 dark:border-white/[0.06] dark:hover:bg-white/[0.03]',
    'border-slate-200/50 hover:bg-slate-200/50 dark:border-white/[0.06] dark:hover:bg-white/5'
)

# 3. Header & Footer
# Header bg
content = content.replace(
    'bg-white/80 dark:bg-[#020810]/80 backdrop-blur-md border-slate-200/80',
    'bg-white/80 dark:bg-[#020810]/80 backdrop-blur-md border-slate-200/80' # no change? 
)
# Make sure the CTA button is correctly inverted:
# Already has `bg-slate-900 text-white dark:bg-white dark:text-slate-900`, I will check later.

# 4. Graph Icons -> text-white
icon_target = """                        <Icon
                          className={isCenter ? "w-7 h-7" : "w-6 h-6"}
                          style={{
                            color: isActive ? item.accent : (isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.6)"),
                            filter: isActive ? `drop-shadow(0 0 8px ${item.accent})` : "none",
                          }}
                        />"""
icon_replacement = """                        <Icon
                          className={`${isCenter ? "w-7 h-7" : "w-6 h-6"} text-white`}
                          style={{
                            color: isActive ? item.accent : "#ffffff",
                            filter: isActive ? `drop-shadow(0 0 8px ${item.accent})` : "none",
                          }}
                        />"""
content = content.replace(icon_target, icon_replacement)

# Graph Labels
label_target = """                          className="text-[10px] font-semibold text-center leading-tight max-w-[80px]"
                          style={{
                            color: isActive ? item.accent : (isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.6)"),
                            textShadow: isActive ? `0 0 12px ${item.accent}90` : "none",
                          }}"""
label_replacement = """                          className="text-[10px] font-semibold text-center leading-tight max-w-[80px]"
                          style={{
                            color: isActive ? item.accent : "#ffffff",
                            textShadow: isActive ? `0 0 12px ${item.accent}90` : "0 1px 2px rgba(0,0,0,0.8)",
                          }}"""
content = content.replace(label_target, label_replacement)

# Center Label
content = content.replace('text-cyan-400/90 text-center mt-1', 'text-white text-center mt-1')

# For the MacOS window, the issue was "Janela de Matches (Mockup do macOS) na primeira tela está totalmente escura/quebrada no modo claro".
# Wait, look at the previous class for that window!
# `className="relative z-10 rounded-t-xl overflow-hidden bg-white/70 backdrop-blur-2xl border border-white/50 shadow-xl dark:bg-[#1a1a1a]/60 dark:border-white/10 dark:shadow-2xl"`
# It already had `bg-white/70`... Maybe the inner sidebars were dark? Yes, they were `bg-slate-50/90` which is light, but wait!
# If it was "totalmente escura/quebrada no modo claro", maybe `bg-slate-50` was somehow broken or inheriting text-white?
# Ah! I know! If the parent has `text-white` applied to it via some bug?
# No, `App.tsx` probably sets `dark` mode globally, and the user switches it.
# Let's ensure text colors inside the Mockup explicitly declare dark/light.

# Ensure header logo text is correct
content = content.replace('text-slate-800 dark:text-white', 'text-slate-900 dark:text-white')

with open('frontend/src/pages/Landing.tsx', 'w') as f:
    f.write(content)
