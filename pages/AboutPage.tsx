import React from 'react';
import { siteSettings } from '../siteSettings';

const AboutPage: React.FC = () => {
  const schoolNames = siteSettings.schools.map(s => s.name).join(' and ');

  return (
    <div className="about-page">
      <div className="hero">
        <h1>About {siteSettings.siteName}</h1>
        <p className="hero__subtitle">A student-run platform for {schoolNames} students and {siteSettings.city} renters</p>
      </div>

      <div className="about-sections">
        <section>
          <h2>Our Mission</h2>
          <p>
            Bad landlords count on staying anonymous. When nobody knows their track record, they can neglect
            repairs, ignore tenants, and squeeze out as much rent as they can. {siteSettings.siteName} gives
            renters the information they need to make informed housing decisions and to hold landlords accountable.
          </p>
        </section>

        <section>
          <h2>Where We're Starting</h2>
          {siteSettings.schools.map(school => (
            <p key={school.name}>
              <strong>{school.name}:</strong>{' '}
              {school.focusAreas.length > 0
                ? `we're focusing first on ${school.focusAreas.map(a => a.name).join(' and ')}.`
                : `reviews from anywhere students rent are welcome.`}
            </p>
          ))}
        </section>

        <section>
          <h2>How It Works</h2>
          <p>
            It's Rate My Professor, but for your landlord. Grade your landlord and your building, and read what
            your neighbors have to say about maintenance, communication, respect, and rent. Reviews are anonymous.
          </p>
        </section>

        <section>
          <h2>Who We Are</h2>
          <p>
            Rate Your Landlord started with student organizers at the University of Pittsburgh. More Perfect
            University, the campus program of More Perfect Union, has since helped students launch it at other
            schools and released the software as open source. This {siteSettings.city} site is run by students
            here.
          </p>
        </section>

        <section>
          <h2>Get Involved</h2>
          <p>
            Know a landlord who isn't listed yet? Add them. Had a recent experience worth sharing? Write a review. The more people participate, the more useful this platform becomes for tenants. You can email us at <a href="mailto:[insert email here]">[insert email here]</a>.
          </p>
        </section>
      </div>
    </div>
  );
};

export default AboutPage;
