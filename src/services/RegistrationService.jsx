import emailjs from 'emailjs-com';

// Initialiser EmailJS
emailjs.init(process.env.REACT_APP_EMAILJS_USER_ID);

export const sendRegistration = async (formData) => {
  const webhookURL = process.env.REACT_APP_DISCORD_WEBHOOK_URL;

  // Formater l'adresse
  const addressText = formData.address && formData.postalCode && formData.city
    ? `${formData.address}, ${formData.postalCode} ${formData.city}`
    : 'Aucune adresse renseignée';

  // Format du message pour Discord avec emojis et meilleure mise en forme
  const discordMessage = {
    content: `🎉 **Nouvelle Inscription !**

👤 **Informations Personnelles**
• Nom: ${formData.lastName}
• Prénom: ${formData.firstName}
• Date de naissance: ${formData.birthDate}
• Email: ${formData.email}
• Téléphone: ${formData.phone}

📍 **Adresse**
• ${addressText}

🎯 **Participation**
• Type d'adhésion: ${formData.membershipType === 'adherent' ? 'Adhérent' : formData.membershipType === 'benevole' ? 'Bénévole' : 'Donateur'}
• Disponibilités: ${formData.availability.length > 0 ? formData.availability.join(', ') : 'Non spécifiées'}
${formData.skills ? `• Compétences: ${formData.skills}` : ''}

💭 **Motivation**
${formData.motivation}`
  };

  // Simplifier au maximum l'objet emailTemplate
  const emailTemplate = {
    lastName: String(formData.lastName || ''),
    firstName: String(formData.firstName || ''),
    birthDate: String(formData.birthDate || ''),
    email: String(formData.email || ''),
    phone: String(formData.phone || ''),
    address: String(addressText),
    membershipType: String(
      formData.membershipType === 'adherent' ? 'Adhérent' : 
      formData.membershipType === 'benevole' ? 'Bénévole' : 
      'Donateur'
    ),
    availability: String(formData.availability ? formData.availability.join(', ') : ''),
    skills: String(formData.skills || ''),
    motivation: String(formData.motivation || '')
  };

  try {
    // Envoyer à Discord
    const discordResponse = await fetch(webhookURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(discordMessage)
    });

    if (!discordResponse.ok) {
      throw new Error('Échec de l\'envoi à Discord');
    }

    // Envoyer l'email avec les données simplifiées
    const emailResponse = await emailjs.send(
      process.env.REACT_APP_EMAILJS_SERVICE_ID,
      process.env.REACT_APP_EMAILJS_TEMPLATE_ID,
      emailTemplate
    );

    return { discordResponse, emailResponse };
  } catch (error) {
    console.error('Erreur dans sendRegistration:', error);
    throw error;
  }
};
