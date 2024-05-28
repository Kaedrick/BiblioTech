"use client";

import { title, subtitle } from "@/components/primitives";
import React from "react";
//import {Card, CardHeader, CardBody} from "@nextui-org/card";
import { useState, useEffect } from "react";
import {Card, CardHeader, CardBody, CardFooter, Image, Button, Divider} from '@nextui-org/react';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import jsonData from '../api/result.json'
import "./page.css";



function truncateDescription(description:string | undefined): string {
	if(!description) return ""
	const words = description.split(' '); // Divise description en mots
	const truncatedWords = words.slice(0, 30); // Prend les 30 premiers mots
	const truncatedDescription = truncatedWords.join(' '); // Join les mots en une seule chaîne de caractères
	return truncatedDescription;
}

export default function Livres() {
    const [livres, setLivres] = useState<any[]>([]);
	const [startIndex, setStartIndex] = useState(0);
	const itemPerPage = 10;

	const handleClickLoadMore = () => {
		setStartIndex((prevIndex) => prevIndex + itemPerPage);
	};

    useEffect(() => {
		setLivres(jsonData);
    }, []); 


	return (
		<section>
			<div>
				<h1 className={title()}>Livres</h1>
				<p className={subtitle()}>Ici, vous trouverez tous les livres que vous pouvez emprunter.</p>
			</div>
			
			<div className="HTMLStuff"></div>

			<div className="card-class">
				{/* Permets d'afficher uniquement les 20 premiers livres (en commençant donc de 0), puis on incrémente de itemPerPage 
				à chaque fois qu'on appuie sur le bouton "Afficher plus" pour afficher les 20 livres suivants  */}
				{livres.slice(0, startIndex + itemPerPage).map((livre, index) => (
					
					<Card isFooterBlurred className="h-[400px]" key={index}>

					<CardHeader className="card-header absolute z-10 flex-col items-start">
						<h4 className="title-text text-black font-medium text-2xl">{livre.TITRE}</h4>
					</CardHeader>

					<Divider className="title-divider my-10" />

					<Image
						removeWrapper
						alt="Image du livre"
						className="image z-0 w-full h-full scale-130 -translate-y-9 object-contain"
						src={livre.IMAGE}
					/>

					<CardFooter className="absolute bg-white/30 bottom-0 border-t-1 border-zinc-100/50 z-10 justify-between">
						<div>
						<p className="text-black text-tiny">{truncateDescription(livre.DESCRIPTION) + '...'}</p>
						</div>
					<Router>
						<Link to={`/livres/${livre.IDLIVRE}`}>
							<Button className="text-tiny" color="primary" radius="full" size="sm">
								Détails
							</Button>
						</Link>
					</Router>
					</CardFooter>
					</Card>
					
				))}
			</div>
				

			<div>
				<br />
				<Button onClick={handleClickLoadMore}>Afficher plus</Button>
			</div>
		</section>
	  );
	  
	}
