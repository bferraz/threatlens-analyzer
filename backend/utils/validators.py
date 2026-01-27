import base64
import re


def is_valid_base64(data: str) -> bool:
    """
    Validate if a string is valid base64 encoded data.
    
    Args:
        data: String to validate
        
    Returns:
        True if valid base64, False otherwise
    """
    try:
        # Remove whitespace
        data = data.strip()
        
        # Check if it's valid base64
        if re.match(r'^[A-Za-z0-9+/]*={0,2}$', data):
            # Try to decode
            base64.b64decode(data, validate=True)
            return True
        return False
    except Exception:
        return False


def get_base64_size_mb(data: str) -> float:
    """
    Calculate the size of base64 encoded data in MB.
    
    Args:
        data: Base64 encoded string
        
    Returns:
        Size in megabytes
    """
    # Base64 increases size by ~33%, so we calculate original size
    base64_size_bytes = len(data)
    original_size_bytes = (base64_size_bytes * 3) / 4
    size_mb = original_size_bytes / (1024 * 1024)
    return size_mb


def validate_image_data(image_data: str, max_size_mb: int = 10) -> tuple[bool, str]:
    """
    Validate image data.
    
    Args:
        image_data: Base64 encoded image data (with or without data URI prefix)
        max_size_mb: Maximum allowed size in MB
        
    Returns:
        Tuple of (is_valid, error_message)
    """
    if not image_data or len(image_data.strip()) == 0:
        return False, "imageData cannot be empty"
    
    # Remove data URI prefix if present (e.g., "data:image/jpeg;base64,")
    if image_data.startswith('data:'):
        try:
            image_data = image_data.split(',', 1)[1]
        except IndexError:
            return False, "Invalid data URI format"
    
    # Validate base64
    if not is_valid_base64(image_data):
        return False, "imageData is not valid base64"
    
    # Check size
    size_mb = get_base64_size_mb(image_data)
    if size_mb > max_size_mb:
        return False, f"Image size ({size_mb:.2f}MB) exceeds maximum allowed size ({max_size_mb}MB)"
    
    return True, ""


def validate_mermaid_code(mermaid_code: str) -> tuple[bool, str]:
    """
    Validate Mermaid diagram code.
    
    Args:
        mermaid_code: Mermaid code to validate
        
    Returns:
        Tuple of (is_valid, error_message)
    """
    if not mermaid_code or len(mermaid_code.strip()) == 0:
        return False, "mermaidText cannot be empty"
    
    # Basic validation - check for common Mermaid keywords
    mermaid_keywords = [
        'graph', 'flowchart', 'sequenceDiagram', 'classDiagram',
        'stateDiagram', 'erDiagram', 'gantt', 'pie', 'journey',
        '-->', '---', '-.-', '==>', 'subgraph'
    ]
    
    has_keyword = any(keyword in mermaid_code for keyword in mermaid_keywords)
    
    if not has_keyword:
        return False, "mermaidText does not appear to contain valid Mermaid syntax"
    
    return True, ""
