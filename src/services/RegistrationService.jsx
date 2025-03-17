import emailjs from 'emailjs-com';

// Initialiser EmailJS
emailjs.init('p_iVuB_xWxIJj-eY0');

export const sendRegistration = async (formData) => {
  const webhookURL = 'https://discord.com/api/webhooks/1295433379780755547/JLjadxLQK0FjOLl_a6FjOdRcRI_NWgJQETnb0nEgtsXhTa0MbEE9dULrDjtee9B1Mnu_';

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
    'service_knzqf1l', 
    'template_og0qfap', 
    formData
  );

  return { discordResponse, emailResponse };
};
