import React, { useEffect, useState } from "react";
import "./home.css";
import { useGetCourses } from "../../../hooks/getcourseshook";
import { toast } from "react-toastify";
import Loading from "../../../components/loading/loading";
import { CourseCard } from "../../../components/courseCard/courseCard";

const Hero = () => {
  return (
    <div className="hero">
      <div className="hero-top">
        <div className="container">
          <div className="text">
            <h1>Nooran </h1>
            <p>Here is your start in the arabic and islamic studies</p>
            <a href="/courses" className="button">
              <div className="icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M18.18 8.03933L18.6435 7.57589C19.4113 6.80804 20.6563 6.80804 21.4241 7.57589C22.192 8.34374 22.192 9.58868 21.4241 10.3565L20.9607 10.82M18.18 8.03933C18.18 8.03933 18.238 9.02414 19.1069 9.89309C19.9759 10.762 20.9607 10.82 20.9607 10.82M18.18 8.03933L13.9194 12.2999C13.6308 12.5885 13.4865 12.7328 13.3624 12.8919C13.2161 13.0796 13.0906 13.2827 12.9882 13.4975C12.9014 13.6797 12.8368 13.8732 12.7078 14.2604L12.2946 15.5L12.1609 15.901M20.9607 10.82L16.7001 15.0806C16.4115 15.3692 16.2672 15.5135 16.1081 15.6376C15.9204 15.7839 15.7173 15.9094 15.5025 16.0118C15.3203 16.0986 15.1268 16.1632 14.7396 16.2922L13.5 16.7054L13.099 16.8391M13.099 16.8391L12.6979 16.9728C12.5074 17.0363 12.2973 16.9867 12.1553 16.8447C12.0133 16.7027 11.9637 16.4926 12.0272 16.3021L12.1609 15.901M13.099 16.8391L12.1609 15.901"
                    stroke="#db9e30"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M8 13H10.5"
                    stroke="#db9e30"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M8 9H14.5"
                    stroke="#db9e30"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M8 17H9.5"
                    stroke="#db9e30"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M3 14V10C3 6.22876 3 4.34315 4.17157 3.17157C5.34315 2 7.22876 2 11 2H13C16.7712 2 18.6569 2 19.8284 3.17157M21 14C21 17.7712 21 19.6569 19.8284 20.8284M4.17157 20.8284C5.34315 22 7.22876 22 11 22H13C16.7712 22 18.6569 22 19.8284 20.8284M19.8284 20.8284C20.7715 19.8853 20.9554 18.4796 20.9913 16"
                    stroke="#db9e30"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <span>Go to enroll</span>
            </a>
          </div>
          <div className="img">
            <img src="./images/drkpinkTeacher.png" style={{width:'650px'}} alt=""/>
          </div>
        </div>
        <img src="./images/masjed_bg_overlay.png" className="overlay-image" alt="" />
      </div>
      <div className="hero-bottom" />
    </div>
  );
};

const Us = () => {
  return (
    <div className="us">
      <div className="container">
        <div className="us-header">
          <h3>WELCOME TO NORAAN LAND</h3>
          <h2>Who are we?</h2>
        </div>
        <div className="content">
          <div className="left">
            <p>
              In a world where knowledge is the key to understanding, our
              platform serves as a gateway for Muslims seeking to deepen their
              connection with Islam. We offer structured online courses in Quran
              recitation, Tajweed, and Islamic studies, making learning
              accessible to all—especially children. Through interactive Zoom
              sessions and recorded lessons, students can embark on a journey of
              faith with expert guidance, fostering a love for the Quran and
              Islamic teachings.
            </p>
            <a className="button" href="./about">
              Read More
            </a>
          </div>
          <ul className="right">
            <li>
              <img src="./images/icon1.png" alt=""/>
              <div>
                <h4>Our Vision</h4>
                <p>
                  To be a leading online hub for Islamic education, nurturing a
                  strong, knowledgeable, and spiritually connected Muslim
                  community.
                </p>
              </div>
            </li>
            <li>
              <img src="./images/icon2.png" alt=""/>
              <div>
                <h4>Our Mission</h4>
                <p>
                  To provide accessible, high-quality Islamic education through
                  engaging live classes and recorded lessons, empowering
                  students of all ages to build a deeper understanding of their
                  faith and apply it in their daily lives.
                </p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

const SomeCourses = () => {
  const [courses, setCourses] = useState([]);
  const { execute: getCourses, isLoading: isLoadingGet } = useGetCourses();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await getCourses();
      setCourses(response.data.courses.slice(0, 3));
    } catch (error) {
      toast.error("Failed to fetch courses");
    }
  };

  if (isLoadingGet) {
    return <Loading isVisible={true} />;
  }

  return (
    <div className="courses">
      <div className="container">
        <h2>Our Top Courses</h2>
        <div className="content">
          {courses.map((course) => (
            <CourseCard course={course} />
          ))}
        </div>
      </div>
    </div>
  );
};

