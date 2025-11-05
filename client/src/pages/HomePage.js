import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TypeAnimation } from 'react-type-animation';
import LandingPageHeader from '../components/LandingPageHeader';
import WhatsAppButton from '../components/WhatsAppButton';
import '../styles/HomePage.css';
import '../styles/Animations.css';

function HomePage() {
  const navigate = useNavigate();

  return (
    <>
      <LandingPageHeader />
      <WhatsAppButton phoneNumber="972549774827" />

      <div className="landing-page-v6">
        <header className="hero-section-v6">
          <div className="hero-overlay"></div>
          <div className="hero-content animate-on-load">
            <h1 className="hero-title">הסטודיו שלך, בשיא הזרימה</h1>
            <p className="hero-subtitle">
              FiTime היא מערכת הניהול האינטואיטיבית שמחזירה לך את השקט הנפשי, מעצימה את המותג שלך ומפנה לך זמן להתמקד במה שאתה עושה הכי טוב: לאמן.
            </p>
            <TypeAnimation
              sequence={[
                'יומן שיעורים חכם', 2000,
                'ניהול לקוחות פשוט', 2000,
                'סליקה אוטומטית', 2000,
                'העסק שלך. בפשטות אלגנטית.', 3000,
              ]}
              wrapper="div"
              cursor={true}
              repeat={Infinity}
              className="animated-text"
            />
            <button className="btn btn-primary hero-cta-button" onClick={() => navigate('/register')}>
              התחילו 14 יום ניסיון במתנה
            </button>
          </div>
        </header>

        {/* <section className="trusted-by-section fade-in">
          <p>השותפים שלנו להצלחה</p>
          <div className="logos-container">
            <span>סטודיו פילאטיס ת"א</span>
            <span>יוגה צפון</span>
            <span>CrossFit הרצליה</span>
            <span>סטודיו גוף ונפש</span>
          </div>
        </section> */}

        <section id="features" className="persona-section owner-section fade-in">
          <div className="persona-content container">
            <div className="persona-text">
              <span className="section-tag">עבור בעלי הסטודיו</span>
              <h2 className="persona-title">תמונה מלאה. שליטה מוחלטת.</h2>
              <p>מניהול פיננסי ועד אופטימיזציה של לו"ז, הדאשבורד החכם שלנו הופך נתונים מורכבים לתובנות ברורות. קבל החלטות מבוססות מידע ובנה עסק יציב וצומח.</p>
              <ul>
                <li><strong>תובנות עסקיות במבט אחד:</strong> כל המידע החשוב בזמן אמת.</li>
                <li><strong>אוטומציה של מנויים:</strong> מעקב וחידוש אוטומטי ללא מאמץ.</li>
                <li><strong>דוחות מתקדמים:</strong> הבנה עמוקה של ההכנסות והשיעורים הפופולריים.</li>
              </ul>
            </div>
            <div className="persona-image-container">
              <img src="/images/owner-dashboard.png" alt="דאשבורד ניהול של FiTime" />
            </div>
          </div>
        </section>

        <section className="persona-section dual-section fade-in">
          <h2 className="section-title">חוויה שכולם מרוויחים ממנה</h2>
          <div className="persona-content container">
            <div className="dual-card">
              <div className="dual-icon">🧘‍♀️</div>
              <h4>חוויה יוצאת דופן למתאמנים</h4>
              <p>העניקו ללקוחות שלכם את הנוחות של הרשמה דיגיטלית, מעקב אישי ותשלומים אונליין. חוויה חלקה שבונה נאמנות ומשדרגת את תדמית הסטודיו.</p>
            </div>
            <div className="dual-card">
              <div className="dual-icon">🏋️‍♂️</div>
              <h4>סביבת עבודה יעילה למאמנים</h4>
              <p>העצימו את המאמנים שלכם עם גישה נוחה ללו"ז, סימון נוכחות מהיר וכל הכלים שהם צריכים כדי להתמקד אך ורק בהדרכה מקצועית.</p>
            </div>
          </div>
        </section>

        <section id="pricing" className="pricing-section fade-in">
            <div className="container">
              <h2 className="section-title">מסלול אחד. פשוט ושקוף.</h2>
              <div className="pricing-card-wrapper">
                <div className="pricing-card">
                  <h3 className="pricing-title">FiTime Pro</h3>
                  <div className="price">₪299<span className="price-term">/ לחודש</span></div>
                  <p className="pricing-subtitle">לאחר 14 יום ניסיון חינם. ללא התחייבות.</p>
                  <ul className="pricing-features">
                    <li>✅ כל הפיצ'רים כלולים</li>
                    <li>✅ ללא הגבלת מתאמנים</li>
                    <li>✅ ללא הגבלת שיעורים</li>
                    <li>✅ תמיכה טכנית בווטסאפ</li>
                  </ul>
                  <button className="btn btn-primary" style={{width: '100%'}} onClick={() => navigate('/register')}>
                    התחילו את תקופת הניסיון
                  </button>
                </div>
              </div>
            </div>
        </section>

        <footer className="lp-footer">
          <div className="footer-bottom">
            © {new Date().getFullYear()} FiTime. כל הזכויות שמורות.
          </div>
        </footer>
      </div>
    </>
  );
}

export default HomePage;