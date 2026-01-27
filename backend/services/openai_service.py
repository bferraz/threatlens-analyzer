import json
from openai import OpenAI, AsyncOpenAI
from typing import Dict, Any, Optional
from config.settings import settings
import asyncio


class OpenAIService:
    """Service for interacting with OpenAI API."""
    
    def __init__(self):
        """Initialize OpenAI client."""
        self.client = AsyncOpenAI(
            api_key=settings.openai_api_key,
            timeout=settings.request_timeout_seconds
        )
        self.sync_client = OpenAI(
            api_key=settings.openai_api_key,
            timeout=settings.request_timeout_seconds
        )
    
    def _build_analysis_prompt(
        self,
        analysis_depth: str,
        include_severity: bool,
        include_assumptions: bool
    ) -> str:
        """Build the analysis prompt for OpenAI."""
        
        prompt = """Analyze this software architecture diagram and identify security threats using STRIDE methodology.

        IMPORTANT: Return ONLY valid JSON (no markdown, no extra text) with this EXACT structure:
        {
        "components": [{"id": "api", "type": "service", "name": "API Gateway", "trust_zone": "dmz", "confidence": 0.9}],
        "data_flows": [{"from": "user", "to": "api", "protocol": "HTTPS", "direction": "bidirectional", "data_types": ["credentials"], "confidence": 0.9}],
        "threats": [{"targetId": "api", "category": "S", "title": "Auth bypass", "description": "Risk of authentication bypass", "severity": "high"}],
        "mitigations": [{"targetId": "api", "title": "Implement MFA", "steps": ["Enable MFA", "Use OAuth2", "Add rate limiting"]}],
        "assumptions": ["HTTPS is used"],
        "uncertainties": ["Database encryption status"]
        }

        RULES:
        - trust_zone must be one of: "external", "internet", "public", "dmz", "internal", "private"
        - category must be one of: "S", "T", "R", "I", "D", "E" (STRIDE)
        - severity must be one of: "low", "medium", "high", "critical"
        - direction must be: "unidirectional" or "bidirectional"
        - confidence must be between 0.7 and 1.0

        Generate at least: 3 components, 2 data_flows, 5 threats (covering S,T,R,I,D,E categories), 3 mitigations.
        """
        
        return prompt
    
    async def analyze_image(
        self,
        image_base64: str,
        analysis_depth: str = "full",
        include_severity: bool = True,
        include_assumptions: bool = True
    ) -> Dict[str, Any]:
        """
        Analyze an architecture diagram image using GPT-4 Vision.
        
        Args:
            image_base64: Base64 encoded image data
            analysis_depth: 'quick' or 'full'
            include_severity: Include severity in threats
            include_assumptions: Include assumptions and uncertainties
            
        Returns:
            Dict containing analysis results
        """
        prompt = self._build_analysis_prompt(
            analysis_depth, include_severity, include_assumptions
        )
        
        try:
            response = await self.client.chat.completions.create(
                model=settings.openai_vision_model,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt},
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/jpeg;base64,{image_base64}"
                                }
                            }
                        ]
                    }
                ],
                max_completion_tokens=settings.openai_max_tokens
                # GPT-5.2 doesn't support custom temperature, uses default (1)
            )
            
            content = response.choices[0].message.content
            
            # Log the raw response for debugging
            if not content:
                raise Exception("OpenAI returned empty response")
            
            # Check if OpenAI refused the request
            if "sorry" in content.lower() and "can't assist" in content.lower():
                raise Exception("A imagem enviada não pôde ser processada. Certifique-se de enviar um diagrama de arquitetura de software válido (ex: diagrama de componentes, fluxo de dados, infraestrutura).")
            
            # Check if OpenAI is unable to analyze the image
            if "unable to analyze" in content.lower() or "can't help" in content.lower() or "cannot help" in content.lower():
                raise Exception("A imagem enviada não parece ser um diagrama de arquitetura de software. Por favor, envie um diagrama que mostre componentes, serviços, bancos de dados ou fluxos de dados de um sistema.")
            
            print(f"[DEBUG] Raw OpenAI response (first 500 chars): {content[:500]}")
            
            # Check if response looks like explanatory text instead of JSON
            if not content.strip().startswith("{") and not content.strip().startswith("```"):
                raise Exception("A imagem enviada não contém elementos de arquitetura de software reconhecíveis. Por favor, envie um diagrama de arquitetura válido (ex: AWS, Azure, diagramas UML, diagramas de componentes).")
            
            # Parse JSON response
            # Remove markdown code blocks if present
            if content.startswith("```"):
                content = content.split("```")[1]
                if content.startswith("json"):
                    content = content[4:]
            
            result = json.loads(content.strip())
            return result
            
        except asyncio.TimeoutError:
            raise Exception("OpenAI request timed out")
        except json.JSONDecodeError as e:
            # More user-friendly error for image analysis
            if "unable to analyze" in content.lower() or "can't" in content.lower():
                raise Exception("A imagem enviada não parece ser um diagrama de arquitetura de software. Por favor, envie um diagrama que mostre componentes, serviços, bancos de dados ou fluxos de dados de um sistema.")
            raise Exception(f"A resposta da OpenAI não está no formato esperado. A imagem pode não conter elementos de arquitetura reconhecíveis. Erro: {str(e)}")
        except Exception as e:
            # Don't wrap if already our custom message
            if "imagem enviada" in str(e).lower() or "diagrama de arquitetura" in str(e).lower():
                raise
            raise Exception(f"OpenAI API error: {str(e)}")
    
    async def analyze_mermaid(
        self,
        mermaid_code: str,
        analysis_depth: str = "full",
        include_severity: bool = True,
        include_assumptions: bool = True
    ) -> Dict[str, Any]:
        """
        Analyze Mermaid diagram code using GPT-4.
        
        Args:
            mermaid_code: Mermaid diagram code
            analysis_depth: 'quick' or 'full'
            include_severity: Include severity in threats
            include_assumptions: Include assumptions and uncertainties
            
        Returns:
            Dict containing analysis results
        """
        prompt = self._build_analysis_prompt(
            analysis_depth, include_severity, include_assumptions
        )
        
        full_prompt = f"{prompt}\n\nCÓDIGO MERMAID A ANALISAR:\n```mermaid\n{mermaid_code}\n```"
        
        print(f"[DEBUG] Analyzing Mermaid with model: {settings.openai_text_model}")
        print(f"[DEBUG] Mermaid code length: {len(mermaid_code)} chars")
        
        try:
            response = await self.client.chat.completions.create(
                model=settings.openai_text_model,
                messages=[
                    {
                        "role": "system",
                        "content": "Você é um especialista em segurança de software e análise STRIDE. Retorne APENAS um objeto JSON válido, sem texto adicional, sem markdown, sem explicações."
                    },
                    {
                        "role": "user",
                        "content": full_prompt
                    }
                ],
                max_completion_tokens=settings.openai_max_tokens
                # GPT-5 doesn't support custom temperature, uses default (1)
                # GPT-5 may have issues with response_format json_object, so we parse manually
            )
            
            # Debug full response
            print(f"[DEBUG] Response object: {response}")
            print(f"[DEBUG] Choices: {response.choices}")
            
            if not response.choices or len(response.choices) == 0:
                raise Exception("OpenAI returned no choices in response")
            
            content = response.choices[0].message.content
            
            print(f"[DEBUG] Content type: {type(content)}")
            print(f"[DEBUG] Content value: {content}")
            
            if not content:
                raise Exception("OpenAI returned empty response")
            
            print(f"[DEBUG] Raw OpenAI response (first 500 chars): {content[:500]}")
            
            # Remove markdown code blocks if present
            if content.strip().startswith("```"):
                print("[DEBUG] Removing markdown code blocks")
                content = content.split("```")[1]
                if content.startswith("json"):
                    content = content[4:]
                content = content.strip()
            
            print(f"[DEBUG] Cleaned content (first 300 chars): {content[:300]}")
            
            result = json.loads(content.strip())
            print(f"[DEBUG] Successfully parsed JSON with {len(result.get('components', []))} components")
            return result
            
        except asyncio.TimeoutError:
            raise Exception("OpenAI request timed out")
        except json.JSONDecodeError as e:
            raise Exception(f"Failed to parse OpenAI response as JSON: {str(e)}. Response content: {content[:200] if content else 'empty'}")
        except Exception as e:
            raise Exception(f"OpenAI API error: {str(e)}")


# Global service instance
openai_service = OpenAIService()
