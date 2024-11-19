import './About.css';

function About() {
    return (
        <div className="About">
            <div className='title-container'>
                <div className='title'>
                    <h1>À propos</h1>
                    <span className="emoji">👨‍💻</span>
                </div>
            </div>
            <div className='about-content'>
                <p>
                    Nous sommes une équipe passionnée dédiée à la création d'une communauté sportive dynamique au sein du CESI. 
                    Notre objectif principal est de fonder une équipe sportive de sports de combat, proposant des séances d'initiation aux arts martiaux pour les étudiants.
                </p>
                <p>
                    Nous croyons fermement aux valeurs martiales telles que le respect, la discipline et le dépassement de soi. 
                    À travers notre projet, nous souhaitons promouvoir ces valeurs tout en développant un esprit d'équipe et de solidarité entre les membres.
                </p>
                <p>
                    En plus de notre passion pour les arts martiaux, nous avons à cœur de sensibiliser les étudiants au self-défence et à la confiance en soi. 
                    Nous nous engageons également à lutter contre la sédentarité en encourageant la pratique sportive.
                </p>
                <p>
                    Notre projet inclut l'organisation d'événements, la création de supports de communication et la mise en place d'un système d'inscription pour faciliter l'accès à nos activités.
                    Nous sommes impatients de vous accueillir et de partager cette aventure avec vous !
                </p>
            </div>
        </div>
    );
}

export default About;