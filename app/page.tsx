/* eslint-disable react/no-unescaped-entities */
import { title, subtitle } from "@/components/primitives";
import Image from "next/image";
import './page.css';

export default function Accueil() {
    return (
        <section className="container">
            <div className="header">
                <div className="logo">
                    <Image
                        src="/img/BTLogo.png" 
                        alt="Logo BiblioTech" 
                        layout="fill"
                        objectFit="contain" 
                        objectPosition="center" 
                    />
                </div>
                <h1 className={title()}>Bienvenue sur BiblioTech</h1>
                <p className={subtitle()}>BiblioTech est votre bibliothèque moderne, conçue pour simplifier votre expérience de lecture et de réservation. Réservez vos livres en ligne et venez les chercher en toute sérénité à la bibliothèque, assurant ainsi la disponibilité de vos ouvrages préférés à la date souhaitée.</p>
            </div>
            
            <div className="main-content">
                <div className="section">
                    <div className="image">
                        <Image
                            src="/img/1984-cover.jpg" 
                            alt="Cover du livre 1984 par George Orwell" 
                            layout="fill" 
                            objectFit="contain" 
                            objectPosition="center"
                        />
                    </div>
                    <div className="text">
                        <h2 className={title()}>Découvrez un monde de livres</h2>
                        <p className={subtitle()}>Parcourez notre catalogue exhaustif de livres, allant des classiques intemporels aux dernières nouveautés. Que vous soyez passionné de romans, de non-fiction, de thrillers ou de science-fiction, vous trouverez sûrement votre prochaine lecture parmi nos nombreuses catégories.</p>
                    </div>
                </div>

                <div className="section">
                    <div className="text">
                        <h2 className={title()}>Trouvez le livre parfait</h2>
                        <p className={subtitle()}>Notre puissant moteur de recherche vous permet de trouver rapidement le livre parfait en fonction de vos intérêts et de vos préférences. Utilisez des filtres avancés pour affiner vos résultats et découvrez de nouveaux auteurs, genres et sujets qui captiveront votre imagination.</p>
                    </div>
                    <div className="image">
                        <Image
                            src="/img/lupin.jpg" 
                            alt="Cover du livre Arsène Lupin par Maurice LeBlanc" 
                            layout="fill" 
                            objectFit="contain" 
                            objectPosition="center"
                        />
                    </div>
                </div>

                <div className="section">
                    <div className="image">
                        <Image
                            src="/img/psy.jpg" 
                            alt="Cover du livre Devenir son propore psy par Anne-Hélène Claire et Vincent Trybou" 
                            layout="fill" 
                            objectFit="contain" 
                            objectPosition="center"
                        />
                    </div>
                    <div className="text">
                        <h2 className={title()}>Gérez vos réservations efficacement</h2>
                        <p className={subtitle()}>Utilisez BiblioTech pour trier et rechercher facilement les livres de notre bibliothèque. Réservez vos livres préférés à l'avance pour des dates précises et gérez vos réservations en ligne. Consultez vos réservations passées, modifiez ou annulez celles à venir en toute simplicité.</p>
                    </div>
                </div>

                <div className="call-to-action">
                    <h2 className={title()}>Rejoignez-nous dès aujourd'hui</h2>
                    <p className={subtitle()}>Inscrivez-vous gratuitement dès aujourd'hui et plongez dans un univers infini de découvertes littéraires. Que vous soyez un lecteur passionné ou simplement curieux, BiblioTech a tout ce qu'il vous faut pour nourrir votre passion pour la lecture.</p>
                    <a href="/livres" className="cta-button">Découvrez nos livres</a>
                </div>
            </div>
        </section>
    );
}
