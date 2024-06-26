"use client";

import { title, subtitle } from "@/components/primitives";
import React from "react";
import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Image,
  Button,
  Divider,
} from "@nextui-org/react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import axios from "axios";
import "./page.css";
require("dotenv").config();
const serverUrl = process.env.BASE_URL || "http://localhost:3001";
const siteUrl = process.env.SITE_URL || "http://localhost:3000";

function truncateDescription(description: string | undefined): string {
  if (!description) return "";
  const words = description.split(" ");
  const truncatedWords = words.slice(0, 30);
  const truncatedDescription = truncatedWords.join(" "); // Show only first 30 words from book description
  return truncatedDescription;
}

function truncateLongTitle(title: string | undefined): string {
  if (!title) return "";

  if (title.length > 35) {
    return title.slice(0, 35) + "...";
  } else {
    return title;
  }
}

export default function Livres() {
  const [book, setBook] = useState<any[]>([]);
  const [allBooks, setAllBooks] = useState<any[]>([]);
  const [startIndex, setStartIndex] = useState(0);
  const [searchTerms, setSearchTerms] = useState<string>();
  const itemPerPage = 10;

  const handleClickLoadMore = () => {
    setStartIndex((prevIndex) => prevIndex + itemPerPage);
  };

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await axios.get(`${serverUrl}/api/books`);
        setAllBooks(response.data);
        if (!searchTerms) {
          setBook(response.data);
        }
      } catch (error: any) {
        console.error("Erreur lors de la récupération des livres : ", error);
      }
    };

    fetchBooks();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const filteredBooks = allBooks.filter(
      (book) =>
        !searchTerms ||
        book.title.toLowerCase().includes(searchTerms.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerms.toLowerCase()) ||
        book.description.toLowerCase().includes(searchTerms.toLowerCase())
    );
    setBook(filteredBooks);
  }, [searchTerms, allBooks]);

  return (
    <section>
      <div>
        <h1 className={title()}>Livres</h1>
        <p className={subtitle()}>
          Ici, vous trouverez tous les livres que vous pouvez emprunter.
        </p>
      </div>
      <div className="search-container">
        <input
          type="search"
          name="searchbar"
          className="search-bar"
          value={searchTerms}
          onChange={(e) => setSearchTerms(e.target.value)}
        ></input>{" "}
        <button className="clear-button" onClick={() => setSearchTerms("")}>✖</button>
      </div>
      

      <div className="HTMLStuff"></div>

      <div className="card-class">
        {/* Shows only the first {itemPerPage} elements, then when we click show more it'll add {itemPerPage} more elements to the list */}
        {book.slice(0, startIndex + itemPerPage).map((book, index) => (book.quantity > 0) ? (
          <Card isFooterBlurred className="h-[400px]" key={index}>
            <CardHeader className="card-header absolute z-10 flex-col items-start">
              <h4 className="title-text text-black font-medium text-2xl">
                {truncateLongTitle(book.title)}
              </h4>
            </CardHeader>

            <Divider className="title-divider my-10" />

            <Image
              removeWrapper
              alt="Image du livre"
              className="image z-0 w-full h-full scale-130 -translate-y-9 object-contain"
              src={book.image}
            />

            <CardFooter className="absolute bg-white/30 bottom-0 border-t-1 border-zinc-100/50 z-10 justify-between">
              <div>
                <p className="text-black text-tiny">
                  {truncateDescription(book.description) + "..."}
                </p>
              </div>
              <Router>
                <Link to={`/livres/${book.idBook}`}>
                  <Button
                    className="text-tiny"
                    color="primary"
                    radius="full"
                    size="sm"
                  >
                    Détails
                  </Button>
                </Link>
              </Router>
            </CardFooter>
          </Card>
        ) : <></>)}
      </div>

      <div>
        <br />
        <Button onClick={handleClickLoadMore}>Afficher plus</Button>
      </div>
    </section>
  );
}
