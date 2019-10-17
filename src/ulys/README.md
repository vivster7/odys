Ulys is a language to quickly draw box-and-arrow diagrams.

Grammar:
expression → arrow ;
arrow → primary ( ( '->' | '<-' | '<->' | '←' | '↑' | '→' | '↓' | '↔' | '↕' | '↖' | '↗' | '↘' | '↙' ) primary )\* ;
primary → CONCEPT | STRING | "[" expression "]"

    program     → expressions* EOF ;

Syntax Nodes:
// leaf nodes
CONCEPT
TEXT

    // branch nodes
    ARROW
    GROUP
