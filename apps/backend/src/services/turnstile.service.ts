export const verifyTurnstileToken = async (token: string, remoteIp?: string): Promise<boolean> => {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;

  // En entorno de desarrollo o pruebas locales sin clave activa
  if (!secretKey || secretKey === 'dummy-secret-for-dev') {
    return true;
  }

  const formData = new URLSearchParams();
  formData.append('secret', secretKey);
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