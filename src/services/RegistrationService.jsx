import emailjs from 'emailjs-com';

// Initialiser EmailJS
emailjs.init(process.env.EMAILJS_USER_ID);

export const sendRegistration = async (formData) => {
  const webhookURL = process.env.DISCORD_WEBHOOK_URL;

  const message = {
    content: `Nouvelle inscription:\nNom: ${formData.lastName}\nPrénom: ${formData.firstName}\nEmail: ${formData.email}\nMotivation: ${formData.motivation}\nDate de naissance: ${formData.birthDate}`
  };

  // Envoyer à Discord
  const discordResponse = await fetch(webhookURL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(message)
  });

  if (!discordResponse.ok) {
    throw new Error('Échec de l\'envoi à Discord');
  }

  // Envoyer l'email
  const emailResponse = await emailjs.send(
    process.env.EMAILJS_SERVICE_ID, 
    process.env.EMAILJS_TEMPLATE_ID, 
    formData
  );

  return { discordResponse, emailResponse };
};
