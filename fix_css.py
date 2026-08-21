import sys
import re

with open('client/wall/wall.css', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix masonry
content = content.replace('.ww-shell--classic #notes-container > .pin {\n  display: block;', '.ww-shell--classic #notes-container > .pin {\n  display: inline-block;\n  width: 100%;')
content = content.replace('.ww-shell--modern #notes-container > .pin {\n  display: block;', '.ww-shell--modern #notes-container > .pin {\n  display: inline-block;\n  width: 100%;')

# Fix global CSS leak from Modern section
# The leak starts at "/* ???'???' NOTE CARD    pastel mosaic tone" (around 1908)
# and ends before "/* ???'???' MODALE STORY VIEWER ???'???'" (or we can just replace until end of file)
# The rule is: replace "\n.pin " or "\n.pin:" or "\n.pin." with "\n.ww-shell--modern .pin " 
# BUT ONLY if it doesn't already have a .ww-shell-- prefix

lines = content.split('\n')
start_idx = 0
for i, line in enumerate(lines):
    if 'NOTE CARD' in line and 'pastel mosaic tone' in line:
        start_idx = i
        break

if start_idx > 0:
    for i in range(start_idx, len(lines)):
        # If the line already has .ww-shell--, skip
        if '.ww-shell--' in lines[i]:
            continue
        
        # Replace .pin with .ww-shell--modern .pin
        lines[i] = re.sub(r'^\s*\.pin(?=[\s:.\{>])', '.ww-shell--modern .pin', lines[i])

with open('client/wall/wall.css', 'w', encoding='utf-8') as f:
    f.write('\n'.join(lines))

print('Done')
