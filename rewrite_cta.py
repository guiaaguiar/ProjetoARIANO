import re

with open('frontend/src/pages/Landing.tsx', 'r') as f:
    content = f.read()

# Make the Cadastrar-se button correctly inverted
target_button = '<button className="text-[13px] h-8 px-3 border transition-colors border-slate-300 text-slate-700 hover:bg-slate-900 hover:text-white dark:border-white/20 dark:text-white dark:hover:bg-white dark:hover:text-black">'
new_button = '<button className="text-[13px] h-8 px-4 rounded-lg font-medium transition-colors bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100">'

content = content.replace(target_button, new_button)

with open('frontend/src/pages/Landing.tsx', 'w') as f:
    f.write(content)
