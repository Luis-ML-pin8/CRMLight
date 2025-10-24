'use server';
/**
 * @fileOverview Flow de Genkit para generar un informe de contacto.
 * 
 * - generateContactReport: La función principal que se conecta a la IA.
 * - GenerateContactReportInput: El tipo de datos de entrada para el flow.
 * - GenerateContactReportOutput: El tipo de datos de salida del flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateContactReportInputSchema = z.object({
  contactName: z.string().describe('El nombre completo del contacto.'),
  contactRole: z.string().describe('El cargo o rol del contacto en su empresa.'),
  companyName: z.string().describe('El nombre de la empresa donde trabaja el contacto.'),
  agentPrompt: z.string().describe('El prompt del sistema que define el rol y la tarea del agente de IA.'),
});

export type GenerateContactReportInput = z.infer<typeof GenerateContactReportInputSchema>;

const GenerateContactReportOutputSchema = z.object({
  report: z.string().describe('El informe comercial y financiero generado para el contacto.'),
});

export type GenerateContactReportOutput = z.infer<typeof GenerateContactReportOutputSchema>;

// Wrapper asíncrono para ser usado como Server Action
export async function generateContactReport(input: GenerateContactReportInput): Promise<GenerateContactReportOutput> {
  return await generateContactReportFlow(input);
}


// Este es el flow real que se comunica con la IA
const generateContactReportFlow = ai.defineFlow(
  {
    name: 'generateContactReportFlow',
    inputSchema: GenerateContactReportInputSchema,
    outputSchema: GenerateContactReportOutputSchema,
  },
  async (input) => {

    const model = 'googleai/gemini-1.5-flash';

    const llmResponse = await ai.generate({
      model: model,
      prompt: `
        Eres este agente de IA: 
        ---
        ${input.agentPrompt}
        ---

        Ahora, genera el informe para el siguiente sujeto:
        - **Nombre del Contacto:** ${input.contactName}
        - **Cargo:** ${input.contactRole}
        - **Empresa:** ${input.companyName}
      `,
      config: {
        maxOutputTokens: 500, // Limita la longitud de la respuesta para cumplir los 2000 caracteres
      },
    });

    const reportText = llmResponse.text;

    if (!reportText) {
      throw new Error('La respuesta del modelo de IA no contenía texto.');
    }

    return {
      report: reportText,
    };
  }
);