const Testimonials = () => {
  return (
    <div className="testimonials">
      <div className="container">
        <h2>Hear From Our Satisfied Students</h2>
        <div className="content">
          <div className="left">
            <video controls>
              <source src="./testimonials.mp4" type="video/mp4" />
            </video>
          </div>
          <div className="right">
            <div className="testimonial">
              <p>
                Nouran is a great teacher. She always has a smile on her face
                and learning with her is fun. I have been learning to read Quran
                with tajweed with her for only a couple of months and I have
                learnt so much already. She explains what I have read to her in
                arabic. This way I am also learning the Arabic language. I
                always look forward to my lessons with her.
              </p>
              <div className="citation">
                <h3>― Iffat</h3>
              </div>
            </div>
            <div className="testimonial">
              <p>
                It has been a pleasure to let Nurān teach my daughter Arabic.
                From the very beginning, her teaching style has been engaging,
                effective, and tailored to the needs of my child. <br />
                Not only does she teach well, I have noticed that my daughter
                looks forward to her classes and is very comfortable with the
                presence of her teacher. <br /> One of the things I have noticed
                is her ability to make learning both enjoyable and interactive.
                She has a remarkable way of keeping my daughter engaged,
                encouraging her curiosity, and making lessons fun and
                interesting. The progress my daughter has made under her
                guidance has been remarkable, not just in her language skills
                but also in her confidence in using Arabic. <br /> Nurān is
                patient, dedicated, and passionate about teaching. For someone
                so young, she has great engagement and connection with children.{" "}
                <br /> I wholeheartedly recommend her to anyone looking for a
                skilled and inspiring Arabic teacher. Her dedication to her
                students' success is truly commendable, and I am grateful for
                the positive impact she is having on my daughter.
              </p>
              <div className="citation">
                <h3>― Hajar's mum</h3>
              </div>
            </div>
            <div className="testimonial">
              <p>
                As salamu alaykum, I wanted to say how amazing the lessons have
                been. I’ve found it extremely helpful in terms of getting better
                in my reading and learning rules, as well also being able to
                memorise the Quran. The perks are also being explained, the
                surah and when they were sent down to the prophet (saw), which
                is also beautiful to learn while learning the Quran. May Allah
                bless this teacher in abundance. Ameen.
              </p>
              <div className="citation">
                <h3>― Muna</h3>
              </div>
            </div>
            <div className="testimonial">
              <p>
                Assalamou Aleykoum. Here’s my “feedback”. I hope that helps 😊
                I’m not sure if the word “ustadha” is correct though 😅 <br />
                “Learning with Ustadha نوران is one of the best decisions I’ve
                made in a long time. Her approach makes it easy to learn without
                being scared of making mistakes. I’m not only improving in my
                Quran memorization journey but am also understanding verses and
                their context or meaning along the way. <br />
                Thank you for all you do. May Allah reward you for all your
                efforts! Amine{" "}
              </p>
              <div className="citation">
                <h3>― Fatoumata</h3>
              </div>
            </div>
            <div className="testimonial">
              <p>
                Noorān is an amazing teacher, and I really enjoy her way of
                teaching. I've improved a lot in my Arabic skills because of
                her. She is confident, experienced, and knows how to make
                learning easy and effective. I really appreciate her
                teaching methods
              </p>
              <div className="citation">
                <h3>― Fatima</h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const home = () => {
  return (
    <div className="home">
      <Hero />
      <Us />
      <SomeCourses />
      <Testimonials />
    </div>
  );
};

export default home;
