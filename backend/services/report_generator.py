import os
from datetime import datetime
from typing import Dict, Any
from pathlib import Path
from config.settings import settings
from models.response_models import AnalysisResponse
import markdown
import asyncio
import aiofiles

# WeasyPrint é opcional - se não estiver disponível, apenas Markdown funcionará
try:
    from weasyprint import HTML
    WEASYPRINT_AVAILABLE = True
except Exception as e:
    print(f"⚠️  WeasyPrint not available: {e}")
    print("📄 PDF generation will be disabled. Only Markdown reports will work.")
    WEASYPRINT_AVAILABLE = False


class ReportGenerator:
    """Service for generating analysis reports."""
    
    def __init__(self):
        """Initialize report generator."""
        self.reports_dir = Path(settings.reports_dir)
        self.reports_dir.mkdir(exist_ok=True)
    
    async def generate_report(
        self,
        analysis: AnalysisResponse,
        format: str = "markdown"
    ) -> str:
        """
        Generate a report from analysis results.
        
        Args:
            analysis: Analysis results
            format: Report format ('markdown' or 'pdf')
            
        Returns:
            Path to generated report file
        """
        # Extract report ID from download URL
        report_filename = analysis.reportDownloadUrl.split("/")[-1]
        report_path = self.reports_dir / report_filename
        
        # Generate markdown content
        markdown_content = self._generate_markdown(analysis)
        
        if format == "markdown":
            # Save markdown file
            async with aiofiles.open(report_path, 'w', encoding='utf-8') as f:
                await f.write(markdown_content)
            return str(report_path)
        
        else:  # pdf
            if not WEASYPRINT_AVAILABLE:
                print("❌ PDF generation failed: WeasyPrint is not available")
                raise Exception(
                    "PDF generation is not available. WeasyPrint library is not installed or missing dependencies. "
                    "Please use 'markdown' format instead, or install GTK+ for Windows from: "
                    "https://github.com/tschoonj/GTK-for-Windows-Runtime-Environment-Installer/releases"
                )
            
            print(f"📄 Generating PDF report: {report_path}")
            
            # Convert markdown to HTML then to PDF
            html_content = markdown.markdown(markdown_content, extensions=['tables', 'fenced_code'])
            
            # Add CSS styling
            styled_html = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <style>
                    body {{
                        font-family: Arial, sans-serif;
                        line-height: 1.6;
                        max-width: 800px;
                        margin: 0 auto;
                        padding: 20px;
                    }}
                    h1 {{
                        color: #2c3e50;
                        border-bottom: 3px solid #3498db;
                        padding-bottom: 10px;
                    }}
                    h2 {{
                        color: #34495e;
                        border-bottom: 2px solid #95a5a6;
                        padding-bottom: 5px;
                        margin-top: 30px;
                    }}
                    h3 {{
                        color: #7f8c8d;
                    }}
                    .severity-high {{
                        color: #e74c3c;
                        font-weight: bold;
                    }}
                    .severity-medium {{
                        color: #f39c12;
                        font-weight: bold;
                    }}
                    .severity-low {{
                        color: #95a5a6;
                    }}
                    .threat {{
                        background-color: #ecf0f1;
                        padding: 15px;
                        margin: 10px 0;
                        border-left: 4px solid #e74c3c;
                    }}
                    .mitigation {{
                        background-color: #d5f4e6;
                        padding: 15px;
                        margin: 10px 0;
                        border-left: 4px solid #27ae60;
                    }}
                    table {{
                        border-collapse: collapse;
                        width: 100%;
                        margin: 20px 0;
                    }}
                    th, td {{
                        border: 1px solid #bdc3c7;
                        padding: 10px;
                        text-align: left;
                    }}
                    th {{
                        background-color: #3498db;
                        color: white;
                    }}
                    code {{
                        background-color: #f8f9fa;
                        padding: 2px 5px;
                        border-radius: 3px;
                        font-family: 'Courier New', monospace;
                    }}
                </style>
            </head>
            <body>
                {html_content}
            </body>
            </html>
            """
            
            # Generate PDF
            try:
                await asyncio.to_thread(
                    HTML(string=styled_html).write_pdf,
                    report_path
                )
                print(f"✅ PDF report generated successfully: {report_path}")
            except Exception as pdf_error:
                print(f"❌ PDF generation error: {pdf_error}")
                raise Exception(f"Failed to generate PDF: {pdf_error}")
            
            return str(report_path)
    
    def _generate_markdown(self, analysis: AnalysisResponse) -> str:
        """Generate markdown content from analysis results."""
        
        md = f"""# STRIDE Threat Analysis Report

