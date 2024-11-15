import './Accueil.css';
import { FaBell } from "react-icons/fa";

function Accueil() {
    return (
        <div className='Accueil'>
            <div className='title-container'>
                <div className='title'>
                    <h1>Welcome</h1>
                    <span className="emoji">✌️</span>
                </div>
            </div>
            <div className='content-wrapper'>
                <div className='intro-text'>
                    <div className="bell-icon">
                        <FaBell />
                    </div>
                    <div className="separator"></div>
                    <p>Hello.</p>
                </div>
            </div>
        </div>
    );
}

export default Accueil;