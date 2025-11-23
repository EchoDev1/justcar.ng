import json
import os
import sys

# Read the JSONL file
jsonl_path = sys.argv[1] if len(sys.argv) > 1 else "17b22092-67b1-4361-8334-fed6cbf80c35.jsonl"
base_path = "C:\\Users\\hp\\OneDrive\\Pictures\\Echo\\201401__\\OneDrive\\Echo\\leanring folder\\Justcars.ng\\justcars.ng"

files_extracted = {}

with open(jsonl_path, 'r', encoding='utf-8') as f:
    for line in f:
        try:
            data = json.loads(line)

            # Check if this is a tool result with Write tool
            if 'content' in data and isinstance(data['content'], list):
                for item in data['content']:
                    if isinstance(item, dict) and item.get('type') == 'tool_use':
                        if item.get('name') == 'Write' and 'input' in item:
                            file_path = item['input'].get('file_path', '')
                            content = item['input'].get('content', '')

                            if file_path and content:
                                # Convert to relative path
                                if base_path in file_path:
                                    rel_path = file_path.replace(base_path + "\\", "")
                                    files_extracted[rel_path] = content
                                    print(f"Found: {rel_path}")
        except json.JSONDecodeError:
            continue
        except Exception as e:
            continue

print(f"\n\nTotal files found: {len(files_extracted)}")
print("\nFiles to restore:")
for filepath in sorted(files_extracted.keys()):
    print(f"  - {filepath}")

# Write files
restored_count = 0
for rel_path, content in files_extracted.items():
    full_path = os.path.join("justcars.ng", rel_path)

    # Create directory if needed
    dir_path = os.path.dirname(full_path)
    if dir_path:
        os.makedirs(dir_path, exist_ok=True)

    # Write file
    with open(full_path, 'w', encoding='utf-8') as f:
        f.write(content)
    restored_count += 1
    print(f"Restored: {rel_path}")

print(f"\n✓ Successfully restored {restored_count} files!")
