#!/usr/bin/env python3
"""
Script to remove all animations from globals.css
"""

def remove_animations_from_css(input_file, output_file):
    with open(input_file, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    # Define ranges to skip (1-indexed as per user requirements, convert to 0-indexed)
    skip_ranges = [
        (56, 61),      # Animation timing variables (lines 57-61 in 1-indexed)
        (420, 652),    # All animation classes and @keyframes (lines 421-652)
        (654, 659),    # *:focus-visible animation (lines 655-659)
        (661, 664),    # smooth scroll behavior (lines 662-664)
        (1030, 1152),  # 3D car card animations (lines 1031-1152)
        (1263, 1539),  # Glassmorphic animations (lines 1264-1539)
        (1628, 1710),  # Verified badge animations (lines 1629-1710)
        (1714, 1802),  # Featured ribbon animations (lines 1715-1802)
        (5412, 5584),  # Toast notification animations (lines 5413-5584)
        (5589, 5850),  # Loading screen animations (lines 5590-5850)
    ]

    # Convert to 0-indexed and create a set of lines to skip
    skip_lines = set()
    for start, end in skip_ranges:
        for line_num in range(start, end + 1):
            skip_lines.add(line_num)

    # Write output, skipping specified lines
    with open(output_file, 'w', encoding='utf-8') as f:
        for i, line in enumerate(lines, 1):
            if i not in skip_lines:
                f.write(line)

    print(f"Removed {len(skip_lines)} lines of animations")
    print(f"Output written to {output_file}")

if __name__ == "__main__":
    input_file = "C:\\Users\\hp\\OneDrive\\Pictures\\Echo\\201401__\\OneDrive\\Echo\\leanring folder\\Justcars.ng\\justcars.ng\\app\\globals.css"
    output_file = "C:\\Users\\hp\\OneDrive\\Pictures\\Echo\\201401__\\OneDrive\\Echo\\leanring folder\\Justcars.ng\\justcars.ng\\app\\globals_new.css"
    remove_animations_from_css(input_file, output_file)
