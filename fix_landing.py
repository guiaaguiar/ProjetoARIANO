import re

with open('frontend/src/pages/Landing.tsx', 'r') as f:
    content = f.read()

# 1. Fix the graph labels (remove hardcoded #ffffff and shadow)
old_label = """                          style={{
                            color: isActive ? item.accent : "#ffffff",
                            textShadow: isActive ? `0 0 12px ${item.accent}90` : "0 1px 2px rgba(0,0,0,0.8)",
                          }}
                        >
                          {item.label}
                        </span>"""
new_label = """                          className={`mt-3 text-[11px] text-slate-800 dark:text-slate-300 font-medium tracking-wide transition-all duration-300 ${
                            isActive ? "opacity-100" : "opacity-60 group-hover:opacity-100"
                          }`}
                          style={
                            isActive 
                              ? { color: item.accent, textShadow: `0 0 12px ${item.accent}90` }
                              : undefined
                          }
                        >
                          {item.label}
                        </span>"""

# We need to replace the entire span opening tag to avoid conflicts, let's use regex
content = re.sub(
    r'<span\s+className={`mt-3 text-\[11px\] font-medium tracking-wide transition-all duration-300 \${\s*isActive \? "opacity-100" : "opacity-60 group-hover:opacity-100"\s*}`}\s*style={{\s*color: isActive \? item\.accent : "#ffffff",\s*textShadow: isActive \? `0 0 12px \${item\.accent}90` : "0 1px 2px rgba\(0,0,0,0\.8\)",\s*}}\s*>\s*\{item\.label\}\s*</span>',
    new_label.replace('className={`mt-3 text-[11px] text-slate-800 dark:text-slate-300 font-medium tracking-wide transition-all duration-300 ${', ''),
    content,
    flags=re.MULTILINE
)

# Safer way for label
import textwrap

old_label_full = """                      {!isCenter && (
                        <span
                          className={`mt-3 text-[11px] font-medium tracking-wide transition-all duration-300 ${
                            isActive ? "opacity-100" : "opacity-60 group-hover:opacity-100"
                          }`}
                          style={{
                            color: isActive ? item.accent : "#ffffff",
                            textShadow: isActive ? `0 0 12px ${item.accent}90` : "0 1px 2px rgba(0,0,0,0.8)",
                          }}
                        >
                          {item.label}
                        </span>
                      )}"""

new_label_full = """                      {!isCenter && (
                        <span
                          className={`mt-3 text-[11px] text-slate-800 dark:text-slate-300 font-medium tracking-wide transition-all duration-300 ${
                            isActive ? "opacity-100" : "opacity-60 group-hover:opacity-100"
                          }`}
                          style={
                            isActive 
                              ? { color: item.accent, textShadow: `0 0 12px ${item.accent}90` }
                              : undefined
                          }
                        >
                          {item.label}
                        </span>
                      )}"""

content = content.replace(old_label_full, new_label_full)


# 2. Fix dynamic card paragraphs from text-slate-600 to text-slate-700
content = content.replace(
    '<p className="text-[14px] leading-[1.8] mb-8 text-slate-600 dark:text-slate-300">',
    '<p className="text-[14px] leading-[1.8] mb-8 text-slate-700 dark:text-slate-300">'
)

# 3. Testimonial active text fix
content = content.replace(
    "                      ? 'text-slate-900 dark:text-white/85'\n                      : 'text-slate-300 dark:text-white/30'",
    "                      ? 'text-slate-900 dark:text-white/85'\n                      : 'text-slate-500 dark:text-white/30'"
)

# 4. Make sure Hero Section is exactly text-slate-900 dark:text-white
# It already is, but just in case, we do nothing if it's already there.

with open('frontend/src/pages/Landing.tsx', 'w') as f:
    f.write(content)

