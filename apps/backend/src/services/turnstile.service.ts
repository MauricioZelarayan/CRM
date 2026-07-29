export const verifyTurnstileToken = async (token: string, remoteIp?: string): Promise<boolean> => {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  const isProduction = process.env.NODE_ENV === 'production';

  // En entorno de producción exige presencia obligatoria de la variable
  if (isProduction && !secretKey) {
    throw new Error('TURNSTILE_SECRET_KEY no está configurada en entorno de producción.');
  }

  // Permitir bypass ÚNICAMENTE en desarrollo si no hay clave configurada
  if (!isProduction && (!secretKey || secretKey === 'dummy-secret-for-dev')) {
    return true;
  }

  const formData = new URLSearchParams();
  formData.append('secret', secretKey!);
  formData.append('response', token);
  if (remoteIp) {
    formData.append('remoteip', remoteIp);
  }

  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
    });

    const outcome = (await response.json()) as { success: boolean };
    return outcome.success;
  } catch (error) {
    console.error('Error al verificar Turnstile CAPTCHA:', error);
    return false;
  }
};