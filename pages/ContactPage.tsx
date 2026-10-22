import React from 'react';

const ContactPage: React.FC = () => {
  return (
    <div className="content-page">
      <h1>Contact Us</h1>
      <p>
        If you have any questions, feedback, or need assistance, please feel free to reach out to us. We value your input and are here to help!
      </p>
      <h2>Email</h2>
      <p>
        You can email us at{' '}
        <a href="mailto:[insert email]">[insert email]</a>.
      </p>
    </div>
  );
};

export default ContactPage;
