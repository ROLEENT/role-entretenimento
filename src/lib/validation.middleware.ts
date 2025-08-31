import { z } from 'zod';
import { validationUtils } from './validation';

/**
 * Middleware for validating request data in edge functions
 */
export class ValidationMiddleware {
  /**
   * Validate request body against schema
   */
  static validateRequest<T>(schema: z.ZodSchema<T>, data: any): {
    success: boolean;
    data?: T;
    errors?: Record<string, string>;
    status: number;
  } {
    try {
      const cleanedData = validationUtils.cleanFormData(data);
      const validatedData = schema.parse(cleanedData);
      
      return {
        success: true,
        data: validatedData,
        status: 200,
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = validationUtils.errorsToFieldMap(error);
        
        return {
          success: false,
          errors,
          status: 400,
        };
      }
      
      return {
        success: false,
        errors: { general: 'Erro de validação' },
        status: 500,
      };
    }
  }

  /**
   * Sanitize input data to prevent XSS and injection
   */
  static sanitizeInput(data: any): any {
    if (typeof data === 'string') {
      return data
        .trim()
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .replace(/on\w+\s*=/gi, ''); // Remove event handlers
    }
    
    if (Array.isArray(data)) {
      return data.map(item => ValidationMiddleware.sanitizeInput(item));
    }
    
    if (data && typeof data === 'object') {
      const sanitized: any = {};
      Object.keys(data).forEach(key => {
        sanitized[key] = ValidationMiddleware.sanitizeInput(data[key]);
      });
      return sanitized;
    }
    
    return data;
  }

  /**
   * Create a standardized error response
   */
  static createErrorResponse(errors: Record<string, string>, status = 400): Response {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    };

    return new Response(
      JSON.stringify({
        ok: false,
        errors,
        message: Object.values(errors)[0] || 'Erro de validação',
      }),
      {
        status,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }

  /**
   * Create a standardized success response
   */
  static createSuccessResponse(data?: any, message?: string): Response {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    };

    return new Response(
      JSON.stringify({
        ok: true,
        data,
        message,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }

  /**
   * Log validation errors for debugging
   */
  static logValidationError(functionName: string, errors: Record<string, string>, data: any) {
    console.error(`[${functionName}] Validation failed:`, {
      errors,
      data: JSON.stringify(data, null, 2),
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Validate and handle CORS preflight
   */
  static handleCorsAndValidation<T>(
    req: Request,
    schema: z.ZodSchema<T>,
    functionName: string
  ): {
    shouldReturn?: Response;
    validatedData?: T;
  } {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
    };

    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      return {
        shouldReturn: new Response(null, { headers: corsHeaders }),
      };
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
      return {
        shouldReturn: new Response(
          JSON.stringify({ ok: false, error: 'Método não permitido' }),
          {
            status: 405,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          }
        ),
      };
    }

    try {
      const requestData = req.json();
      const sanitizedData = ValidationMiddleware.sanitizeInput(requestData);
      const validation = ValidationMiddleware.validateRequest(schema, sanitizedData);

      if (!validation.success) {
        ValidationMiddleware.logValidationError(functionName, validation.errors!, sanitizedData);
        return {
          shouldReturn: ValidationMiddleware.createErrorResponse(validation.errors!),
        };
      }

      return {
        validatedData: validation.data,
      };
    } catch (error) {
      console.error(`[${functionName}] Request parsing error:`, error);
      return {
        shouldReturn: ValidationMiddleware.createErrorResponse(
          { general: 'Dados inválidos' },
          400
        ),
      };
    }
  }
}

export default ValidationMiddleware;