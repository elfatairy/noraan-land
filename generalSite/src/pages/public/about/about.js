import React from 'react';
import './about.css';

const about = () => {
  return (
    <div className="about">
      <div className="top">
        <img src='./images/icon3.png' />
        <h2>About Us</h2>
        <div className='breadcrumb'>
          <a href="/">Home</a>
          <span className='slash'>/</span>
          <span className='colored'>About Us</span>
        </div>
      </div>

      <div className='block1'>
        <div className='left'>
          <h4>Introduction</h4>
          <h3>Welcome to Noraan Land</h3>
          <p>In a world where knowledge is the key to understanding, our platform serves as a gateway for Muslims seeking to deepen their connection with Islam. We offer structured online courses in Quran recitation, Tajweed, and Islamic studies, making learning accessible to all—especially children. Through interactive Zoom sessions and recorded lessons, students can embark on a journey of faith with expert guidance, fostering a love for the Quran and Islamic teachings.</p>
        </div>
        <div className='right'>
          <div className='block'>
            <h4>My Experience</h4>
            <p>Forming an executive committee for the Regina City Jamia Masjid is crucial for effective governance, decision-making, and community representation. The committee plays a pivotal role in overseeing various aspects of the mosque’s operations, including finances, events, and outreach, ensuring that the needs and interests of the Muslim community are addressed comprehensively.</p>
          </div>
          <div className='block'>
            <h4>Our Services</h4>
            <p>We provide Arabic and Islamic studies courses for all ages, including Tajweed and Quran memorization. Students can choose private or group lessons and start with a free assessment session. Classes are conducted live on Zoom, with recordings, study materials, quizzes, and progress reports after each lesson.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default about;