**Generated:** {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}

---

## Executive Summary

This report presents a comprehensive STRIDE threat analysis of the provided architecture diagram.

- **Components Identified:** {len(analysis.components)}
- **Data Flows Mapped:** {len(analysis.data_flows)}
- **Threats Identified:** {len(analysis.threats)}
- **Mitigations Suggested:** {len(analysis.mitigations)}

---

## 1. Architecture Components

The following components were identified in the architecture:

"""
        
        # Components table
        md += "| ID | Name | Type | Trust Zone | Confidence |\n"
        md += "|---|---|---|---|---|\n"
        for comp in analysis.components:
            md += f"| `{comp.id}` | {comp.name} | {comp.type} | {comp.trust_zone} | {comp.confidence:.2f} |\n"
        
        md += "\n---\n\n## 2. Data Flows\n\n"
        md += "The following data flows were identified between components:\n\n"
        
        for i, flow in enumerate(analysis.data_flows, 1):
            md += f"### Flow {i}: {flow.from_} → {flow.to}\n\n"
            md += f"- **Protocol:** {flow.protocol}\n"
            md += f"- **Direction:** {flow.direction}\n"
            md += f"- **Data Types:** {', '.join(flow.data_types)}\n"
            md += f"- **Confidence:** {flow.confidence:.2f}\n\n"
        
        md += "---\n\n## 3. STRIDE Threat Analysis\n\n"
        
        # Group threats by category
        threat_categories = {
            "S": ("Spoofing (Identity Forgery)", []),
            "T": ("Tampering (Data Integrity)", []),
            "R": ("Repudiation (Non-repudiation)", []),
            "I": ("Information Disclosure (Confidentiality)", []),
            "D": ("Denial of Service (Availability)", []),
            "E": ("Elevation of Privilege (Authorization)", [])
        }
        
        for threat in analysis.threats:
            threat_categories[threat.category][1].append(threat)
        
        for cat, (cat_name, threats) in threat_categories.items():
            if threats:
                md += f"### {cat_name}\n\n"
                for threat in threats:
                    severity_badge = threat.severity.upper()
                    md += f"#### [{severity_badge}] {threat.title}\n\n"
                    md += f"**Target:** `{threat.targetId}`\n\n"
                    md += f"{threat.description}\n\n"
        
        md += "---\n\n## 4. Recommended Mitigations\n\n"
        
        for mitigation in analysis.mitigations:
            md += f"### {mitigation.title}\n\n"
            md += f"**Target Component:** `{mitigation.targetId}`\n\n"
            md += "**Implementation Steps:**\n\n"
            for i, step in enumerate(mitigation.steps, 1):
                md += f"{i}. {step}\n"
            md += "\n"
        
        if analysis.assumptions:
            md += "---\n\n## 5. Assumptions\n\n"
            md += "The following assumptions were made during the analysis:\n\n"
            for assumption in analysis.assumptions:
                md += f"- {assumption}\n"
            md += "\n"
        
        if analysis.uncertainties:
            md += "---\n\n## 6. Uncertainties\n\n"
            md += "The following aspects require clarification:\n\n"
            for uncertainty in analysis.uncertainties:
                md += f"- {uncertainty}\n"
            md += "\n"
        
        md += """---

## STRIDE Categories Reference

- **S - Spoofing:** Identity forgery, authentication attacks
- **T - Tampering:** Data integrity violations, unauthorized modifications
- **R - Repudiation:** Lack of audit trails, non-repudiation failures
- **I - Information Disclosure:** Confidentiality breaches, data leaks
- **D - Denial of Service:** Availability attacks, resource exhaustion
- **E - Elevation of Privilege:** Authorization failures, privilege escalation

---

*This report was automatically generated by ThreatLens Analyzer*
"""
        
        return md
    
    async def get_report(self, report_filename: str) -> str:
        """
        Get the path to a generated report.
        
        Args:
            report_filename: Name of the report file
            
        Returns:
            Path to the report file
        """
        report_path = self.reports_dir / report_filename
        if not report_path.exists():
            raise FileNotFoundError(f"Report not found: {report_filename}")
        return str(report_path)


# Global report generator instance
report_generator = ReportGenerator()
