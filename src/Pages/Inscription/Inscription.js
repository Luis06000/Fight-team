import './Inscription.css';
import React, { useState } from 'react';
import emailjs from 'emailjs-com';

emailjs.init('p_iVuB_xWxIJj-eY0');

function Inscription() {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        birthDate: '',
        email: '',
        motivation: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const webhookURL = 'https://discord.com/api/webhooks/1295433379780755547/JLjadxLQK0FjOLl_a6FjOdRcRI_NWgJQETnb0nEgtsXhTa0MbEE9dULrDjtee9B1Mnu_';

        const message = {
            content: `Nouvelle inscription:\nNom: ${formData.lastName}\nPrénom: ${formData.firstName}\nEmail: ${formData.email}\nMotivation: ${formData.motivation}\nDate de naissance: ${formData.birthDate}`
        };

        try {
            const response = await fetch(webhookURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(message)
            });

            if (response.ok) {
                console.log('Données envoyées avec succès à Discord');
            } else {
                console.error('Erreur lors de l\'envoi des données à Discord');
            }
            
            const emailData = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                motivation: formData.motivation,
                birthDate: formData.birthDate
            };

            await emailjs.send('service_knzqf1l', 'template_og0qfap', emailData);
            console.log('E-mail envoyé avec succès');
        } catch (error) {
            console.error('Erreur:', error);
        }
    };

    return (
        <div className='Inscription'>
            <div className='title-container'>
                <div className='title'>
                    <h1>Inscription</h1>
                    <span className="emoji">💻</span>
                </div>
            </div>
            <div className='form-container'>
                <form onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="firstName">Prénom:</label>
                        <input
                            type="text"
                            id="firstName"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="lastName">Nom:</label>
                        <input
                            type="text"
                            id="lastName"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="birthDate">Date de naissance:</label>
                        <input
                            type="date"
                            id="birthDate"
                            name="birthDate"
                            value={formData.birthDate}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="email">Email:</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="motivation">Lettre de motivation:</label>
                        <textarea
                            id="motivation"
                            name="motivation"
                            value={formData.motivation}
                            onChange={handleChange}
                            required
                            minLength={50}
                        />
                    </div>
                    <button type="submit">S'inscrire</button>
                </form>
            </div>
        </div>
    );
}

export default Inscription;









// function Inscription() {
//     const [formData, setFormData] = useState({
//         firstName: '',
//         lastName: '',
//         birthDate: '',
//         email: '',
//         motivation: ''
//     });

//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         setFormData({
//             ...formData,
//             [name]: value
//         });
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
        
//         const webhookURL = 'https://discord.com/api/webhooks/1295433379780755547/JLjadxLQK0FjOLl_a6FjOdRcRI_NWgJQETnb0nEgtsXhTa0MbEE9dULrDjtee9B1Mnu_';

//         const message = {
//             content: `Nouvelle inscription:\nNom: ${formData.lastName}\nPrénom: ${formData.firstName}\nEmail: ${formData.email}\nMotivation: ${formData.motivation}\nDate de naissance: ${formData.birthDate}`
//         };

//         try {
//             const response = await fetch(webhookURL, {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json'
//                 },
//                 body: JSON.stringify(message)
//             });

//             if (response.ok) {
//                 console.log('Données envoyées avec succès à Discord');
//             } else {
//                 console.error('Erreur lors de l\'envoi des données à Discord');
//             }

//             await emailjs.send('service_knzqf1l', 'template_og0qfap', formData, 'p_iVuB_xWxIJj-eY0');
//             console.log('E-mail envoyé avec succès');
//         } catch (error) {
//             console.error('Erreur:', error);
//         }
//     };

//     return (
//         <div className='Inscription'>
//             <div className='title-container'>
//                 <div className='title'>
//                     <h1>Inscription</h1>
//                     <span className="emoji">💻</span>
//                 </div>
//             </div>
//             <div className='form-container'>
//                 <form onSubmit={handleSubmit}>
//                     <div>
//                         <label htmlFor="firstName">Prénom:</label>
//                         <input
//                             type="text"
//                             id="firstName"
//                             name="firstName"
//                             value={formData.firstName}
//                             onChange={handleChange}
//                             required
//                         />
//                     </div>
//                     <div>
//                         <label htmlFor="lastName">Nom:</label>
//                         <input
//                             type="text"
//                             id="lastName"
//                             name="lastName"
//                             value={formData.lastName}
//                             onChange={handleChange}
//                             required
//                         />
//                     </div>
//                     <div>
//                         <label htmlFor="birthDate">Date de naissance:</label>
//                         <input
//                             type="date"
//                             id="birthDate"
//                             name="birthDate"
//                             value={formData.birthDate}
//                             onChange={handleChange}
//                             required
//                         />
//                     </div>
//                     <div>
//                         <label htmlFor="email">Email:</label>
//                         <input
//                             type="email"
//                             id="email"
//                             name="email"
//                             value={formData.email}
//                             onChange={handleChange}
//                             required
//                         />
//                     </div>
//                     <div>
//                         <label htmlFor="motivation">Lettre de motivation:</label>
//                         <textarea
//                             id="motivation"
//                             name="motivation"
//                             value={formData.motivation}
//                             onChange={handleChange}
//                             required
//                             minLength={50}
//                         />
//                     </div>
//                     <button type="submit">S'inscrire</button>
//                 </form>
//             </div>
//         </div>
//     );
// }

// export default Inscription;