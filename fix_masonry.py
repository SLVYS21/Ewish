import sys

with open('client/wall/wall.css', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('.ww-shell--classic #notes-container > .pin {\n      display: block;', '.ww-shell--classic #notes-container > .pin {\n      display: inline-block;\n      width: 100%;')
content = content.replace('.ww-shell--modern #notes-container > .pin {\n      display: block;', '.ww-shell--modern #notes-container > .pin {\n      display: inline-block;\n      width: 100%;')

with open('client/wall/wall.css', 'w', encoding='utf-8') as f:
    f.write(content)

print('Done')
