with open('frontend/src/pages/Landing.tsx', 'r') as f:
    content = f.read()

# Fix header
content = content.replace(
    'border-slate-200/80 dark:border-white/10',
    'border-slate-200 dark:border-white/10'
)

# Fix descriptions in profile intelligence
content = content.replace(
    'text-slate-600 dark:text-slate-300',
    'text-slate-600 dark:text-slate-400'
)

with open('frontend/src/pages/Landing.tsx', 'w') as f:
    f.write(content)

