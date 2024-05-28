import { title, subtitle } from "@/components/primitives";
import Image from "next/image";

export default function Accueil() {
	return (
		<section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
			<div className="relative w-full h-0" style={{ paddingTop: '25.25%'}}>
				<Image
					src="/img/BTLogo.png" 
					alt="Logo BiblioTech" 
					layout="fill"
					objectFit="contain" 
					objectPosition="center" 
				/>
			</div>

			<div className="inline-block max-w-xl text-center justify-center">
				<h1 className={title()}>Bienvenue sur BiblioTech</h1>

				<p className={subtitle()}>BiblioTech est votre bibliothèque numérique intelligente, conçue pour simplifier votre expérience de lecture. Avec un vaste catalogue de livres, une interface conviviale et des fonctionnalités avancées, BiblioTech est là pour répondre à tous vos besoins de lecture.</p>
			</div>
			<div className="w-full text-left">
				<h2 className={title()}>Découvrez un monde de livres</h2>

				<p className={subtitle()}>Parcourez notre catalogue exhaustif de livres, allant des classiques intemporels aux dernières nouveautés. Que vous soyez passionné de romans, de non-fiction, de thrillers ou de science-fiction, vous trouverez sûrement votre prochaine lecture parmi nos nombreuses catégories.</p>
			</div>
			<div className="relative w-full h-0" style={{ paddingTop: '56.25%' }}> {/* div avec une hauteur relative pour maintenir le ratio */}
        <Image
          src="/img/1984-cover.jpg" 
          alt="Cover du livre 1984 par George Orwell" 
          layout="fill" 
          objectFit="contain" 
          objectPosition="center"
        />
      </div>	
				<h2 className={title()}>Trouvez le livre parfait</h2>

				<p className={subtitle()}>Notre puissant moteur de recherche vous permet de trouver rapidement le livre parfait en fonction de vos intérêts et de vos préférences. Utilisez des filtres avancés pour affiner vos résultats et découvrez de nouveaux auteurs, genres et sujets qui captiveront votre imagination.</p>

				<h2 className={title()}>Empruntez en toute simplicité</h2>

				<p className={subtitle()}>Grâce à notre système de prêt intégré, vous pouvez emprunter vos livres préférés en quelques clics seulement. Plus besoin de vous déplacer en bibliothèque, BiblioTech vous offre un accès instantané à des milliers de livres, disponibles à tout moment et où que vous soyez.</p>

				<h2 className={title()}>Personnalisez votre expérience</h2>

				<p className={subtitle()}>Créez votre propre bibliothèque virtuelle, suivez vos lectures, ajoutez des notes et des commentaires, et partagez vos recommandations avec d'autres membres de la communauté BiblioTech. Avec des fonctionnalités de personnalisation avancées, vous pouvez rendre votre expérience de lecture encore plus enrichissante.</p>

				<h2 className={title()}>Rejoignez-nous dès aujourd'hui</h2>

				<p className={subtitle()}>Inscrivez-vous gratuitement dès aujourd'hui et plongez dans un univers infini de découvertes littéraires. Que vous soyez un lecteur passionné ou simplement curieux, BiblioTech a tout ce qu'il vous faut pour nourrir votre passion pour la lecture.</p>
		</section>
	);
}