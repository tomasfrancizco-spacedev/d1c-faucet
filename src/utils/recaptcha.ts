import axios from "axios";

export async function verifyRecaptcha(token: string, userIP?: string): Promise<boolean> {
  const secretKey: string | undefined = process.env.RECAPTCHA_SECRET_KEY;

  if (!token || !secretKey) {
    return false;
  }

  try {
    // Prepare POST data according to Google's documentation
    const postData = new URLSearchParams({
      secret: secretKey,
      response: token,
      ...(userIP && { remoteip: userIP })
    });

    const response = await axios.post(
      'https://www.google.com/recaptcha/api/siteverify',
      postData,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    // Handle specific error codes from Google's documentation
    if (!response.data.success && response.data['error-codes']) {
      console.error("reCAPTCHA verification failed:", response.data['error-codes']);
      return false;
    }

    return response.data.success === true;
  } catch (error) {
    console.error("Recaptcha verification error:", error);
    return false;
  }
}