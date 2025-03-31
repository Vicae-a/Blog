// src/components/Footer.jsx
const Footer = () => {
    const currentYear = new Date().getFullYear();
    
    return (
      <footer className="site-footer">
        <div className="container">
          <div className="footer-content">
            <p>&copy; {currentYear} Ovaboss Blog System. All rights reserved.</p>
          </div>
        </div>
      </footer>
    );
  };
  
  export default Footer;