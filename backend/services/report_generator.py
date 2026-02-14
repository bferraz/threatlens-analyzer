import os
from datetime import datetime
from typing import Dict, Any
from pathlib import Path
from io import BytesIO
from config.settings import settings
from models.response_models import AnalysisResponse
import markdown
import asyncio
import aiofiles

# Tentar importar xhtml2pdf (alternativa que funciona sem GTK+)
try:
    from xhtml2pdf import pisa
    PDF_GENERATOR = "xhtml2pdf"
    PDF_AVAILABLE = True
    print("✅ PDF generation available via xhtml2pdf")
except Exception as e:
    print(f"⚠️  xhtml2pdf not available: {e}")
    # Fallback para WeasyPrint
    try:
        from weasyprint import HTML
        PDF_GENERATOR = "weasyprint"
        PDF_AVAILABLE = True
        print("✅ PDF generation available via WeasyPrint")
    except Exception as e2:
        print(f"⚠️  WeasyPrint not available: {e2}")
        print("📄 PDF generation will be disabled. Only Markdown reports will work.")
        PDF_GENERATOR = None
        PDF_AVAILABLE = False


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
            if not PDF_AVAILABLE:
                print("❌ PDF generation failed: No PDF library available")
                raise Exception(
                    "PDF generation is not available. Please install xhtml2pdf: pip install xhtml2pdf"
                )
            
            # Change extension to .pdf
            pdf_report_path = report_path.with_suffix('.pdf')
            print(f"📄 Generating PDF report with {PDF_GENERATOR}: {pdf_report_path}")
            
            # Convert markdown to HTML then to PDF
            html_content = markdown.markdown(markdown_content, extensions=['tables', 'fenced_code'])
            
            # Add CSS styling (compatible with xhtml2pdf)
            styled_html = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <style>
                    @page {{
                        size: A4;
                        margin: 2cm;
                    }}
                    body {{
                        font-family: Helvetica, Arial, sans-serif;
                        font-size: 11pt;
                        line-height: 1.5;
                        color: #333;
                    }}
                    h1 {{
                        color: #2c3e50;
                        border-bottom: 3px solid #3498db;
                        padding-bottom: 10px;
                        font-size: 22pt;
                        margin-top: 0;
                    }}
                    h2 {{
                        color: #34495e;
                        border-bottom: 2px solid #95a5a6;
                        padding-bottom: 5px;
                        margin-top: 25px;
                        font-size: 16pt;
                    }}
                    h3 {{
                        color: #7f8c8d;
                        font-size: 13pt;
                        margin-top: 15px;
                    }}
                    h4 {{
                        color: #555;
                        font-size: 11pt;
                        margin-top: 10px;
                    }}
                    p {{
                        margin: 8px 0;
                    }}
                    ul, ol {{
                        margin: 10px 0;
                        padding-left: 25px;
                    }}
                    li {{
                        margin: 5px 0;
                    }}
                    table {{
                        border-collapse: collapse;
                        width: 100%;
                        margin: 15px 0;
                        font-size: 9pt;
                    }}
                    th, td {{
                        border: 1px solid #bdc3c7;
                        padding: 8px;
                        text-align: left;
                    }}
                    th {{
                        background-color: #3498db;
                        color: white;
                        font-weight: bold;
                    }}
                    tr:nth-child(even) {{
                        background-color: #f8f9fa;
                    }}
                    code {{
                        background-color: #f4f4f4;
                        padding: 2px 6px;
                        border-radius: 3px;
                        font-family: Courier, monospace;
                        font-size: 9pt;
                    }}
                    pre {{
                        background-color: #f4f4f4;
                        padding: 10px;
                        border-radius: 5px;
                        overflow-x: auto;
                        font-size: 9pt;
                    }}
                    hr {{
                        border: none;
                        border-top: 1px solid #ddd;
                        margin: 20px 0;
                    }}
                    .header {{
                        text-align: center;
                        margin-bottom: 30px;
                    }}
                    .footer {{
                        text-align: center;
                        font-size: 9pt;
                        color: #888;
                        margin-top: 30px;
                        border-top: 1px solid #ddd;
                        padding-top: 10px;
                    }}
                </style>
            </head>
            <body>
                {html_content}
                <div class="footer">
                    <p>Gerado por ThreatLens Analyzer - {datetime.now().strftime("%d/%m/%Y %H:%M:%S")}</p>
                </div>
            </body>
            </html>
            """
            
            # Generate PDF based on available library
            try:
                if PDF_GENERATOR == "xhtml2pdf":
                    # Use xhtml2pdf
                    def generate_pdf_xhtml2pdf():
                        with open(pdf_report_path, "wb") as pdf_file:
                            pisa_status = pisa.CreatePDF(
                                styled_html,
                                dest=pdf_file,
                                encoding='utf-8'
                            )
                            return pisa_status.err
                    
                    error = await asyncio.to_thread(generate_pdf_xhtml2pdf)
                    if error:
                        raise Exception(f"xhtml2pdf returned error code: {error}")
                else:
                    # Use WeasyPrint as fallback
                    await asyncio.to_thread(
                        HTML(string=styled_html).write_pdf,
                        pdf_report_path
                    )
                
                print(f"✅ PDF report generated successfully: {pdf_report_path}")
            except Exception as pdf_error:
                print(f"❌ PDF generation error: {pdf_error}")
                raise Exception(f"Failed to generate PDF: {pdf_error}")
            
            return str(pdf_report_path)
    
    def _generate_markdown(self, analysis: AnalysisResponse) -> str:
        """Generate markdown content from analysis results."""
        
        md = f"""# Relatório de Análise de Ameaças STRIDE

