import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from '../components/navigation';
import Footer from "../components/footer";

export default function HomePage() {
  

  return (
    <>
      <div className="d-flex flex-column min-vh-100">
      <Navigation />

      <main className="flex-grow-1">
        <div className="container mt-5">
          <h1 className="text-center">Welcome to the Home Page</h1>
          
        </div>
      </main>

      <Footer />
    </div>
    </>
  );
}
