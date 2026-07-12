import json
from sympy import simplify, latex
from sympy.parsing.latex import parse_latex

def process_latex(latex_str):
    try:
        # Step 1: Parse LaTeX into a SymPy object
        expr = parse_latex(latex_str)
        # Capture raw string representation of the object
        raw_sympy = str(expr)
        
        # Step 2: Simplify the object
        simplified_expr = simplify(expr.doit())
        # Capture raw string of the simplified object
        raw_simplified_sympy = str(simplified_expr)
        
        # Step 3: Convert the simplified object back to LaTeX
        final_latex = latex(simplified_expr)
        
        # Return all stages as a JSON string
        return json.dumps({
            "success": True,
            "raw_latex": latex_str,
            "raw_sympy": raw_sympy,
            "raw_simplified_sympy": raw_simplified_sympy,
            "final_latex": final_latex
        })
        
    except Exception as e:
        return json.dumps({
            "success": False,
            "error": str(e)
        })