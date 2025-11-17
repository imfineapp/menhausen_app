import os
import sys


def fix_mojibake_cp1251_of_utf8(text: str) -> str:
    # Take mojibake text (UTF-8 string that came from UTF-8 bytes misread as cp1251)
    # Re-encode as cp1251 bytes, then decode as UTF-8
    cp1251_bytes = text.encode('cp1251', errors='ignore')
    return cp1251_bytes.decode('utf-8', errors='ignore')


def main():
    if len(sys.argv) != 2:
        print("Usage: python scripts/fix_ui_ru_json.py <relative_path_to_json>")
        sys.exit(1)

    rel_path = sys.argv[1]
    full_path = os.path.abspath(rel_path)

    if not os.path.isfile(full_path):
        print(f"File not found: {full_path}")
        sys.exit(2)

    with open(full_path, 'rb') as f:
        original_bytes = f.read()

    try:
        original_text = original_bytes.decode('utf-8')
    except UnicodeDecodeError:
        print("Input file is not valid UTF-8; aborting to avoid corruption.")
        sys.exit(3)

    fixed_text = fix_mojibake_cp1251_of_utf8(original_text)

    backup_path = full_path + '.bak'
    with open(backup_path, 'wb') as f:
        f.write(original_bytes)

    with open(full_path, 'w', encoding='utf-8', newline='\n') as f:
        f.write(fixed_text)

    print("Fixed:", full_path)
    print("Backup:", backup_path)


if __name__ == '__main__':
    main()











