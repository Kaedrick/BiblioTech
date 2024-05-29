// // Dans votre composant de détails de livre (LivreDetails.js)

// import React, { useState, useEffect } from "react";
// import { useParams } from "react-router-dom";
// import jsonData from '../api/result.json';

// function LivreDetails() {
//     const { idLivre } = useParams(); // Récupérer l'ID du livre depuis les paramètres de l'URL
//     const [livre, setLivre] = useState(null);

//     useEffect(() => {
//         // Rechercher le livre correspondant à l'ID dans vos données JSON
//         const bookFound = jsonData.find(l => l.IDLIVRE === idLivre);
//         setLivre(bookFound);
//     }, [idLivre]);

//     if (!livre) {
//         return <div>Loading...</div>;
//     }

//     return (
//         <div>
//             <h2>{livre.TITRE}</h2>
//             <p>{livre.DESCRIPTION}</p>
//             {/* Ajoutez d'autres détails du livre ici */}
//         </div>
//     );
// }

// export default LivreDetails;
