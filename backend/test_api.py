"""
Test script for ThreatLens Analyzer API

This script demonstrates how to use the API with both image and Mermaid inputs.
"""

import requests
import json
import base64
from pathlib import Path


# API Configuration
API_URL = "http://localhost:5000"
ANALYZE_ENDPOINT = f"{API_URL}/api/analyze"


def test_mermaid_analysis():
    """Test analysis with Mermaid diagram code."""
    
    print("\n" + "="*60)
    print("Testing Mermaid Diagram Analysis")
    print("="*60 + "\n")
    
    # Sample Mermaid code
    mermaid_code = """
    graph TD
        User[User/Client] -->|HTTPS| WebApp[Web Application]
        WebApp -->|REST API| APIGateway[API Gateway]
        APIGateway -->|gRPC| AuthService[Auth Service]
        APIGateway -->|gRPC| DataService[Data Service]
        AuthService -->|SQL| AuthDB[(Auth Database)]
        DataService -->|SQL| DataDB[(Data Database)]
        DataService -->|AMQP| Queue[Message Queue]
        Queue -->|AMQP| Worker[Background Worker]
        Worker -->|SQL| DataDB
        APIGateway -->|Redis Protocol| Cache[(Redis Cache)]
    """
    
    # Request payload
    payload = {
        "inputType": "mermaid",
        "mermaidText": mermaid_code,
        "analysisDepth": "full",
        "reportFormat": "markdown",
        "includeSeverity": True,
        "includeAssumptions": True
    }
    
    print("Sending request to API...")
    print(f"Analysis Depth: {payload['analysisDepth']}")
    print(f"Report Format: {payload['reportFormat']}\n")
    
    try:
        response = requests.post(ANALYZE_ENDPOINT, json=payload, timeout=60)
        response.raise_for_status()
        
        result = response.json()
        
        print("✅ Analysis completed successfully!\n")
        print(f"Components identified: {len(result['components'])}")
        print(f"Data flows mapped: {len(result['data_flows'])}")
        print(f"Threats identified: {len(result['threats'])}")
        print(f"Mitigations suggested: {len(result['mitigations'])}")
        print(f"\nReport available at: {API_URL}{result['reportDownloadUrl']}")
        
        # Display some threat examples
        print("\n" + "-"*60)
        print("Sample Threats Identified:")
        print("-"*60)
        for i, threat in enumerate(result['threats'][:3], 1):
            print(f"\n{i}. [{threat['category']}] {threat['title']}")
            print(f"   Target: {threat['targetId']}")
            print(f"   Severity: {threat['severity'].upper()}")
            print(f"   Description: {threat['description'][:100]}...")
        
        # Save response to file
        with open("test_mermaid_response.json", "w", encoding="utf-8") as f:
            json.dump(result, f, indent=2, ensure_ascii=False)
        print("\n\n📄 Full response saved to: test_mermaid_response.json")
        
        return result
        
    except requests.exceptions.Timeout:
        print("❌ Error: Request timed out")
        return None
    except requests.exceptions.RequestException as e:
        print(f"❌ Error: {e}")
        if hasattr(e.response, 'text'):
            print(f"Response: {e.response.text}")
        return None


