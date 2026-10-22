import React from 'react';

const AboutPage: React.FC = () => {
  return (
    <div className="about-page">
      <div className="hero">
        <h1>About RATE YOUR LANDLORD</h1>
        <p className="hero__subtitle">A community-driven platform for [insert location here] tenants</p>
      </div>

      <div className="about-sections">
        <section>
          <h2>Our Mission</h2>
          <p>
            [insert your own mission here]

          </p>
        </section>

        <section>
          <h2>How It Works</h2>
          <p>
            The site is easy and simple to use: it’s Rate My Professor, but for your landlord. Give your landlord a letter grade and read testimonies from your neighbors. The information collected will remain totally anonymous and secure. 
          </p>
        </section>


        <section>
          <h2>Get Involved</h2>
          <p>
            Know a landlord who isn't listed yet? Add them. Had a recent experience worth sharing? Write a review. The more people participate, the more useful this platform becomes for tenants. You can email us at <a href="mailto:[insert email here]">[insert email here]</a>.
          </p>
        </section>
      </div>
    </div>
  );
};

export default AboutPage;