**Data de Geração:** {datetime.now().strftime("%d/%m/%Y às %H:%M:%S")}

---

## Resumo Executivo

Este relatório apresenta uma análise completa de ameaças STRIDE do diagrama de arquitetura fornecido.

- **Componentes Identificados:** {len(analysis.components)}
- **Fluxos de Dados Mapeados:** {len(analysis.data_flows)}
- **Ameaças Identificadas:** {len(analysis.threats)}
- **Mitigações Sugeridas:** {len(analysis.mitigations)}

---

## 1. Componentes da Arquitetura

Os seguintes componentes foram identificados na arquitetura:

"""
        
        # Components table
        md += "| ID | Nome | Tipo | Zona de Confiança | Confiança |\n"
        md += "|---|---|---|---|---|\n"
        for comp in analysis.components:
            md += f"| `{comp.id}` | {comp.name} | {comp.type} | {comp.trust_zone} | {comp.confidence:.0%} |\n"
        
        md += "\n---\n\n## 2. Fluxos de Dados\n\n"
        md += "Os seguintes fluxos de dados foram identificados entre os componentes:\n\n"
        
        for i, flow in enumerate(analysis.data_flows, 1):
            md += f"### Fluxo {i}: {flow.from_} → {flow.to}\n\n"
            md += f"- **Protocolo:** {flow.protocol}\n"
            md += f"- **Direção:** {flow.direction}\n"
            md += f"- **Tipos de Dados:** {', '.join(flow.data_types)}\n"
            md += f"- **Confiança:** {flow.confidence:.0%}\n\n"
        
        md += "---\n\n## 3. Análise de Ameaças STRIDE\n\n"
        
        # Group threats by category
        threat_categories = {
            "S": ("Spoofing (Falsificação de Identidade)", []),
            "T": ("Tampering (Adulteração de Dados)", []),
            "R": ("Repudiation (Repúdio)", []),
            "I": ("Information Disclosure (Vazamento de Informações)", []),
            "D": ("Denial of Service (Negação de Serviço)", []),
            "E": ("Elevation of Privilege (Elevação de Privilégios)", [])
        }
        
        for threat in analysis.threats:
            threat_categories[threat.category][1].append(threat)
        
        # Translate severity levels
        severity_translation = {
            "critical": "CRÍTICO",
            "high": "ALTO",
            "medium": "MÉDIO",
            "low": "BAIXO"
        }
        
        for cat, (cat_name, threats) in threat_categories.items():
            if threats:
                md += f"### {cat_name}\n\n"
                for threat in threats:
                    severity_badge = severity_translation.get(threat.severity.lower(), threat.severity.upper())
                    md += f"#### [{severity_badge}] {threat.title}\n\n"
                    md += f"**Alvo:** `{threat.targetId}`\n\n"
                    md += f"{threat.description}\n\n"
        
        md += "---\n\n## 4. Mitigações Recomendadas\n\n"
        
        for mitigation in analysis.mitigations:
            md += f"### {mitigation.title}\n\n"
            md += f"**Componente Alvo:** `{mitigation.targetId}`\n\n"
            md += "**Passos de Implementação:**\n\n"
            for i, step in enumerate(mitigation.steps, 1):
                md += f"{i}. {step}\n"
            md += "\n"
        
        if analysis.assumptions:
            md += "---\n\n## 5. Suposições\n\n"
            md += "As seguintes suposições foram feitas durante a análise:\n\n"
            for assumption in analysis.assumptions:
                md += f"- {assumption}\n"
            md += "\n"
        
        if analysis.uncertainties:
            md += "---\n\n## 6. Incertezas\n\n"
            md += "Os seguintes aspectos precisam de esclarecimento:\n\n"
            for uncertainty in analysis.uncertainties:
                md += f"- {uncertainty}\n"
            md += "\n"
        
        md += """---

## Referência das Categorias STRIDE

- **S - Spoofing (Falsificação):** Falsificação de identidade, ataques de autenticação
- **T - Tampering (Adulteração):** Violações de integridade de dados, modificações não autorizadas
- **R - Repudiation (Repúdio):** Falta de trilhas de auditoria, falhas de não-repúdio
- **I - Information Disclosure (Vazamento):** Violações de confidencialidade, vazamento de dados
- **D - Denial of Service (Negação de Serviço):** Ataques de disponibilidade, esgotamento de recursos
- **E - Elevation of Privilege (Elevação de Privilégios):** Falhas de autorização, escalação de privilégios

---

*Este relatório foi gerado automaticamente pelo ThreatLens Analyzer*
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