def test_image_analysis(image_path: str):
    """Test analysis with image file."""
    
    print("\n" + "="*60)
    print("Testing Image Diagram Analysis")
    print("="*60 + "\n")
    
    # Check if image exists
    if not Path(image_path).exists():
        print(f"❌ Error: Image file not found: {image_path}")
        print("Please provide a valid image path")
        return None
    
    # Read and encode image
    print(f"Reading image: {image_path}")
    with open(image_path, "rb") as image_file:
        image_data = base64.b64encode(image_file.read()).decode('utf-8')
    
    print(f"Image size: {len(image_data) / 1024:.2f} KB (base64)\n")
    
    # Request payload
    payload = {
        "inputType": "image",
        "imageData": image_data,
        "imageFileName": Path(image_path).name,
        "analysisDepth": "full",
        "reportFormat": "pdf",
        "includeSeverity": True,
        "includeAssumptions": True
    }
    
    print("Sending request to API...")
    print(f"Analysis Depth: {payload['analysisDepth']}")
    print(f"Report Format: {payload['reportFormat']}\n")
    
    try:
        response = requests.post(ANALYZE_ENDPOINT, json=payload, timeout=60)
        response.raise_for_status()
        
        result = response.json()
        
        print("✅ Analysis completed successfully!\n")
        print(f"Components identified: {len(result['components'])}")
        print(f"Data flows mapped: {len(result['data_flows'])}")
        print(f"Threats identified: {len(result['threats'])}")
        print(f"Mitigations suggested: {len(result['mitigations'])}")
        print(f"\nReport available at: {API_URL}{result['reportDownloadUrl']}")
        
        # Save response to file
        with open("test_image_response.json", "w", encoding="utf-8") as f:
            json.dump(result, f, indent=2, ensure_ascii=False)
        print("\n📄 Full response saved to: test_image_response.json")
        
        return result
        
    except requests.exceptions.Timeout:
        print("❌ Error: Request timed out")
        return None
    except requests.exceptions.RequestException as e:
        print(f"❌ Error: {e}")
        if hasattr(e.response, 'text'):
            print(f"Response: {e.response.text}")
        return None


def test_quick_analysis():
    """Test quick analysis (high severity threats only)."""
    
    print("\n" + "="*60)
    print("Testing Quick Analysis (High Severity Only)")
    print("="*60 + "\n")
    
    mermaid_code = """
    graph LR
        Internet[Internet] -->|HTTPS| LB[Load Balancer]
        LB -->|HTTP| App[Application Server]
        App -->|TCP| DB[(Database)]
    """
    
    payload = {
        "inputType": "mermaid",
        "mermaidText": mermaid_code,
        "analysisDepth": "quick",
        "reportFormat": "markdown",
        "includeSeverity": True,
        "includeAssumptions": False
    }
    
    print("Sending request to API...")
    
    try:
        response = requests.post(ANALYZE_ENDPOINT, json=payload, timeout=60)
        response.raise_for_status()
        
        result = response.json()
        
        print("✅ Quick analysis completed!\n")
        print(f"Threats identified: {len(result['threats'])}")
        
        # Count high severity threats
        high_severity = [t for t in result['threats'] if t['severity'] == 'high']
        print(f"High severity threats: {len(high_severity)}")
        
        return result
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Error: {e}")
        return None


def download_report(report_url: str, output_filename: str):
    """Download generated report."""
    
    print(f"\nDownloading report from: {report_url}")
    
    try:
        response = requests.get(f"{API_URL}{report_url}", timeout=30)
        response.raise_for_status()
        
        with open(output_filename, "wb") as f:
            f.write(response.content)
        
        print(f"✅ Report downloaded: {output_filename}")
        return True
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Error downloading report: {e}")
        return False


def main():
    """Main test function."""
    
    print("\n" + "="*60)
    print("ThreatLens Analyzer API - Test Script")
    print("="*60)
    print("\nMake sure the API is running on http://localhost:5000")
    print("Start the API with: python main.py\n")
    
    input("Press Enter to start tests...")
    
    # Test 1: Mermaid analysis
    result = test_mermaid_analysis()
    if result:
        # Download the report
        download_report(result['reportDownloadUrl'], "test_report.md")
    
    input("\nPress Enter to continue to next test...")
    
    # Test 2: Quick analysis
    test_quick_analysis()
    
    # Test 3: Image analysis (optional - user needs to provide image)
    print("\n" + "="*60)
    print("Image Analysis Test (Optional)")
    print("="*60)
    image_path = input("\nEnter path to architecture diagram image (or press Enter to skip): ").strip()
    
    if image_path:
        result = test_image_analysis(image_path)
        if result:
            download_report(result['reportDownloadUrl'], "test_report.pdf")
    
    print("\n" + "="*60)
    print("All tests completed!")
    print("="*60 + "\n")


if __name__ == "__main__":
    main()
