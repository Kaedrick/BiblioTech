import fs from 'fs'; 
import connection from '../../server/database.js/index.js';

export default async function handler(req: any, res: any) {
  try {
    connection.query('SELECT IDLIVRE, TITRE, AUTEUR, DESCRIPTION, IMAGE FROM livres', (error: any, results: any) => {
      if (error) {
        console.error("Erreur lors de la récupération des livres :", error);
        res.status(500).json({ message: "Erreur lors de la récupération des livres" });
      } else {
        const jsonData = JSON.stringify(results);

        const filePath = 'app/api/result.json';

        console.log('Enregistrement des données JSON dans le fichier :', filePath);
        
        // Save données JSON dans un fichier
        fs.writeFileSync(filePath, jsonData, 'utf-8');
        console.log('Fichier JSON enregistré avec succès.');
      }
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des livres :", error);
    res.status(500).json({ message: "Erreur lors de la récupération des livres" });
  }
}
