import React from 'react'
import Navbar from "./Navbar";
import '../styles/about.css';
import awesome from '../images/about - awesome.jpeg'
import login from '../images/about - awesome.svg'
import { Link } from "react-router-dom";
import { Button } from '@mui/material';
import Alertss from "./Alertss";

function About() {
    return (
      <div>
        <Navbar />
        <Alertss />
        <div className="text-white aboutImg text-center">
          <div className="note-img">
            <h1 className="display-4">eNoteBook</h1>
            <p>
              An online web platform where you can create, edit, upload, delete
              your notes/information privately and securely without any
              disturbancee
            </p>
          </div>
        </div>

        <div className="container mt-5 ">
          <div className="row">
            <div className="col-md-6 d-flex flex-column justify-content-center">
              <h2 className="mb-3" style={{ fontWeight: "Bold" }}>
                Make something <span style={{ color: "#9C27B0" }}>Awesome</span>{" "}
              </h2>
              <p>
                eNotebook is made from the pain of writing all the things in
                notebook which is very hectic :(, So we mad an online web
                platform where you can create, edit, upload, delete your
                notes/information privately and securely without any
                disturbancee. you can also access your notes anywhere in your
                world, at anytime time . So dont forget to Create note because
                creating anything is always important
              </p>
              <div className="d-flex justify-content-center mt-3">
                <Button
                  component={Link}
                  to="/new"
                  variant="contained"
                  color="secondary"
                  style={{
                    color: "White",
                    textTransform: "none",
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: "1.3rem",
                  }}
                >
                  Create New Note
                </Button>
              </div>
            </div>
            <div className="col-md-6">
              <img
                className="img-fluid awesome"
                src={awesome}
                alt="about-awesome"
              />
            </div>
          </div>

          <div className="row login mt-5 mb-5 p-5">
            <div className="col-md-6">
              <img className="img-fluid" src={login} alt="about-awesome" />
            </div>
            <div className="col-md-6 d-flex flex-column justify-content-center">
              <h2 className="mb-3" style={{ fontWeight: "Bold" }}>
                Supporting the{" "}
                <span style={{ color: "#9C27B0" }}>internet's visuals</span>{" "}
              </h2>
              <p>
                How we started? The concept was simple. eNotebook was born from
                the pain of writing all the things in notebook which is very
                hectic :( . An online web platform where you can create, edit,
                upload, delete your notes/information privately and securely
                without any disturbancee
              </p>
              <div className="d-flex justify-content-center mt-3">
                <Button
                  component={Link}
                  to="/register"
                  variant="contained"
                  color="secondary"
                  style={{
                    color: "White",
                    textTransform: "none",
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: "1.3rem",
                  }}
                >
                  Sign up now
                </Button>
              </div>
            </div>
          </div>

          <div className="card shadow-sm mb-4">
            <div className="card-body">
                <h4 className="card-title">Install eNotebook as an App</h4>
                <p>eNotebook can be installed on your device as a Progressive Web App (PWA)!</p>
                
                <h5>On Desktop:</h5>
                <ol>
                    <li>Open Chrome or Edge browser</li>
                    <li>Navigate to the eNotebook website</li>
                    <li>Look for the install icon (⊕) in the address bar</li>
                    <li>Click "Install"</li>
                </ol>
                
                <h5>On Android:</h5>
                <ol>
                    <li>Open Chrome browser</li>
                    <li>Navigate to the eNotebook website</li>
                    <li>Tap the menu (⋮) in the top right</li>
                    <li>Tap "Add to Home screen"</li>
                </ol>
                
                <h5>On iPhone/iPad:</h5>
                <ol>
                    <li>Open Safari browser</li>
                    <li>Navigate to the eNotebook website</li>
                    <li>Tap the Share button</li>
                    <li>Scroll down and tap "Add to Home Screen"</li>
                </ol>
                
                <p className="mb-0 text-muted">Once installed, you can use eNotebook offline and it will sync when you're back online!</p>
            </div>
          </div>
        </div>

        <footer>
          <div className="content">
            <div className="top">
              <div className="logo-details">
                <span className="logo_name">
                  <span style={{ color: "#9C27B0" }}>e</span>Notebook
                </span>
              </div>
              <div className="media-icons">
                <Link to="/">
                  <i className="fab fa-facebook-f"></i>
                </Link>
                <Link to="/">
                  <i className="fab fa-twitter"></i>
                </Link>
                <Link to="/">
                  <i className="fab fa-instagram"></i>
                </Link>
                <Link to="https://www.linkedin.com/in/jayvijay-chauhan/">
                  <i className="fab fa-linkedin-in"></i>
                </Link>
                <Link to="/">
                  <i className="fab fa-youtube"></i>
                </Link>
              </div>
            </div>
            <div className="link-boxes">
              <ul className="box">
                <li className="link_name">Company</li>
                <li>
                  <Link to="/">Home</Link>
                </li>
                <li>
                  <Link to="/new">New Notes</Link>
                </li>
                <li>
                  <Link to="/about">About us</Link>
                </li>
                <li>
                  <Link to="/">Get started</Link>
                </li>
              </ul>
              <ul className="box">
                <li className="link_name">Services</li>
                <li>
                  <Link to="/">Your Notes</Link>
                </li>
                <li>
                  <Link to="/new">New Note</Link>
                </li>
              </ul>
              <ul className="box">
                <li className="link_name">Account</li>
                <li>
                  <Link to="/login">Sign-in</Link>
                </li>
                <li>
                  <Link to="/register">Join Free</Link>
                </li>
              </ul>
              {/* <ul className="box">
                            <li className="link_name">Top Categories</li>
                            <li><Link to="/c/61554bfe801949ad7b9be4ff">Tent Notes</Link></li>
                            <li><Link to="/c/61554c2753bcf306407cb1bd">RV and Van Notes</Link></li>
                            <li><Link to="/c/61554c43d2a6b15f764aff36">Canoe Notes</Link></li>
                            <li><Link to="c/61554c63dfd6a37d71449b5c">Survivalist Notes</Link></li>
                        </ul> */}
              <ul className="box input-box">
                <li className="link_name">About eNotebook</li>
                <li style={{ color: "#F7FFFF" }}>
                  An online web platform where you can create, edit, upload,
                  delete your notes/information privately and securely without
                  any disturbancee
                </li>
              </ul>
            </div>
          </div>
          <div className="bottom-details">
            <div className="bottom_text">
              <span className="copyright_text">
                Copyright © 2023 <Link to="/">iNotebook</Link>All rights
                reserved
              </span>
              <span className="policy_terms">
                <Link to="/">Privacy policy</Link>
                <Link to="/">Terms & condition</Link>
              </span>
            </div>
          </div>
        </footer>
      </div>
    );
}

export default About
